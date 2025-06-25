import { useLaunchpadStore } from '@/store'
import axios from '@/api/axios'
import { MintInfo } from '@/features/Launchpad/type'
import useSWRInfinite from 'swr/infinite'
import { useEffect, useMemo, useRef } from 'react'
import { useEvent } from '../useEvent'

export enum MintSortField {
  MarketCap = 'marketCap',
  New = 'new',
  LastTrade = 'lastTrade',
  Featured = 'featured',
  FinishRate = 'finishingRate'
}

const fetcher = ([url]: [string]): Promise<{
  id: string
  success: boolean
  msg?: string
  data: {
    rows: MintInfo[]
    nextPageId?: string
  }
}> => axios.get(url, { skipError: true })

export const validTypeValue = ['default', 'heating', 'graduated']
export default function useMintList({
  shouldFetch = true,
  sort = MintSortField.MarketCap,
  platformId,
  includeNsfw = true,
  mintType: propsMintType = 'default',
  size = 100,
  refreshInterval = 5 * 1000,
  notRefresh,
  timeTag
}: {
  shouldFetch?: boolean
  refreshInterval?: number
  sort?: MintSortField
  mintType?: 'default' | 'heating' | 'graduated'
  platformId?: string
  includeNsfw?: boolean
  size?: number
  notRefresh?: boolean
  timeTag?: number
}) {
  const mintHost = useLaunchpadStore((s) => s.mintHost)
  const mintType = useMemo(() => {
    const value = propsMintType?.replace('_up', '')
    if (validTypeValue.indexOf(value) === -1) return 'default'
    return value || 'default'
  }, [propsMintType])
  const nextPageRef = useRef<Map<string, Record<number, string>>>(new Map())
  const {
    data,
    setSize,
    size: page,
    error,
    ...rest
  } = useSWRInfinite(
    (index) =>
      shouldFetch && (index === 0 || (index > 0 && nextPageRef.current.get(`${sort}-${mintType}`)?.[index]))
        ? [
            `${mintHost}/get/list?sort=${sort}&size=${size}&mintType=${mintType}${`&includeNsfw=${includeNsfw}`}${
              platformId ? `&platformId=${platformId}` : ''
            }${
              nextPageRef.current.get(`${sort}-${mintType}`)?.[index]
                ? `&nextPageId=${nextPageRef.current.get(`${sort}-${mintType}`)![index]}`
                : ''
            }`,
            timeTag
          ]
        : null,
    fetcher,
    {
      revalidateAll: !notRefresh,
      revalidateFirstPage: !notRefresh,
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
      setSize(1)
      nextPageRef.current = new Map()
    }
  }, [sort, platformId, includeNsfw, mintType, size])

  const resData = useMemo(() => {
    const mintSet = new Set<string>()
    data?.forEach((d, idx) => {
      const pageData = nextPageRef.current.get(`${sort}-${mintType}`) || {}
      if (pageData?.[idx + 1] && d.data.nextPageId)
        nextPageRef.current.set(`${sort}-${mintType}`, { ...pageData, [idx + 1]: d.data.nextPageId })
    })
    return (
      data
        ?.map((d) => d.data.rows)
        .flat()
        .filter((d) => {
          if (mintSet.has(d.mint)) return false
          mintSet.add(d.mint)
          return true
        }) || []
    )
  }, [data, sort, mintType])
  const hasMore = data && !!data[data.length - 1].data.nextPageId

  const loadMore = useEvent(() => {
    if (!hasMore) return
    const pageData = nextPageRef.current.get(`${sort}-${mintType}`) || {}
    nextPageRef.current.set(`${sort}-${mintType}`, {
      ...pageData,
      [page]: data[data.length - 1].data.nextPageId!
    })
    // nextPageRef.current.set(page, data[data.length - 1].data.nextPageId!)
    setSize((s) => s + 1)
  })

  return {
    data: resData,
    hasMore,
    loadMore,
    ...rest
  }
}
