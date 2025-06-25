import axios from '@/api/axios'
import { useLaunchpadStore } from '@/store'
import { useMemo, useRef } from 'react'
import { useEvent } from '../useEvent'
import useSWRInfinite from 'swr/infinite'

interface Props {
  poolId?: string
  limit?: number
  refreshInterval?: number
  minAmount?: number
  maxAmount?: number
}

const fetcher = (
  url: string
): Promise<{
  data: {
    nextPageKey?: string
    rows: {
      amountA: number
      amountB: number
      blockTime: number
      owner: string
      poolId: string
      side: 'sell' | 'buy'
      txid: string
    }[]
  }
  id: string
  success: boolean
}> => axios.get(url)

export default function useTradeHistory({ poolId, minAmount, maxAmount, limit = 50, refreshInterval = 30 * 1000 }: Props) {
  const historyHost = useLaunchpadStore((s) => s.historyHost)
  const shouldFetch = !!poolId

  const nextPageRef = useRef<Map<number, string>>(new Map())

  const { data, setSize, size, isLoading, ...rest } = useSWRInfinite(
    (index) =>
      shouldFetch && (index === 0 || (index > 0 && nextPageRef.current.get(index)))
        ? `${historyHost}/trade?poolId=${poolId}&limit=${limit}${minAmount === undefined ? '' : `&minAmount=${minAmount}`}${
            maxAmount === undefined ? '' : `&maxAmount=${maxAmount}`
          }${nextPageRef.current.get(index) ? `&nextPageKey=${nextPageRef.current.get(index)}` : ''}`
        : null,
    fetcher,
    {
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval,
      keepPreviousData: true
    }
  )

  const hasMore = data && !!data[data.length - 1].data.nextPageKey
  const loadMore = useEvent(() => {
    if (!hasMore) return
    nextPageRef.current.set(size, data[data.length - 1].data.nextPageKey!)
    setSize((s) => s + 1)
  })

  const resData = useMemo(() => data?.map((d) => d.data.rows).flat() || [], [data])

  return {
    data: resData,
    hasMore,
    isLoading,
    loadMore,
    ...rest
  }
}
