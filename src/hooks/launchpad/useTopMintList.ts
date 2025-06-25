import { useLaunchpadStore } from '@/store'
import axios from '@/api/axios'
import { MintInfo } from '@/features/Launchpad/type'
import useSWR from 'swr'
import { useEffect, useMemo } from 'react'
import { MintSortField } from './useMintList'

const fetcher = async (urlList: string[]) => {
  const get1 = async () => {
    try {
      return await axios.get(urlList[0], { skipError: true })
    } catch (e: any) {
      return e.response
    }
  }

  const get2 = async () => {
    try {
      return await axios.get(urlList[1], { skipError: true })
    } catch (e: any) {
      return e.response
    }
  }

  const get3 = async () => {
    try {
      return await axios.get(urlList[2], { skipError: true })
    } catch (e: any) {
      return e.response
    }
  }

  return Promise.all([get1(), get2(), get3()]) as unknown as [
    {
      id: string
      success: boolean
      msg?: string
      data?: {
        rows: MintInfo[]
      }
    },
    {
      id: string
      success: boolean
      msg?: string
      data?: {
        data: {
          mintInfo: MintInfo
          tradeInfo: {
            amountA: number
            amountB: number
            side: 'buy' | 'sell'
          }
        }[]
      }
    },
    {
      id: string
      success: boolean
      msg?: string
      data?: {
        data: MintInfo
      }
    }
  ]
}

export default function useTopMintList({
  shouldFetch = true,
  includeNsfw = false,
  platformId,
  timeTag,
  size = 3,
  refreshInterval = 5 * 1000,
  notRefresh
}: {
  shouldFetch?: boolean
  refreshInterval?: number
  platformId?: string
  sort?: MintSortField
  includeNsfw?: boolean
  timeTag?: number
  size?: number
  notRefresh?: boolean
}) {
  const mintHost = useLaunchpadStore((s) => s.mintHost)

  const { data, error, ...rest } = useSWR(
    shouldFetch
      ? [
          `${mintHost}/get/list?sort=${MintSortField.New}&size=${size}${`&includeNsfw=${includeNsfw}`}${`&platformId=${
            platformId || 'PlatformWhiteList'
          }`}`,
          `${mintHost}/get/random/index-left-mint`,
          `${mintHost}/get/random/index-top-mint`,
          timeTag
        ]
      : null,
    fetcher,
    {
      revalidateIfStale: !notRefresh,
      revalidateOnFocus: !notRefresh,
      revalidateOnReconnect: !notRefresh,
      dedupingInterval: notRefresh ? 0 : refreshInterval,
      focusThrottleInterval: notRefresh ? 0 : refreshInterval,
      refreshInterval: notRefresh ? 0 : refreshInterval,
      keepPreviousData: true
    }
  )

  useEffect(() => {
    return () => {
      rest.mutate()
    }
  }, [includeNsfw, rest.mutate])

  const [topMarketCapMints, topLastTrade] = useMemo(() => {
    return [data?.[0]?.data?.rows.slice(0, 3) || [], (data?.[1]?.data?.data || []).slice(0, 3)]
  }, [data])

  return {
    topMarketCapMints,
    topLastTrade,
    indexTopMint: data?.[2]?.data?.data || data?.[0]?.data?.rows[0],
    ...rest
  }
}
