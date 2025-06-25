import { useLaunchpadStore } from '@/store'
import useSWR from 'swr'
import axios from '@/api/axios'
import { MintInfo } from '@/features/Launchpad/type'
import ToPublicKey from '@/utils/publicKey'

export const mintInfoFetcher = (
  url: string
): Promise<{
  id: string
  success: boolean
  msg?: string
  data: {
    rows: MintInfo[]
  }
}> => axios.get(url, { skipError: true })

export default function useMintInfo({
  mints = [],
  refreshInterval = 30 * 1000
}: {
  mints: (string | undefined)[]
  refreshInterval?: number
}) {
  const mintHost = useLaunchpadStore((s) => s.mintHost)
  const mintQuery = mints
    .filter((m) => {
      if (!m) return false
      try {
        return ToPublicKey(m)
      } catch {
        return false
      }
    })
    .join(',')

  const { data, ...rest } = useSWR(mintQuery ? `${mintHost}/get/by/mints?ids=${mintQuery}` : null, mintInfoFetcher, {
    refreshInterval,
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    keepPreviousData: true
  })

  const isEmptyResult = !!mintQuery && !rest.isLoading && !(data?.data.rows.length && !rest.error)

  return {
    data: data?.data.rows || [],
    isEmptyResult,
    ...rest
  }
}
