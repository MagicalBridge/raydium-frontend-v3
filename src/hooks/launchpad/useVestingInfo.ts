import { useLaunchpadStore } from '@/store'
import useSWR from 'swr'
import axios from '@/api/axios'
import { useMemo } from 'react'
import { wSolToSolString } from '@/utils/token'
import { VestingConfig } from './type'
import { PublicKey } from '@solana/web3.js'

interface Props {
  shouldFetch?: boolean
  idList?: (string | PublicKey)[]
  refreshInterval?: number
}

const fetcher = (
  url: string
): Promise<{
  id: string
  success: boolean
  msg?: string
  data: {
    data: {
      [key: string]: VestingConfig | null
    }
  }
}> => axios.get(url)

export default function useVestingInfo({ shouldFetch = true, idList, refreshInterval = 30 * 1000 }: Props) {
  const mintHost = useLaunchpadStore((s) => s.mintHost)

  const ids = idList?.map((id) => id.toString()).join(',') ?? ''
  const fetch = shouldFetch && ids.length > 0

  const { data, ...rest } = useSWR(fetch ? `${mintHost}/vesting/by/ids?ids=${ids}` : null, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })

  return {
    data: data?.data.data,
    ...rest
  }
}
