import { useLaunchpadStore } from '@/store'
import useSWRInfinite from 'swr/infinite'
import axios from '@/api/axios'
import { MintInfo } from '@/features/Launchpad/type'
import { useEffect, useMemo, useRef } from 'react'
import ToPublicKey from '@/utils/publicKey'
import { useEvent } from '../useEvent'

const fetcher = (
  url: string
): Promise<{
  id: string
  success: boolean
  msg?: string
  data: {
    rows: MintInfo[]
    nextPageId?: string
  }
}> => axios.get(url)

export default function useOwnerMints({
  wallet,
  size = 100,
  platformId,
  refreshInterval = 30 * 1000
}: {
  wallet?: string
  size?: number
  platformId?: string
  refreshInterval?: number
}) {
  const mintHost = useLaunchpadStore((s) => s.mintHost)
  const nextPageRef = useRef<Map<number, string>>(new Map())
  const validWallet = useMemo(() => {
    try {
      ToPublicKey(wallet || '')
      return wallet
    } catch {
      return undefined
    }
  }, [wallet])

  const {
    data,
    setSize,
    size: page,
    error,
    ...rest
  } = useSWRInfinite(
    (index) =>
      validWallet && (index === 0 || (index > 0 && nextPageRef.current.get(index)))
        ? [
            `${mintHost}/get/by/user?wallet=${validWallet}&size=${size}${platformId ? `&platformId=${platformId}` : ''}${
              nextPageRef.current.get(index) ? `&nextPageId=${nextPageRef.current.get(index)}` : ''
            }`
          ]
        : null,
    fetcher,
    {
      revalidateFirstPage: false,
      dedupingInterval: 10 * 1000,
      focusThrottleInterval: refreshInterval,
      refreshInterval
    }
  )

  const resData = useMemo(() => data?.map((d) => d.data.rows).flat() || [], [data])
  const isEmptyResult = !!validWallet && !rest.isLoading && !resData.length

  const hasMore = resData.length > 0 && data && !!data[data.length - 1].data.nextPageId
  const loadMore = useEvent(() => {
    if (!hasMore) return
    nextPageRef.current.set(page, data[data.length - 1].data.nextPageId!)
    setSize((s) => s + 1)
  })

  useEffect(() => {
    return () => {
      nextPageRef.current = new Map()
    }
  }, [validWallet])

  return {
    data: resData,
    isEmptyResult,
    hasMore,
    loadMore,
    ...rest
  }
}
