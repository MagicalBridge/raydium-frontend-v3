import { PublicKey, SignatureResult, Transaction, VersionedTransaction } from '@solana/web3.js'
import createStore from './createStore'
import { useAppStore } from './useAppStore'
import ToPublicKey from '@/utils/publicKey'
import { getComputeBudgetConfig } from '@/utils/tx/computeBudget'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import { TOAST_DURATION, txStatusSubject } from '@/hooks/toast/useTxStatus'
import { TxCallbackProps } from '@/types/tx'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { getTxMeta } from './configs/lauchpad'
import { encodeStr } from '@/utils/common'
import {
  getPdaLaunchpadAuth,
  LaunchpadPoolInfo,
  txToBase64,
  TxVersion,
  LaunchpadPoolInitParam,
  LaunchpadConfig,
  FEE_RATE_DENOMINATOR,
  ApiV3Token
} from '@raydium-io/raydium-sdk-v2'
import axios from '@/api/axios'
import { MintInfo } from '@/features/Launchpad/type'
import { refreshChartSubject } from '@/components/TradingView/TVChart'
import { LaunchpadConfigInfo } from '@/hooks/launchpad/usePoolRpcInfo'
import { useTokenAccountStore } from './useTokenAccountStore'
import { getDefaultToastData, handleMultiTxToast } from '@/hooks/toast/multiToastUtil'
import { handleMultiTxRetry } from '@/hooks/toast/retryTx'
import { wSolToSolString } from '@/utils/token'

export const LAUNCHPAD_SLIPPAGE_KEY = '_r_lau_slp_'

export interface CreateMintAdvanceConfig {
  supply?: BN
  totalSellA?: BN
  totalFundRaisingB?: BN
  totalLockedAmount?: BN
  cliffPeriod?: BN
  unlockPeriod?: BN
  migrateType?: 'amm' | 'cpmm'
}
export interface LaunchpadState {
  token?: string
  authHost: string
  commentHost: string
  historyHost: string
  mintHost: string
  slippage: number

  refreshPoolMint?: string
  configInfo: Map<string, LaunchpadConfigInfo>

  createRandomMintAct: (
    data: {
      decimals?: number
      file: File
      name: string
      symbol: string
      website?: string
      twitter?: string
      telegram?: string
      description?: string
      configId: string
    } & CreateMintAdvanceConfig
  ) => Promise<{ mint: string; metadataLink: string } | undefined>

  createMintAct: (
    data: {
      file?: File
      name: string
      symbol: string
      decimals?: number
      description?: string
      cfToken: string
      website?: string
      twitter?: string
      telegram?: string
      configId: string
    } & CreateMintAdvanceConfig
  ) => Promise<string | undefined>

  createAndBuyAct: (
    data: {
      programId?: PublicKey
      mint: string

      name: string
      uri: string
      symbol: string
      decimals?: number
      buyAmount: BN
      minMintAAmount?: BN
      slippage?: BN
      migrateType?: 'amm' | 'cpmm'
      notExecute?: boolean
      shareFeeReceiver?: PublicKey
      configInfo: LaunchpadConfigInfo
      configId: string | PublicKey
      platformFeeRate?: BN

      mintBInfo: ApiV3Token

      supply?: BN
      totalSellA?: BN
      totalFundRaisingB?: BN
      totalLockedAmount?: BN
      cliffPeriod?: BN
      unlockPeriod?: BN

      curveType?: number
    } & TxCallbackProps
  ) => Promise<{ txId: string; poolInfo?: LaunchpadPoolInfo }>

  buyAct: (
    data: {
      programId?: PublicKey
      mintInfo: MintInfo
      buyAmount: BN
      slippage?: BN
      mintB?: PublicKey
      minMintAAmount?: BN
      symbolB?: string
      mintBDecimals?: number
      shareFeeReceiver?: PublicKey
      configInfo?: LaunchpadConfigInfo
      platformFeeRate?: BN
    } & TxCallbackProps
  ) => Promise<string>

  sellAct: (
    data: {
      programId?: PublicKey
      mintInfo: MintInfo
      sellAmount: BN
      minAmountB?: BN
      slippage?: BN
      mintB?: PublicKey
      symbolB?: string
      mintBDecimals?: number
      shareFeeReceiver?: PublicKey
      configInfo?: LaunchpadConfigInfo
      platformFeeRate?: BN
    } & TxCallbackProps
  ) => Promise<string>

  getConfigInfo: (configId: string | PublicKey) => Promise<LaunchpadConfigInfo | undefined>
}

export const defaultShareFeeRate = new BN(10000)
export const launchpadShareRate = new Decimal(defaultShareFeeRate.toString())
  .div(FEE_RATE_DENOMINATOR.toString())
  .mul(100)
  .toDecimalPlaces(2)
  .toString()

const initialState = {
  authHost: process.env.NEXT_PUBLIC_LAUNCH_AUTH_HOST || 'https://launch-auth-v1.raydium.io',
  commentHost: process.env.NEXT_PUBLIC_LAUNCH_COMMENT_HOST || 'https://launch-forum-v1.raydium.io',
  historyHost: process.env.NEXT_PUBLIC_LAUNCH_HISTORY_HOST || 'https://launch-history-v1.raydium.io',
  mintHost: process.env.NEXT_PUBLIC_LAUNCH_MINT_HOST || 'https://launch-mint-v1.raydium.io',
  slippage: 0.025,
  configInfo: new Map()
}

export const useLaunchpadStore = createStore<LaunchpadState>((set, get) => ({
  ...initialState,

  createRandomMintAct: async (props) => {
    const token = get().token
    const { publicKey } = useAppStore.getState()
    if (!publicKey || !token) return

    if (props.name.length > 32) {
      toastSubject.next({
        status: 'error',
        title: 'Token name error',
        description: 'can not exceed length 32'
      })
      return
    }

    if (props.symbol.length > 10) {
      toastSubject.next({
        status: 'error',
        title: 'Token symbol error',
        description: 'can not exceed length 10'
      })
      return
    }

    const r: {
      id: string
      success: boolean
      data: { mint: string; metadataLink: string }
    } = await axios.postForm(
      `${get().mintHost}/create/get-random-mint`,
      {
        ...props,
        wallet: publicKey.toBase58(),
        decimals: props.decimals ?? LaunchpadPoolInitParam.decimals,
        supply: props.supply ?? LaunchpadPoolInitParam.supply,
        totalSellA: props.totalSellA ? props.totalSellA.toString() : LaunchpadPoolInitParam.totalSellA,
        totalFundRaisingB: props.totalFundRaisingB ? props.totalFundRaisingB.toString() : LaunchpadPoolInitParam.totalFundRaisingB,
        totalLockedAmount: props.totalLockedAmount ? props.totalLockedAmount.toString() : LaunchpadPoolInitParam.totalLockedAmount,
        cliffPeriod: props.cliffPeriod ? props.cliffPeriod.toString() : LaunchpadPoolInitParam.cliffPeriod,
        unlockPeriod: props.unlockPeriod ? props.unlockPeriod.toString() : LaunchpadPoolInitParam.unlockPeriod,
        platformId: LaunchpadPoolInitParam.platformId,
        migrateType: props.migrateType || 'amm',
        description: props.description ?? ''
      },
      {
        headers: {
          'ray-token': token
        },
        skipError: true,
        authTokenCheck: true
      }
    )

    return r.data
  },

  createMintAct: async (props) => {
    const token = get().token
    const { publicKey } = useAppStore.getState()
    if (!publicKey || !token) return

    if (props.name.length > 32) {
      toastSubject.next({
        status: 'error',
        title: 'Token name error',
        description: 'can not exceed length 32'
      })
      return
    }

    if (props.symbol.length > 10) {
      toastSubject.next({
        status: 'error',
        title: 'Token symbol error',
        description: 'can not exceed length 10'
      })
      return
    }

    const r: {
      id: string
      success: boolean
      data: {
        mint: string
      }
    } = await axios.postForm(
      `${get().mintHost}/create/mint-info`,
      {
        ...props,
        wallet: publicKey.toBase58(),
        decimals: props.decimals ?? LaunchpadPoolInitParam.decimals,
        supply: props.supply ?? LaunchpadPoolInitParam.supply,
        totalSellA: props.totalSellA ? props.totalSellA.toString() : LaunchpadPoolInitParam.totalSellA,
        totalFundRaisingB: props.totalFundRaisingB ? props.totalFundRaisingB.toString() : LaunchpadPoolInitParam.totalFundRaisingB,
        totalLockedAmount: props.totalLockedAmount ? props.totalLockedAmount.toString() : LaunchpadPoolInitParam.totalLockedAmount,
        cliffPeriod: props.cliffPeriod ? props.cliffPeriod.toString() : LaunchpadPoolInitParam.cliffPeriod,
        unlockPeriod: props.unlockPeriod ? props.unlockPeriod.toString() : LaunchpadPoolInitParam.unlockPeriod,
        platformId: LaunchpadPoolInitParam.platformId,
        migrateType: props.migrateType || 'amm',
        description: props.description ?? ''
      },
      {
        headers: {
          'ray-token': token
        },
        skipError: true,
        authTokenCheck: true
      }
    )

    return r.data.mint
  },

  createAndBuyAct: async ({
    programId = useAppStore.getState().programIdConfig.LAUNCHPAD_PROGRAM,
    mint,
    name,
    symbol,
    uri,
    decimals = 6,
    mintBInfo,
    buyAmount,
    slippage,
    minMintAAmount,
    migrateType = 'amm',
    notExecute,
    shareFeeReceiver,
    configId,
    configInfo,
    platformFeeRate,

    supply,
    totalSellA,
    totalFundRaisingB,
    totalLockedAmount,
    cliffPeriod,
    unlockPeriod,

    ...callback
  }) => {
    const { raydium, txVersion } = useAppStore.getState()
    if (!raydium) return { txId: '' }

    if (name.length > 32) {
      toastSubject.next({
        status: 'error',
        title: 'Token name error',
        description: 'can not exceed length 32'
      })
      return { txId: '' }
    }

    if (symbol.length > 10) {
      toastSubject.next({
        status: 'error',
        title: 'Token symbol error',
        description: 'can not exceed length 10'
      })
      return { txId: '' }
    }

    const { execute, extInfo } = await raydium.launchpad.createLaunchpad({
      programId,
      mintA: ToPublicKey(mint),
      mintBDecimals: mintBInfo.decimals,
      decimals,
      name,
      symbol,
      uri,
      migrateType,
      buyAmount,
      platformId: LaunchpadPoolInitParam.platformId,

      shareFeeReceiver,
      shareFeeRate: shareFeeReceiver ? defaultShareFeeRate : undefined,
      configId: ToPublicKey(configId),
      configInfo,
      platformFeeRate,

      supply,
      totalSellA: totalSellA ? new BN(totalSellA) : undefined,
      totalFundRaisingB: totalFundRaisingB ? new BN(totalFundRaisingB) : undefined,
      totalLockedAmount,
      cliffPeriod,
      unlockPeriod,

      slippage,
      minMintAAmount,
      createOnly: notExecute,
      txVersion,
      computeBudgetConfig: raydium.cluster === 'devnet' ? undefined : await getComputeBudgetConfig()
    })
    if (notExecute) {
      return {
        txId: '',
        poolInfo: extInfo.address
      }
    }

    let meta = getTxMeta({
      action: 'buy',
      values: {
        amountA: new Decimal(extInfo.outAmount.toString())
          .div(10 ** decimals)
          .toDecimalPlaces(decimals)
          .toString(),
        symbolA: symbol || encodeStr(mint, 5),
        amountB: new Decimal(buyAmount.toString())
          .div(10 ** mintBInfo.decimals)
          .toDecimalPlaces(mintBInfo.decimals)
          .toString(),
        symbolB: wSolToSolString(mintBInfo.symbol)
      }
    })

    let txId = ''
    const isV0Tx = txVersion === TxVersion.V0
    try {
      const { signedTxs } = await execute({ notSendToRpc: true, sequentially: true })
      const { data } = await axios.post(
        `${get().mintHost}/create/sendTransaction`,
        { txs: [txToBase64(signedTxs[0])] },
        { skipError: true }
      )
      const txBuf = Buffer.from(data.tx, 'base64')
      const bothSignedTx = VersionedTransaction.deserialize(txBuf as any)

      if (signedTxs.length < 2) {
        if (isV0Tx) {
          txId = await raydium.connection.sendTransaction(bothSignedTx as VersionedTransaction, { skipPreflight: true })
        } else {
          txId = await raydium.connection.sendRawTransaction(bothSignedTx.serialize(), { skipPreflight: true })
        }
        txStatusSubject.next({
          txId,
          ...callback,
          ...meta,
          signedTx: signedTxs[0],
          onConfirmed: () => {
            callback.onConfirmed?.()
            useTokenAccountStore.getState().fetchTokenAccountAct({})
            setTimeout(() => {
              set({ refreshPoolMint: mint })
              refreshChartSubject.next(mint)
            }, 1000)
          }
        })
        return { txId, poolInfo: extInfo.address }
      }

      signedTxs[0] = bothSignedTx
      console.log('simulate tx string:', signedTxs.map(txToBase64))

      const txLength = signedTxs.length
      const { toastId, handler } = getDefaultToastData({
        txLength,
        ...callback,
        onConfirmed: () => {
          setTimeout(() => {
            callback.onConfirmed?.()
          }, 1500)

          useTokenAccountStore.getState().fetchTokenAccountAct({})
          setTimeout(() => {
            set({ refreshPoolMint: mint })
            refreshChartSubject.next(mint)
          }, 2000)
        }
      })

      meta = getTxMeta({
        action: 'launchBuy',
        values: {
          amountA: new Decimal(extInfo.outAmount.toString())
            .div(10 ** decimals)
            .toDecimalPlaces(decimals)
            .toString(),
          symbolA: symbol || encodeStr(mint, 5),
          amountB: new Decimal(buyAmount.toString())
            .div(10 ** mintBInfo.decimals)
            .toDecimalPlaces(mintBInfo.decimals)
            .toString(),
          symbolB: wSolToSolString(mintBInfo.symbol)
        }
      })

      const processedId: {
        txId: string
        status: 'success' | 'error' | 'sent'
        signedTx: Transaction | VersionedTransaction
      }[] = []

      const getSubTxTitle = (idx: number) => {
        return idx === 0 ? 'launchpad.create_token' : 'launchpad.buy_token_title'
      }

      let i = 0
      const checkSendTx = async (): Promise<void> => {
        if (!signedTxs[i]) return
        const tx = signedTxs[i]
        const txId = !isV0Tx
          ? await raydium.connection.sendRawTransaction(tx.serialize(), { skipPreflight: true, maxRetries: 0 })
          : await raydium.connection.sendTransaction(tx as VersionedTransaction, { skipPreflight: true, maxRetries: 0 })
        processedId.push({ txId, signedTx: tx, status: 'sent' })

        let timeout = 0
        let intervalId = 0
        let intervalCount = 0

        const cbk = (signatureResult: SignatureResult) => {
          window.clearTimeout(timeout)
          window.clearInterval(intervalId)
          const targetTxIdx = processedId.findIndex((tx) => tx.txId === txId)
          if (targetTxIdx > -1) processedId[targetTxIdx].status = signatureResult.err ? 'error' : 'success'
          handleMultiTxRetry(processedId)
          handleMultiTxToast({
            toastId,
            processedId: processedId.map((p) => ({ ...p, status: p.status === 'sent' ? 'info' : p.status })),
            txLength,
            meta,
            isSwap: true,
            handler,
            getSubTxTitle
          })
          if (!signatureResult.err) checkSendTx()
        }

        const subId = raydium.connection.onSignature(txId, cbk, 'processed')
        raydium.connection.getSignatureStatuses([txId])

        intervalId = window.setInterval(async () => {
          const targetTxIdx = processedId.findIndex((tx) => tx.txId === txId)
          if (intervalCount++ > TOAST_DURATION / 2000 || processedId[targetTxIdx].status !== 'sent') {
            window.clearInterval(intervalId)
            return
          }
          try {
            const r = await raydium.connection.getTransaction(txId, {
              commitment: 'confirmed',
              maxSupportedTransactionVersion: TxVersion.V0
            })
            if (r) {
              console.log('tx status from getTransaction:', txId)
              cbk({ err: r.meta?.err || null })
              window.clearInterval(intervalId)
              useTokenAccountStore.getState().fetchTokenAccountAct({ commitment: useAppStore.getState().commitment })
            }
          } catch (e) {
            console.error('getTransaction timeout:', e, txId)
            window.clearInterval(intervalId)
          }
        }, 2000)

        handleMultiTxRetry(processedId)
        handleMultiTxToast({
          toastId,
          processedId: processedId.map((p) => ({ ...p, status: p.status === 'sent' ? 'info' : p.status })),
          txLength,
          meta,
          isSwap: true,
          handler,
          getSubTxTitle
        })

        timeout = window.setTimeout(() => {
          raydium.connection.removeSignatureListener(subId)
        }, TOAST_DURATION)

        i++
      }
      checkSendTx()

      return { txId: '' }
    } catch (e: any) {
      const errorMsg = e.response?.data?.msg
      callback.onError?.()
      toastSubject.next({ status: 'error', ...meta, description: errorMsg || undefined, txError: errorMsg ? undefined : e })
    } finally {
      callback.onFinally?.()
    }

    return { txId: '' }
  },
  buyAct: async ({
    programId = useAppStore.getState().programIdConfig.LAUNCHPAD_PROGRAM,
    mintInfo,
    buyAmount,
    minMintAAmount,
    slippage,
    mintB,
    symbolB,
    mintBDecimals = 9,
    shareFeeReceiver,
    configInfo,
    platformFeeRate,
    onSent,
    onConfirmed,
    onError,
    onFinally
  }) => {
    const { raydium, txVersion } = useAppStore.getState()
    if (!raydium) return ''

    const { execute, extInfo } = await raydium.launchpad.buyToken({
      programId,
      mintA: ToPublicKey(mintInfo.mint),
      txVersion,
      buyAmount,
      slippage,
      mintB,
      // minMintAAmount, // use sdk to get realtime rpc data
      shareFeeReceiver,
      shareFeeRate: shareFeeReceiver ? defaultShareFeeRate : undefined,
      configInfo,
      platformFeeRate,
      computeBudgetConfig: raydium.cluster === 'devnet' ? undefined : await getComputeBudgetConfig()
    })

    const meta = getTxMeta({
      action: 'buy',
      values: {
        amountA: new Decimal((minMintAAmount ?? extInfo.outAmount).toString())
          .div(10 ** Number(mintInfo.decimals))
          .toDecimalPlaces(Number(mintInfo.decimals))
          .toString(),
        symbolA: mintInfo.symbol ?? encodeStr(mintInfo.mint, 5),
        amountB: new Decimal(buyAmount.toString())
          .div(10 ** mintBDecimals)
          .toDecimalPlaces(mintBDecimals)
          .toString(),
        symbolB: symbolB ?? 'SOL'
      }
    })

    return execute()
      .then(({ txId, signedTx }) => {
        txStatusSubject.next({
          txId,
          ...meta,
          signedTx,
          onSent,
          onError,
          onConfirmed: () => {
            onConfirmed?.()
            useTokenAccountStore.getState().fetchTokenAccountAct({})
          }
        })
        return txId
      })
      .catch((e) => {
        onError?.()
        toastSubject.next({ ...meta, txError: e })
        return ''
      })
      .finally(onFinally)
  },

  sellAct: async ({
    programId = useAppStore.getState().programIdConfig.LAUNCHPAD_PROGRAM,
    mintInfo,
    sellAmount,
    minAmountB,
    slippage,
    mintB,
    symbolB,
    mintBDecimals = 9,
    shareFeeReceiver,
    configInfo,
    platformFeeRate,
    onSent,
    onConfirmed,
    onError,
    onFinally
  }) => {
    const { raydium, txVersion } = useAppStore.getState()
    if (!raydium) return ''

    const { execute, extInfo } = await raydium.launchpad.sellToken({
      programId,
      authProgramId: getPdaLaunchpadAuth(programId).publicKey,
      mintA: ToPublicKey(mintInfo.mint),
      txVersion,
      sellAmount,
      slippage,
      mintB,
      // minAmountB,
      configInfo,
      platformFeeRate,
      shareFeeReceiver,
      shareFeeRate: shareFeeReceiver ? defaultShareFeeRate : undefined,
      computeBudgetConfig: raydium.cluster === 'devnet' ? undefined : await getComputeBudgetConfig()
    })
    const decimals = Number(mintInfo.decimals)
    const meta = getTxMeta({
      action: 'sell',
      values: {
        amountA: new Decimal(sellAmount.toString())
          .div(10 ** decimals)
          .toDecimalPlaces(decimals)
          .toString(),
        symbolA: mintInfo.symbol ?? encodeStr(mintInfo.mint, 5),
        amountB: new Decimal((minAmountB ?? extInfo.outAmount).toString())
          .div(10 ** mintBDecimals)
          .toDecimalPlaces(mintBDecimals)
          .toString(),
        symbolB: symbolB ?? 'SOL'
      }
    })

    return execute()
      .then(({ txId, signedTx }) => {
        txStatusSubject.next({
          txId,
          ...meta,
          signedTx,
          onSent,
          onError,
          onConfirmed: () => {
            onConfirmed?.()
            useTokenAccountStore.getState().fetchTokenAccountAct({})
          }
        })
        return txId
      })
      .catch((e) => {
        onError?.()
        toastSubject.next({ ...meta, txError: e })
        return ''
      })
      .finally(onFinally)
  },
  getConfigInfo: async (configId) => {
    const { connection } = useAppStore.getState()
    const config = get().configInfo.get(configId.toString())
    if (config) return config
    if (!connection) return
    const r = await connection.getAccountInfo(ToPublicKey(configId))
    if (!r) return
    const allConfig = new Map(Array.from(get().configInfo))
    const configData = LaunchpadConfig.decode(r.data)
    allConfig.set(configId.toString(), configData)
    set({
      configInfo: allConfig
    })
    return configData
  }
}))
