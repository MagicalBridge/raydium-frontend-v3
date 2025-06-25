import { useLaunchpadStore } from '@/store'
import useSWR from 'swr'
import axios from '@/api/axios'
import { useMemo } from 'react'

interface Props {
  shouldFetch?: boolean
  refreshInterval?: number
}

export interface PlatformInfo {
  img: string
  name: string
  web: string

  items: {
    burnScale: string
    cpConfigId: string
    creatorScale: string
    feeRate: string
    img: string
    name: string
    platformClaimFeeWallet: string
    platformLockNftWallet: string
    platformScale: string
    pubKey: string
    web: string
  }[]
  pubKey: string
}
const fetcher = (
  url: string
): Promise<{
  id: string
  success: boolean
  msg?: string
  data: {
    data: PlatformInfo[]
  }
}> => axios.get(url, { skipError: true })

export default function usePlatformList({ shouldFetch = true, refreshInterval = 2 * 60 * 1000 }: Props) {
  const mintHost = useLaunchpadStore((s) => s.mintHost)

  const { data, ...rest } = useSWR(shouldFetch ? `${mintHost}/main/platforms-v2` : null, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })

  const list = useMemo(
    () =>
      data?.data.data.map((d) => ({
        ...d,
        pubKey: d.items.map((i) => i.pubKey).join(',')
      })) || [],
    [data]
  )

  return {
    data: list,
    ...rest
  }
}
