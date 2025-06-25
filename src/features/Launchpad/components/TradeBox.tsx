import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Flex, Button, Text, useColorMode, CircularProgress } from '@chakra-ui/react'
import { NumericFormat } from 'react-number-format'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { colors } from '@/theme/cssVariables/colors'
import { detectedSeparator, formatCurrency, trimTrailZero } from '@/utils/numberish/formatter'
import { SegmentedButton, OrderSide } from '@/components/SegmentedButton'
import { SlippageAdjuster } from './SlippageAdjuster'
import { SlippageAdjuster as SwapSlippageAdjuster } from '@/components/SlippageAdjuster'
import TokenAvatar from '@/components/TokenAvatar'
import { useEvent } from '@/hooks/useEvent'
import { Curve } from '@raydium-io/raydium-sdk-v2'
import { LaunchpadConfigInfo, LaunchpadPoolInfo } from '@/hooks/launchpad/usePoolRpcInfo'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import { useLaunchpadStore, useTokenAccountStore } from '@/store'
import shallow from 'zustand/shallow'
import { useDisclosure } from '@/hooks/useDelayDisclosure'
import { MintInfo } from '../type'
import { DEFAULT_SOL_RESERVER } from '@/components/TokenInput'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import useCheckToken from '@/hooks/launchpad/useCheckToken'
import useSwap from '@/features/Swap/useSwap'
import { NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { useSwapStore } from '@/features/Swap/useSwapStore'
import { ApiSwapV1OutSuccess } from '@/features/Swap/type'
import { useTranslation } from 'react-i18next'
import BalanceWalletIcon from '@/icons/misc/BalanceWalletIcon'
import IntervalCircle, { IntervalCircleHandler } from '@/components/IntervalCircle'
import ConnectedButton from '@/components/ConnectedButton'
import { isSolWSol } from '@/utils/token'
import { useLaunchPadShareInfo } from '../utils'
import { ToLaunchPadConfig } from '@/hooks/launchpad/utils'

export default function TradeBox({
  poolInfo,
  mintInfo,
  mintBInfo,
  configInfo,
  onChain,
  isMigrating,
  isLanded
}: {
  poolInfo?: LaunchpadPoolInfo & { fake?: boolean }
  mintInfo?: MintInfo
  mintBInfo?: ApiV3Token
  configInfo?: LaunchpadConfigInfo
  onChain: boolean
  isMigrating?: boolean
  isLanded?: boolean
}) {
  const thousandSeparator = useMemo(() => (detectedSeparator === ',' ? '.' : ','), [])
  const { isOpen: isSending, onOpen: onSending, onClose: offSending } = useDisclosure()
  const { t, i18n } = useTranslation()
  const { checkToken } = useCheckToken()
  const { isOpen: isLoading, onOpen: onLoading, onClose: offLoading } = useDisclosure()
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const [createAndBuyAct, buyAct, sellAct, slippage] = useLaunchpadStore(
    (s) => [s.createAndBuyAct, s.buyAct, s.sellAct, s.slippage],
    shallow
  )
  const { wallet, shareFeeRate } = useLaunchPadShareInfo()
  const swapTokenAct = useSwapStore((s) => s.swapTokenAct)
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'

  const [side, setSide] = useState<OrderSide>(OrderSide.BUY)
  const [mintB, setMintB] = useState<ApiV3Token | undefined>() // future might have USDC
  const [amount, setAmount] = useState<{ amountIn: string; amountOut: string; minAmountOut: string }>({
    amountIn: '',
    amountOut: '',
    minAmountOut: ''
  })

  useEffect(() => {
    setMintB(mintBInfo)
  }, [mintBInfo?.address])
  const mintAInfo = useMemo(
    () =>
      mintInfo
        ? { symbol: mintInfo.symbol, decimals: Number(mintInfo.decimals), address: mintInfo.mint, logoURI: mintInfo.imgUrl }
        : undefined,
    [mintInfo]
  )
  const refreshCircleRef = useRef<IntervalCircleHandler>(null)

  const mintABalance = mintInfo
    ? getTokenBalanceUiAmount({ mint: mintInfo?.mint, decimals: Number(mintInfo.decimals) }).amount
    : new Decimal(0)

  const mintBalance = mintB?.address
    ? getTokenBalanceUiAmount({ mint: mintB.address, decimals: mintBInfo?.decimals })
        .amount.sub(configInfo?.mintB.equals(NATIVE_MINT) ? DEFAULT_SOL_RESERVER : 0)
        .clamp(0, Number.MAX_SAFE_INTEGER)
    : new Decimal(0)

  const isMintCreated = onChain || mintABalance.gt(0)
  const [symbolA, symbolB] = [mintInfo?.symbol, mintB?.symbol]
  const [mintADecimal, mintBDecimal] = [Number(mintInfo?.decimals ?? 6), mintB?.decimals ?? 9]

  const isBuy = side === OrderSide.BUY
  const isFixedValue = isBuy && mintBInfo && isSolWSol(mintBInfo?.address)

  const [inputMint, outputMint] = [
    mintInfo ? (isBuy ? mintBInfo?.address : mintInfo.mint) : undefined,
    mintInfo ? (isBuy ? mintInfo.mint : mintBInfo?.address) : undefined
  ]
  const [inputDecimal, outputDecimal] = isBuy ? [9, Number(mintInfo?.decimals ?? 6)] : [Number(mintInfo?.decimals ?? 6), 9]

  const {
    response,
    data: swapData,
    mutate,
    isLoading: swapLoading,
    isValidating: swapValidating,
    error
  } = useSwap({
    shouldFetch: !!isLanded && !!mintInfo && !!amount.amountIn,
    amount: new Decimal(amount.amountIn || '0').mul(10 ** inputDecimal).toString(),
    inputMint,
    outputMint,
    swapType: 'BaseIn'
  })

  const balanceNotEnough = new Decimal(amount.amountIn || 0).gt(isBuy ? mintBalance : mintABalance)
    ? t('error.balance_not_enough')
    : undefined
  const swapError = (error && i18n.exists(`swap.error_${error}`) ? t(`swap.error_${error}`) : error) || balanceNotEnough

  useEffect(() => {
    if (!isLanded) return
    setAmount((prev) => ({
      ...prev,
      amountOut: swapData ? new Decimal(swapData.outputAmount).div(10 ** outputDecimal).toString() : '',
      minAmountOut: swapData ? new Decimal(swapData.otherAmountThreshold).div(10 ** outputDecimal).toString() : ''
    }))
  }, [swapData?.outputAmount, isLanded, isBuy, outputDecimal])

  const calculateAnother = useEvent((val: string, side: OrderSide) => {
    const isBuy = side === OrderSide.BUY
    if (!poolInfo || !configInfo || isMigrating) return { amount: '', mintAmount: '' }
    if (isBuy) {
      const result = Curve.buyExactIn({
        poolInfo,
        amountB: new BN(new Decimal(val).mul(10 ** mintBDecimal).toFixed(0)),
        protocolFeeRate: configInfo.tradeFeeRate,
        platformFeeRate: new BN(mintInfo?.platformInfo.feeRate ?? 0),
        curveType: configInfo.curveType,
        shareFeeRate
      })

      return {
        amount: trimTrailZero(new Decimal(result.amountA.toString()).div(10 ** mintADecimal).toFixed(mintADecimal)) ?? '',
        mintAmount:
          trimTrailZero(
            new Decimal(result.amountA.toString())
              .div(10 ** mintADecimal)
              .mul(1 - slippage)
              .toFixed(mintADecimal)
          ) ?? ''
      }
    }

    const result = Curve.sellExactIn({
      poolInfo,
      amountA: new BN(new Decimal(val).mul(10 ** mintADecimal).toFixed(0)),
      protocolFeeRate: configInfo.tradeFeeRate,
      platformFeeRate: new BN(mintInfo?.platformInfo.feeRate ?? 0),
      curveType: configInfo.curveType,
      shareFeeRate
    })

    return {
      amount: trimTrailZero(new Decimal(result.amountB.toString()).div(10 ** mintBDecimal).toFixed(mintBDecimal)) ?? '',
      mintAmount:
        trimTrailZero(
          new Decimal(result.amountB.toString())
            .div(10 ** mintBDecimal)
            .mul(1 - slippage)
            .toFixed(mintBDecimal)
        ) ?? ''
    }
  })

  const handleClickMax = useEvent(() => {
    const amountIn = (isBuy ? mintBalance : mintABalance).toString()
    const amountOutRes = calculateAnother(amountIn, side)
    setAmount((prev) => ({
      amountIn,
      amountOut: isLanded ? prev.amountOut : amountOutRes.amount,
      minAmountOut: isLanded ? prev.minAmountOut : amountOutRes.mintAmount
    }))
  })

  const handleClickAmount = useEvent((val: string) => {
    if (isMigrating) return
    const amountOutRes = calculateAnother(val, side)
    setAmount((prev) => ({
      amountIn: val,
      amountOut: isLanded ? prev.amountOut : amountOutRes.amount,
      minAmountOut: isLanded ? prev.minAmountOut : amountOutRes.mintAmount
    }))
  })
  const handleClickSubmit = async () => {
    if (isBuy && !isMintCreated) {
      const r = await checkToken({ checkTime: true })
      if (!r) return
    }
    if (!mintInfo || !configInfo || !mintBInfo) return

    onLoading()
    try {
      const onConfirmed = () => setAmount({ amountIn: '', amountOut: '', minAmountOut: '' })
      if (isBuy) {
        if (!isMintCreated) {
          await createAndBuyAct({
            mint: mintInfo.mint,
            uri: mintInfo.metadataUrl,
            name: mintInfo.name,
            symbol: mintInfo.symbol,
            decimals: Number(mintInfo.decimals),
            mintBInfo: mintInfo.mintB,
            buyAmount: new BN(new Decimal(amount.amountIn || 0).mul(10 ** mintBDecimal).toFixed(0)),
            slippage: new BN((slippage * 10000).toFixed(0)),
            migrateType: mintInfo.migrateType,
            shareFeeReceiver: wallet,
            configInfo: ToLaunchPadConfig(mintInfo.configInfo),
            configId: mintInfo.configId,
            platformFeeRate: new BN(mintInfo.platformInfo.feeRate),
            totalSellA: new BN(mintInfo.totalSellA),
            totalFundRaisingB: new BN(mintInfo.totalFundRaisingB),

            onConfirmed,
            onFinally: offLoading
          })
          return
        }
        await buyAct({
          mintInfo,
          buyAmount: new BN(new Decimal(amount.amountIn || 0).mul(10 ** mintBDecimal).toFixed(0)),
          minMintAAmount: new BN(new Decimal(amount.minAmountOut || 0).mul(10 ** mintADecimal).toFixed(0)),
          mintB: configInfo.mintB,
          mintBDecimals: mintBInfo.decimals,

          slippage: new BN((slippage * 10000).toFixed(0)),
          shareFeeReceiver: wallet,

          configInfo: ToLaunchPadConfig(mintInfo.configInfo),
          platformFeeRate: new BN(mintInfo.platformInfo.feeRate),
          onConfirmed,
          onFinally: offLoading
        })
        return
      }
      await sellAct({
        mintInfo,
        sellAmount: new BN(new Decimal(amount.amountIn || 0).mul(10 ** mintADecimal).toFixed(0)),
        minAmountB: new BN(new Decimal(amount.amountOut || 0).mul(10 ** mintBDecimal).toFixed(0)),
        mintB: configInfo.mintB,
        mintBDecimals: mintBInfo.decimals,
        slippage: new BN((useSwapStore.getState().slippage * 10000).toFixed(0)),
        shareFeeReceiver: wallet,
        configInfo: ToLaunchPadConfig(mintInfo.configInfo),
        platformFeeRate: new BN(mintInfo.platformInfo.feeRate),
        onConfirmed,
        onFinally: offLoading
      })
    } catch (e: any) {
      toastSubject.next({ status: 'error', title: `${isBuy ? 'Buy' : 'Sell'} Token Error`, description: e.message })
    }
    offLoading()
  }

  const handleClickSwap = async () => {
    if (!response || !isLanded) return
    onSending()

    await swapTokenAct({
      swapResponse: response as ApiSwapV1OutSuccess,
      inputMint:
        mintInfo && response.data?.inputMint === mintInfo?.mint
          ? {
              chainId: 101,
              address: mintInfo.mint,
              programId: TOKEN_PROGRAM_ID.toBase58(),
              logoURI: mintInfo.imgUrl,
              symbol: mintInfo.symbol,
              name: mintInfo.name,
              decimals: parseFloat(mintInfo.decimals),
              tags: [],
              extensions: {}
            }
          : response.data?.inputMint === mintBInfo?.address
          ? mintBInfo
          : undefined,
      outputMint:
        mintInfo && response.data?.outputMint === mintInfo?.mint
          ? {
              chainId: 101,
              address: mintInfo.mint,
              programId: TOKEN_PROGRAM_ID.toBase58(),
              logoURI: mintInfo.imgUrl,
              symbol: mintInfo.symbol,
              name: mintInfo.name,
              decimals: parseFloat(mintInfo.decimals),
              tags: [],
              extensions: {}
            }
          : response.data?.outputMint === mintBInfo?.address
          ? mintBInfo
          : undefined,
      wrapSol: isSolWSol(inputMint),
      unwrapSol: isSolWSol(outputMint),
      onCloseToast: offSending,
      onConfirmed: () => {
        setAmount({ amountIn: '', amountOut: '', minAmountOut: '' })
        // setNeedPriceUpdatedAlert(false)
        offSending()
      },
      onError: () => {
        offSending()
        mutate()
      }
    })
    offSending()
  }

  useEffect(() => {
    if (!poolInfo || isLanded) return
    setAmount((values) => {
      if (values.amountIn) {
        const amountResult = calculateAnother(values.amountIn, side)
        return {
          ...values,
          amountOut: amountResult.amount,
          minAmountOut: amountResult.mintAmount
        }
      }
      return values
    })
  }, [poolInfo, configInfo, isLanded, slippage])

  const handleClickRefresh = useEvent(() => {
    refreshCircleRef.current?.restart()
    mutate()
  })
  // const handleSelectToken = useEvent((token: TokenInfo) => {
  //   setToken(token)
  //   onClose()
  // })

  return (
    <Box
      background={['transparent', isLight ? '#F5F8FF' : '#ABC4FF14']}
      p={4}
      borderRadius={['24px', '4px']}
      sx={
        isLight
          ? {
              border: '1px solid #BFD2FF80'
            }
          : {}
      }
    >
      <Box px="1.875rem">
        <SegmentedButton
          buttons={[
            {
              label: 'Buy',
              value: OrderSide.BUY
            },
            {
              label: 'Sell',
              value: OrderSide.SELL
            }
          ]}
          onChange={(value) => {
            const side = value as OrderSide
            setSide(side)
            setAmount({
              amountIn: '',
              amountOut: '',
              minAmountOut: ''
            })
          }}
          value={side}
        />
      </Box>
      <Flex mt={5} mb={3} justifyContent="space-between">
        <Text color={colors.lightPurple}>Amount</Text>
        <Flex alignItems="center" gap="1">
          <BalanceWalletIcon color={colors.textTertiary} />
          <Text
            onClick={handleClickMax}
            cursor="pointer"
            textDecoration={'underline'}
            textDecorationThickness={'.5px'}
            transition={'300ms'}
            color={colors.textTertiary}
            sx={{ textUnderlineOffset: '1px' }}
            _hover={{ textDecorationThickness: '1.5px', textUnderlineOffset: '2px' }}
          >
            {formatCurrency(isBuy ? mintBalance : mintABalance, { decimalPlaces: mintB?.decimals })}
          </Text>
          {isLanded ? <SwapSlippageAdjuster /> : <SlippageAdjuster />}
        </Flex>
      </Flex>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        borderRadius="12px"
        background={colors.backgroundDark}
        width="100%"
        height="3.75rem"
        overflow="hidden"
        gap={2}
        px={4}
        mb={3}
        opacity={isMigrating ? 0.5 : 1}
      >
        <NumericFormat
          inputMode="decimal"
          value={amount.amountIn}
          autoComplete="off"
          disabled={isMigrating}
          min={0}
          onValueChange={(data: { value: string; formattedValue: string }) => {
            const value = data.value.indexOf('.') === 0 ? `0${data.value}` : data.value
            if (!poolInfo && !isLanded) {
              setAmount({ amountIn: value, amountOut: '', minAmountOut: '' })
              return
            }
            if (!data.value) {
              setAmount({ amountIn: '', amountOut: '', minAmountOut: '' })
              return
            }
            setAmount((prev) => {
              const amountResult = calculateAnother(value, side)
              return {
                amountIn: value,
                amountOut: isLanded ? prev.amountOut : amountResult.amount,
                minAmountOut: isLanded ? prev.minAmountOut : amountResult.mintAmount
              }
            })
          }}
          decimalSeparator={detectedSeparator}
          thousandSeparator={thousandSeparator}
          allowedDecimalSeparators={['.', ',']}
          decimalScale={isBuy ? mintB?.decimals ?? 9 : mintAInfo?.decimals ?? 6}
          allowNegative={false}
          allowLeadingZeros={false}
          autoFocus={true}
          valueIsNumericString
          placeholder=""
          style={{
            background: colors.backgroundDark,
            fontWeight: '500',
            fontSize: '20px',
            lineHeight: '26px',
            flex: 1,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            minWidth: 0,
            border: 'none'
          }}
        />
        <Flex
          alignItems="center"
          color={colors.lightPurple}
          fontWeight={500}
          background={colors.backgroundLight}
          rounded={12}
          p={2}
          gap={1}
        >
          <TokenAvatar token={isBuy ? mintB : mintAInfo} size="smi" />
          <Text fontWeight="medium">{isBuy ? symbolB : symbolA}</Text>
        </Flex>
      </Flex>
      <Flex justify="flex-start" alignItems={'center'} gap={2}>
        <Button
          size="xs"
          variant="outline"
          color={isLight ? '#474ABB' : '#BFD2FF'}
          opacity={0.5}
          background="#ABC4FF1F"
          borderRadius="4px"
          border="none"
          onClick={() => handleClickAmount(isFixedValue ? '0.1' : mintABalance.mul(0.25).toString())}
        >
          {isFixedValue ? '0.1 SOL' : '25%'}
        </Button>
        <Button
          size="xs"
          variant="outline"
          color={isLight ? '#474ABB' : '#BFD2FF'}
          opacity={0.5}
          background="#ABC4FF1F"
          borderRadius="4px"
          border="none"
          onClick={() => handleClickAmount(isFixedValue ? '0.5' : mintABalance.mul(0.5).toString())}
        >
          {isFixedValue ? '0.5 SOL' : '50%'}
        </Button>
        <Button
          size="xs"
          variant="outline"
          color={isLight ? '#474ABB' : '#BFD2FF'}
          opacity={0.5}
          background="#ABC4FF1F"
          borderRadius="4px"
          border="none"
          onClick={() => handleClickAmount(isFixedValue ? '1' : mintABalance.mul(0.75).toString())}
        >
          {isFixedValue ? '1 SOL' : '75%'}
        </Button>
        <Button
          size="xs"
          variant="outline"
          color={isLight ? '#474ABB' : '#BFD2FF'}
          opacity={0.5}
          background="#ABC4FF1F"
          borderRadius="4px"
          border="none"
          onClick={() => handleClickAmount(isBuy ? mintBalance.toString() : mintABalance.toString())}
        >
          Max
        </Button>
        {isLanded && amount.amountIn ? (
          <IntervalCircle
            componentRef={refreshCircleRef}
            duration={30 * 1000}
            svgWidth={18}
            strokeWidth={2}
            trackStrokeColor={colors.secondary}
            trackStrokeOpacity={0.5}
            filledTrackStrokeColor={colors.secondary}
            onClick={swapLoading || swapValidating ? undefined : handleClickRefresh}
            onEnd={mutate}
          />
        ) : null}
      </Flex>
      {balanceNotEnough || (isLanded && swapError) ? (
        <Text variant="error" mt="2">
          {isLanded ? swapError : balanceNotEnough}
        </Text>
      ) : null}
      <Box my={5} color={isLight ? '#000248' : colors.lightPurple}>
        <Text>
          <Text as="span" color={isLight ? '#474ABB' : '#BFD2FF80'} pr={1}>
            You receive:
          </Text>
          {amount.amountOut || '--'} {isBuy ? symbolA : symbolB}
        </Text>
        <Text>
          <Text as="span" color={isLight ? '#474ABB' : '#BFD2FF80'} pr={1}>
            (Minimum received:
          </Text>
          {amount.minAmountOut || '--'} {isBuy ? symbolA : symbolB}
          <Text as="span" color={isLight ? '#474ABB' : '#BFD2FF80'} pr={1}>
            )
          </Text>
        </Text>
      </Box>
      <Text variant="error" my="-2" mb="2">
        {isMintCreated && poolInfo?.fake ? (
          <Flex gap="1" alignItems="center">
            Loading pool info <CircularProgress isIndeterminate color={colors.semanticError} size="14px" />
          </Flex>
        ) : null}
      </Text>
      <ConnectedButton
        width="100%"
        background={isBuy ? colors.positive : colors.negative}
        _hover={{
          background: isBuy ? colors.positive : colors.negative
        }}
        _disabled={{
          background: `${isBuy ? colors.positive : colors.negative} !important`
        }}
        isLoading={isLoading || swapLoading || swapValidating || isSending}
        isDisabled={
          (isMintCreated && poolInfo?.fake) ||
          isMigrating ||
          new Decimal(amount.amountOut || 0).lte(0) ||
          new Decimal(amount.amountIn || 0).gt(isBuy ? mintBalance : mintABalance) ||
          (!isMintCreated && !isBuy) ||
          (isLanded && swapError)
        }
        onClick={isLanded ? handleClickSwap : handleClickSubmit}
      >
        {isMigrating ? 'Migrating..' : isBuy ? 'Buy' : 'Sell'}
      </ConnectedButton>
    </Box>
  )
}
