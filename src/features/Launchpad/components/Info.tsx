import { useCallback, useEffect, useState } from 'react'
import { Box, Divider, Flex, Grid, Text, Tooltip, useColorMode, useClipboard, Image } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'
import ThreeStageProgress from './ThreeStageProgress'
import { MintInfo } from '../type'
import Decimal from 'decimal.js'
import { formatCurrency } from '@/utils/numberish/formatter'
import { useAppStore } from '@/store'
import { HelpCircle } from 'react-feather'
import CircleCheck from '@/icons/misc/CircleCheck'
import CopyLaunchpadIcon from '@/icons/misc/CopyLaunchpadIcon'
import { encodeStr } from '@/utils/common'
import { addPoolListener, removePoolListener } from '@/components/TradingView/streaming'
import { Curve, LaunchpadPoolInfo } from '@raydium-io/raydium-sdk-v2'
import dayjs from 'dayjs'
import { CurveLineChart, Point } from './Charts/CurveLineChart'
import { wSolToSolString } from '@/utils/token'
import QuestionCircleIcon from '@/icons/misc/QuestionCircleIcon'
import TokenAvatar from '@/components/TokenAvatar'
import { getDurationUText } from '@/utils/time'
import { getImgProxyUrl } from '@/utils/url'
import ExternalLink from '@/icons/misc/ExternalLink'
import { SocialLinks } from './SocialLinks'

export default function Info({
  poolInfo,
  mintInfo,
  marketCap,
  mintBPrice,
  isLanded,
  refreshMintInfo
}: {
  poolInfo?: LaunchpadPoolInfo
  mintInfo?: MintInfo
  marketCap?: {
    currentMarketCap: Decimal
    marketCapRange: Decimal[]
  }
  mintBPrice?: number
  isLanded: boolean
  refreshMintInfo?: () => void
}) {
  const [finishRate, setFinishRate] = useState(mintInfo?.finishingRate ?? 0)
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const explorerUrl = useAppStore((s) => s.explorerUrl)
  const { onCopy: copy, hasCopied } = useClipboard(mintInfo ? mintInfo.mint : '')
  const [points, setPoints] = useState<Point[]>([])
  const isLoading = !mintBPrice

  const hasMintInfo = !!mintInfo
  useEffect(() => {
    if (!hasMintInfo) return
    setFinishRate((rate) => rate || mintInfo.finishingRate)
  }, [hasMintInfo])

  const generatePoints = useCallback(
    ({ poolInfo, mintInfo }: { poolInfo: LaunchpadPoolInfo; mintInfo: MintInfo }) => {
      try {
        const price = Curve.getPrice({
          poolInfo,
          curveType: mintInfo.configInfo.curveType,
          decimalA: Number(mintInfo.decimals),
          decimalB: mintInfo.mintB.decimals
        })

        if (!mintBPrice) {
          return
        }
        const points: Point[] = Curve.getPoolCurvePointByPoolInfo({
          curveType: mintInfo.configInfo.curveType,
          pointCount: 40,
          poolInfo
        }).map((p) => ({
          x: p.totalSellSupply,
          y: p.price
            .mul(poolInfo.supply.toString())
            .div(10 ** poolInfo.mintDecimalsA)
            .mul(mintBPrice)
            .toNumber()
        }))

        const currentMarketCap = price
          .mul(poolInfo.supply.toString())
          .div(10 ** poolInfo.mintDecimalsA)
          .mul(mintBPrice)
          .toNumber()
        const idx = points.findIndex((p) => new Decimal(currentMarketCap).toDecimalPlaces(2, Decimal.ROUND_DOWN).lte(p.y))
        if (idx !== -1 && points[idx - 1]?.y !== currentMarketCap && points[idx]?.y !== currentMarketCap)
          points.splice(idx, 0, {
            x: points[idx].x,
            y: currentMarketCap,
            current: currentMarketCap
          })
        else if (idx !== -1 && points[idx]?.y === currentMarketCap) points[idx].current = currentMarketCap
        setPoints(points)
      } catch (e) {
        console.error(e)
      }
    },
    [mintBPrice]
  )

  useEffect(() => {
    if (!mintInfo?.poolId || !mintBPrice) return
    const cbk = async (poolInfo: LaunchpadPoolInfo) => {
      const poolPrice = Curve.getPrice({
        poolInfo,
        curveType: mintInfo.configInfo.curveType,
        decimalA: poolInfo.mintDecimalsA,
        decimalB: poolInfo.mintDecimalsB
      }).toNumber()
      const endPrice = Curve.getPoolEndPriceReal({
        poolInfo,
        curveType: mintInfo.configInfo.curveType,
        decimalA: poolInfo.mintDecimalsA,
        decimalB: poolInfo.mintDecimalsB
      }).toNumber()
      const initPrice = Number(
        mintInfo.initPrice ||
          Curve.getPoolInitPriceByPool({
            poolInfo,
            decimalA: poolInfo.mintDecimalsA,
            decimalB: poolInfo.mintDecimalsB,
            curveType: mintInfo.configInfo.curveType
          }).toNumber()
      )
      const _n = poolPrice - initPrice
      const _d = endPrice - initPrice
      const finishingRate = Math.min(_d === 0 ? 0 : _n / _d, 1)
      setFinishRate(new Decimal(finishingRate * 100).toDecimalPlaces(2).toNumber())
      generatePoints({ poolInfo, mintInfo })
    }
    addPoolListener(mintInfo.poolId, cbk)
    return () => removePoolListener(mintInfo.poolId, cbk)
  }, [mintInfo?.poolId, mintBPrice])

  useEffect(() => {
    if (!poolInfo || !mintInfo || !mintBPrice) return
    generatePoints({ poolInfo, mintInfo })
  }, [poolInfo, mintInfo, mintBPrice])

  const needRefresh = (finishRate > 66.6 && !mintInfo?.priceStageTime2) || (finishRate >= 100 && !mintInfo?.priceFinalTime)
  useEffect(() => {
    if (!needRefresh) return
    const timeId = window.setTimeout(() => {
      refreshMintInfo?.()
    }, 1500)
    return () => clearTimeout(timeId)
  }, [needRefresh, refreshMintInfo])

  if (!mintInfo) return null

  const vestingDuration = getDurationUText(Number(mintInfo.unlockPeriod))
  const cliffPeriod = getDurationUText(Number(mintInfo.cliffPeriod))

  return (
    <Box pb={['86px', '20px']}>
      <Box
        background={isLight ? '#F5F8FF' : '#ABC4FF14'}
        px={4}
        py={5}
        borderRadius="4px"
        sx={
          isLight
            ? {
                border: '1px solid #BFD2FF80'
              }
            : {}
        }
      >
        <Grid templateColumns="auto 1fr auto" gap={4} alignItems="center">
          <Image
            src={mintInfo ? getImgProxyUrl(mintInfo.imgUrl, 50) : undefined}
            fallbackSrc={mintInfo?.imgUrl}
            borderRadius="50%"
            width="50px"
            height="50px"
          />
          <Flex direction="column">
            <Flex alignItems="center" gap={1}>
              <Text color={colors.lightPurple} fontWeight="medium" noOfLines={1}>
                {mintInfo.symbol}
              </Text>
            </Flex>
            <Text color={colors.lightPurple} opacity={0.6} fontWeight="medium" noOfLines={1}>
              ({mintInfo.name})
            </Text>
          </Flex>
          <SocialLinks
            twitter={mintInfo.twitter}
            website={mintInfo.website}
            telegram={mintInfo.telegram}
            mint={mintInfo.mint}
            sx={{
              alignSelf: 'flex-start'
            }}
          />
        </Grid>
        <Text color={colors.textSecondary} fontSize="sm" wordBreak="break-word" overflowWrap="break-word" mt={3}>
          {mintInfo.description}
        </Text>
        <Divider my={4} borderColor="#ABC4FF1F" />
        <CurveLineChart
          isLoading={isLoading}
          data={points}
          current={marketCap?.currentMarketCap.toNumber()}
          margin={{ left: -40, right: 20, bottom: -10, top: 20 }}
        />
        <Flex direction="column" gap={1} mt={3}>
          <Text color={colors.textSecondary} fontSize="sm" mb={1}>
            Bonding curve progress: {finishRate}%
          </Text>
          <Box mb={2}>
            <ThreeStageProgress percent={finishRate} />
            <Box position="relative" mt={2}>
              <Flex justify="space-between" fontSize="2xs" mb={2}>
                {/* first */}
                <Flex justifyContent="flex-end" width="33%" pr={2}>
                  {finishRate >= 33.3 ? (
                    <Text maxWidth="5rem" textAlign="right" color={colors.textSecondary}>
                      This token is heating up! 🔥
                    </Text>
                  ) : (
                    <Box>
                      <Text color={colors.textSecondary} textAlign="right">
                        Heating Up at
                      </Text>
                      <Flex justifyContent="flex-end" alignItems="center" gap={1}>
                        <Text>{marketCap ? formatCurrency(marketCap?.marketCapRange[1], { symbol: '$', decimalPlaces: 2 }) : '--'}</Text>
                        <Tooltip
                          hasArrow
                          placement="top"
                          label={`When market cap is above ${
                            marketCap ? formatCurrency(marketCap?.marketCapRange[1], { symbol: '$', decimalPlaces: 2 }) : '--'
                          }, this token will be highlighted when appearing on the main feed.`}
                        >
                          <HelpCircle size={10} color={colors.lightPurple} />
                        </Tooltip>
                      </Flex>
                    </Box>
                  )}
                </Flex>
                {/* middle */}
                <Flex justifyContent="flex-end" width="33%" pr={2}>
                  {finishRate >= 66.6 && mintInfo.priceStageTime2 ? (
                    <Box>
                      <Text maxWidth="5rem" textAlign="right" color={colors.textSecondary}>
                        Caught fire at
                      </Text>
                      <Text>{dayjs(mintInfo.priceStageTime2 * 1000).format('MM/DD HH:mm')}</Text>
                    </Box>
                  ) : (
                    <Box>
                      <Text color={colors.textSecondary} textAlign="right">
                        On Fire! at
                      </Text>
                      <Flex justifyContent="flex-end" alignItems="center" gap={1}>
                        <Text>{marketCap ? formatCurrency(marketCap?.marketCapRange[2], { symbol: '$', decimalPlaces: 2 }) : '--'}</Text>
                        <Tooltip
                          hasArrow
                          placement="top"
                          label={`When market cap reaches ${
                            marketCap ? formatCurrency(marketCap?.marketCapRange[2], { symbol: '$', decimalPlaces: 2 }) : '--'
                          }, this token will be pinned to the top of the main feed until extinguished by another token.`}
                        >
                          <HelpCircle size={10} color={colors.lightPurple} />
                        </Tooltip>
                      </Flex>
                    </Box>
                  )}
                </Flex>

                {/* final */}
                <Flex justifyContent="flex-end" width="33%" pr={2}>
                  {finishRate >= 100 && mintInfo.priceFinalTime ? (
                    <Box>
                      <Text color={colors.textSecondary}>Graduated at</Text>
                      <Flex justifyContent="flex-end" alignItems="center" gap={1}>
                        <Text>{dayjs(mintInfo.priceFinalTime * 1000).format('MM/DD HH:mm')}</Text>
                      </Flex>
                    </Box>
                  ) : (
                    <Box>
                      <Text color={colors.textSecondary}>Graduates at</Text>
                      <Flex justifyContent="flex-end" alignItems="center" gap={1}>
                        <Text>{marketCap ? formatCurrency(marketCap?.marketCapRange[3], { symbol: '$', decimalPlaces: 2 }) : '--'}</Text>
                        <Tooltip
                          hasArrow
                          placement="top"
                          label={`When market cap reaches ${
                            marketCap ? formatCurrency(marketCap?.marketCapRange[3], { symbol: '$', decimalPlaces: 2 }) : '--'
                          }, bonding curve liquidity will migrate to an AMM pool where LP tokens will be burned and trading will continue.`}
                        >
                          <HelpCircle size={10} color={colors.lightPurple} />
                        </Tooltip>
                      </Flex>
                    </Box>
                  )}
                </Flex>
              </Flex>
              {[33.33, 66.66].map((threshold, index) => (
                <Box
                  key={`divider-${index}`}
                  position="absolute"
                  top={0}
                  left={`${threshold}%`}
                  height="2.25rem"
                  transform="translateX(-50%)"
                  borderLeft={`0.5px dashed ${colors.lightPurple} `}
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: '0',
                    left: '-1.25px',
                    width: '2px',
                    height: '2px',
                    borderRadius: '50%',
                    backgroundColor: colors.lightPurple
                  }}
                />
              ))}
              <Box
                position="absolute"
                top={0}
                right="0"
                height="2.25rem"
                borderLeft={`0.5px dashed ${colors.lightPurple} `}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '0',
                  left: '-1.25px',
                  width: '2px',
                  height: '2px',
                  borderRadius: '50%',
                  backgroundColor: colors.lightPurple
                }}
              />
            </Box>
          </Box>
          <Flex justifyContent="space-between">
            <Text color={colors.textSecondary} fontSize="sm">
              Migration threshold:
            </Text>
            <Text color={colors.textSecondary} fontSize="sm">
              {new Decimal(poolInfo?.totalFundRaisingB.toString() ?? 0).div(10 ** mintInfo.mintB.decimals).toString()}{' '}
              {wSolToSolString(mintInfo.mintB.symbol)}
            </Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text color={colors.textSecondary} fontSize="sm">
              Tokens sold on curve:
            </Text>
            <Text color={colors.textSecondary} fontSize="sm">
              {new Decimal(poolInfo?.totalSellA.toString() ?? 0)
                .div(poolInfo?.supply.toString() ?? 1)
                .mul(100)
                .toNumber()}
              %
            </Text>
          </Flex>
        </Flex>
        <Divider my={4} borderColor="#ABC4FF1F" />
        <Flex direction="column" color={colors.textSecondary} fontSize="sm" gap={1}>
          <Flex justifyContent="space-between" alignItems="center">
            Contract address:
            <Flex
              alignItems="center"
              gap={1}
              cursor={hasCopied ? 'default' : 'pointer'}
              onClick={(e) => {
                e.stopPropagation()
                copy()
              }}
            >
              <Text color={colors.textLaunchpadLink} decoration="underline">
                {encodeStr(mintInfo.mint, 5, 3)}
              </Text>
              <Box>
                {hasCopied ? (
                  <CircleCheck width="14px" height="14px" color={colors.textLaunchpadLink} />
                ) : (
                  <CopyLaunchpadIcon width="14px" height="14px" color={colors.textLaunchpadLink} />
                )}
              </Box>
            </Flex>
          </Flex>
          <Flex alignItems="center" justifyContent="space-between" gap={1}>
            Curve Type:
            <Text>
              {mintInfo.configInfo.curveType === 0
                ? 'Constant Product Curve'
                : mintInfo.configInfo.curveType === 1
                ? 'Fixed Product Curve'
                : mintInfo.configInfo.curveType === 2
                ? 'Linear Product Curve'
                : 'Constant Product Curve'}
            </Text>
          </Flex>
          <Flex alignItems="center" justifyContent="space-between" gap={1}>
            Trade Fee:
            <Flex alignItems="center" gap="1">
              {(Number(mintInfo.configInfo.tradeFeeRate) + Number(mintInfo.platformInfo.feeRate)) / 10000}%
              <Tooltip
                hasArrow
                placement="top"
                label={`Program(${Number(mintInfo.configInfo.tradeFeeRate) / 10000}%) + Platform(${
                  Number(mintInfo.platformInfo.feeRate) / 10000
                }%) `}
              >
                <QuestionCircleIcon color={colors.lightPurple} />
              </Tooltip>
            </Flex>
          </Flex>
          <Flex alignItems="center" justifyContent="space-between" gap={1}>
            Platform:
            <Flex alignItems="center" gap="1">
              <Image width="16px" src={mintInfo.platformInfo.img} /> {mintInfo.platformInfo.name}
              <a href={`${explorerUrl}/account/${mintInfo.mint}`} target="_blank" rel="noreferrer">
                <ExternalLink width="14px" height="14px" />
              </a>
            </Flex>
          </Flex>
        </Flex>
      </Box>

      <Flex
        direction="column"
        background={isLight ? '#F5F8FF' : '#ABC4FF14'}
        mt={4}
        px={4}
        py={5}
        gap={1}
        borderRadius="4px"
        sx={
          isLight
            ? {
                border: '1px solid #BFD2FF80'
              }
            : {}
        }
        fontSize="sm"
      >
        <Flex alignItems="center" justifyContent="space-between" color={colors.textSecondary} gap={1}>
          Quote Token:
          <Flex alignItems="center" gap="1">
            <TokenAvatar size="sm" token={mintInfo.mintB} />
            {wSolToSolString(mintInfo.mintB.symbol)}
            <Text color={colors.textTertiary} fontSize="xs">
              ({encodeStr(mintInfo.mintB.address, 4, 3)})
            </Text>
          </Flex>
        </Flex>
        <Flex alignItems="center" justifyContent="space-between" color={colors.textSecondary} gap={1}>
          <Flex alignItems="center" gap="1">
            Platform LP fee share
            {/* <Tooltip
              hasArrow
              placement="top"
              label={`After the token graduates, token creators can claim ${
                mintInfo.platformInfo ? (Number((mintInfo.platformInfo as any).creatorScale) / 1000000) * 100 : 10
              }% of LP fees from AMM pool trades.`}
            >
              <QuestionCircleIcon color={colors.lightPurple} />
            </Tooltip> */}
          </Flex>
          <Flex alignItems="center" gap="1">
            {mintInfo.migrateType === 'cpmm' ? 'Yes' : 'No'}
          </Flex>
        </Flex>
        <Flex alignItems="center" justifyContent="space-between" color={colors.textSecondary} gap={1}>
          <Flex alignItems="center" gap="1">
            Tokens vesting
            <Tooltip hasArrow placement="top" label="The percentage of tokens that will be locked and vested.">
              <QuestionCircleIcon color={colors.lightPurple} />
            </Tooltip>
          </Flex>
          <Flex alignItems="center" gap="1">
            {new Decimal(poolInfo?.vestingSchedule.totalLockedAmount.toString() ?? 0)
              .div(poolInfo?.supply.toString() ?? 1)
              .mul(100)
              .toNumber()}
            %
          </Flex>
        </Flex>
        {mintInfo.totalLockedAmount !== 0 ? (
          <>
            <Flex alignItems="center" justifyContent="space-between" color={colors.textSecondary} gap={1}>
              <Flex alignItems="center" gap="1">
                Cliff
                <Tooltip hasArrow placement="top" label={'The number of days after token migrates before locked tokens start vesting.'}>
                  <QuestionCircleIcon color={colors.lightPurple} />
                </Tooltip>
              </Flex>
              <Tooltip
                hasArrow
                placement="top"
                label={
                  isLanded && mintInfo.priceFinalTime
                    ? Number(mintInfo.cliffPeriod) === 0
                      ? 'No Cliff Period'
                      : `Est. cliff start and end dates: ${dayjs(mintInfo.priceFinalTime * 1000).format('MM/DD/YY')} - ${dayjs(
                          mintInfo.priceFinalTime * 1000
                        )
                          .add(Number(mintInfo.cliffPeriod), 'seconds')
                          .format('MM/DD/YY')}`
                    : 'Cliff and vesting times start at token graduation.'
                }
              >
                <Flex alignItems="center" gap="1" textDecoration="underline">
                  {cliffPeriod.text || '--'}
                </Flex>
              </Tooltip>
            </Flex>
            <Flex alignItems="center" justifyContent="space-between" color={colors.textSecondary} gap={1}>
              <Flex alignItems="center" gap="1">
                Vesting Duration
                <Tooltip hasArrow placement="top" label={'The number of days after vesting starts until vesting ends.'}>
                  <QuestionCircleIcon color={colors.lightPurple} />
                </Tooltip>
              </Flex>
              <Tooltip
                hasArrow
                placement="top"
                label={
                  isLanded && mintInfo.priceFinalTime
                    ? Number(mintInfo.unlockPeriod)
                      ? 'No Vesting Duration'
                      : `Est. vesting start and end dates: ${dayjs(mintInfo.priceFinalTime * 1000)
                          .add(Number(mintInfo.cliffPeriod), 'seconds')
                          .format('MM/DD/YY')} - ${dayjs(mintInfo.priceFinalTime * 1000)
                          .add(Number(mintInfo.cliffPeriod), 'seconds')
                          .add(Number(mintInfo.unlockPeriod), 'seconds')
                          .format('MM/DD/YY')}`
                    : 'Cliff and vesting times start at token graduation.'
                }
              >
                <Flex alignItems="center" gap="1" textDecoration="underline">
                  {vestingDuration.text || '--'}
                </Flex>
              </Tooltip>
            </Flex>
          </>
        ) : null}
      </Flex>
    </Box>
  )
}
