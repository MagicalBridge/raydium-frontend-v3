import useSWR from 'swr'
import { Connection, PublicKey } from '@solana/web3.js'
import { useAppStore, useLaunchpadStore } from '@/store'
import {
  LaunchpadPool,
  Curve,
  LaunchpadConfigInfo,
  LaunchpadPoolInfo,
  getPdaLaunchpadVaultId,
  getPdaLaunchpadPoolId,
  LaunchpadPoolInitParam
} from '@raydium-io/raydium-sdk-v2'
import ToPublicKey from '@/utils/publicKey'
import { useEffect, useMemo, useState } from 'react'
import Decimal from 'decimal.js'
import { MintInfo } from '@/features/Launchpad/type'
import { BN } from 'bn.js'
import { NATIVE_MINT } from '@solana/spl-token'
import shallow from 'zustand/shallow'
import { ToLaunchPadConfig } from './utils'

interface Props {
  poolId?: string
  refreshInterval?: number
  mintInfo?: MintInfo
  notRefresh?: boolean
}

export type { LaunchpadPoolInfo, LaunchpadConfigInfo }

const fetcher = ([connection, poolId]: [Connection, string]) => connection.getAccountInfo(ToPublicKey(poolId), { commitment: 'processed' })

export default function usePoolRpcInfo({ poolId, mintInfo, refreshInterval = 10 * 1000, notRefresh }: Props) {
  const [connection, programId] = useAppStore((s) => [s.connection, s.programIdConfig.LAUNCHPAD_PROGRAM], shallow)
  const refreshPoolMint = useLaunchpadStore((s) => s.refreshPoolMint)
  const [onChain, setOnChain] = useState(false)
  const [configInfo, setConfigInfo] = useState<(LaunchpadConfigInfo & { configId: PublicKey }) | undefined>()
  const shouldFetch = !!poolId && !!connection

  const interval = onChain ? refreshInterval : 3 * 1000

  const { data, isLoading, error, ...rest } = useSWR(shouldFetch ? [connection, poolId] : null, fetcher, {
    revalidateIfStale: !notRefresh,
    revalidateOnFocus: !notRefresh,
    revalidateOnReconnect: !notRefresh,
    dedupingInterval: notRefresh ? 0 : interval,
    focusThrottleInterval: notRefresh ? 0 : interval,
    refreshInterval: notRefresh ? 0 : interval,
    keepPreviousData: true
  })

  const isFetchDone = shouldFetch && !isLoading

  const poolInfo: (LaunchpadPoolInfo & { price: Decimal; fake?: boolean }) | undefined = useMemo(() => {
    if (isFetchDone && !data) {
      setOnChain(false)
      if (mintInfo) {
        const supply = new BN(mintInfo.supply * 10 ** Number(mintInfo.decimals))
        const curve = Curve.getCurve(mintInfo.configInfo.curveType)
        const initParam = curve.getInitParam({
          supply,
          totalFundRaising: new BN(mintInfo.totalFundRaisingB),
          totalSell: new BN(mintInfo.totalSellA),
          totalLockedAmount: new BN(mintInfo.totalLockedAmount),
          migrateFee: new BN(mintInfo.configInfo.migrateFee)
        })
        // mint B check
        const poolId = getPdaLaunchpadPoolId(programId, ToPublicKey(mintInfo.mint), NATIVE_MINT).publicKey
        const poolInfo = {
          bump: 255,
          status: 0,
          epoch: new BN(859),
          decimals: parseFloat(mintInfo.decimals),
          supply,
          totalSellA: new BN(mintInfo.totalSellA),
          virtualA: initParam.a,
          virtualB: initParam.b,
          realA: LaunchpadPoolInitParam.realA,
          realB: LaunchpadPoolInitParam.realB,
          tradeFee: new BN(0),
          migrateFee: new BN(mintInfo.configInfo.migrateFee),
          platformFee: new BN(mintInfo.platformInfo.feeRate),
          platformId: ToPublicKey(mintInfo.platformInfo.pubKey),
          mintA: ToPublicKey(mintInfo.mint),
          mintB: ToPublicKey(mintInfo.mintB.address),
          mintDecimalsA: parseFloat(mintInfo.decimals),
          mintDecimalsB: mintInfo.mintB.decimals, // TBD
          migrateType: 0,
          configId: ToPublicKey(mintInfo.configId),
          vaultA: getPdaLaunchpadVaultId(programId, poolId, ToPublicKey(mintInfo.mint)).publicKey,
          vaultB: getPdaLaunchpadVaultId(programId, poolId, ToPublicKey(mintInfo.mintB.address)).publicKey,
          creator: ToPublicKey(mintInfo.creator),
          totalFundRaisingB: LaunchpadPoolInitParam.totalFundRaisingB,
          protocolFee: mintInfo.configInfo?.tradeFeeRate ? new BN(mintInfo.configInfo.tradeFeeRate) : new BN(0),
          vestingSchedule: {
            totalLockedAmount: new BN(0),
            cliffPeriod: new BN(0),
            unlockPeriod: new BN(0),
            startTime: new BN(0),
            totalAllocatedShare: new BN(0)
          },
          fake: true
        }

        setConfigInfo({
          ...ToLaunchPadConfig(mintInfo.configInfo),
          configId: ToPublicKey(mintInfo.configId)
        })

        return {
          ...poolInfo,
          price: Curve.getPrice({
            poolInfo,
            curveType: mintInfo.configInfo.curveType,
            decimalA: poolInfo.mintDecimalsA,
            decimalB: poolInfo.mintDecimalsB
          })
        } as LaunchpadPoolInfo & { price: Decimal }
      }

      setConfigInfo(undefined)
      return undefined
    }

    if (data) {
      const info = LaunchpadPool.decode(data.data)
      setOnChain(true)
      return {
        ...info,
        price: Curve.getPrice({
          poolInfo: info,
          curveType: mintInfo?.configInfo.curveType ?? 0,
          decimalA: info.mintDecimalsA,
          decimalB: info.mintDecimalsB
        })
      }
    }
  }, [data, mintInfo?.mint, programId, isFetchDone])

  const configId = poolInfo ? poolInfo.configId : mintInfo ? mintInfo?.configId : undefined

  useEffect(() => {
    if (mintInfo?.configInfo) {
      setConfigInfo({
        ...ToLaunchPadConfig(mintInfo.configInfo),
        configId: ToPublicKey(mintInfo.configId)
      })
      return
    }
    if (!configId || !connection) return
    const id = ToPublicKey(configId)
    useLaunchpadStore
      .getState()
      .getConfigInfo(id)
      .then((configData) => {
        if (!configData) return
        setConfigInfo({
          ...configData,
          configId: id
        })
      })
  }, [configId, connection, poolId, mintInfo?.configInfo.pubKey])

  const isEmptyResult = !isLoading && !(data && !error)

  const isNeedRefresh = isEmptyResult && refreshPoolMint && refreshPoolMint === mintInfo?.mint
  useEffect(() => {
    if (!isNeedRefresh) return
    const interval = window.setInterval(() => {
      rest.mutate()
    }, 1500)
    return () => window.clearInterval(interval)
  }, [refreshPoolMint, rest.mutate])

  return {
    data: poolInfo,
    configInfo,
    onChain,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}

export const getMarketCapData = ({
  poolInfo,
  mintInfo,
  mintBPrice
}: {
  poolInfo: LaunchpadPoolInfo
  mintInfo: MintInfo
  mintBPrice: Decimal
}) => {
  const cur = Curve.getCurve(mintInfo.configInfo.curveType || 0)
  const poolPrice = cur.getPoolPrice({
    poolInfo,
    decimalA: poolInfo.mintDecimalsA,
    decimalB: poolInfo.mintDecimalsB ?? 9
  })
  const currentMarketCap = poolPrice
    .mul(poolInfo.supply.toString())
    .div(10 ** poolInfo.mintDecimalsA)
    .mul(mintBPrice)
  const startPrice = new Decimal(mintInfo.initPrice || '0')
  const endPrice = mintInfo.endPrice ? new Decimal(mintInfo.endPrice || 0) : new Decimal(mintInfo.initPrice).mul(4)
  const priceRangeItem = endPrice.sub(startPrice).div(3)
  const priceRange = [startPrice, startPrice.add(priceRangeItem), startPrice.add(priceRangeItem.mul(2)), endPrice]
  const marketCapRange = priceRange.map((i) =>
    i
      .mul(poolInfo.supply.toString())
      .div(10 ** poolInfo.mintDecimalsA)
      .mul(mintBPrice)
  )

  return {
    currentMarketCap,
    marketCapRange
  }
}
