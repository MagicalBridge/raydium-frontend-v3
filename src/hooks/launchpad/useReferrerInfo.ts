import { useLaunchpadStore } from '@/store'
import useSWR from 'swr'
import axios from '@/api/axios'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { useMemo } from 'react'
import { wSolToSolString } from '@/utils/token'
import { PublicKey } from '@solana/web3.js'

interface Props {
  shouldFetch?: boolean
  wallet?: string | PublicKey
}

const fetcher = (
  url: string
): Promise<{
  id: string
  success: boolean
  msg?: string
  data: {
    data: {
      referrerInfo: {
        amount: number
      }
      mintInfo: ApiV3Token
    }[]
  }
}> => axios.get(url)

export default function useReferrerInfo({ shouldFetch = true, wallet }: Props) {
  const mintHost = useLaunchpadStore((s) => s.mintHost)

  const fetch = shouldFetch && !!wallet

  const { data } = useSWR(fetch ? `${mintHost}/campaign/referrer?wallet=${wallet.toString()}` : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 0,
    focusThrottleInterval: 0,
    refreshInterval: 0
  })

  const res = useMemo(
    () =>
      (data?.data.data || []).map((d) => ({
        ...d,
        mintInfo: {
          ...d.mintInfo,
          symbol: wSolToSolString(d.mintInfo.symbol)
        }
      })),
    [data]
  )

  return res
}
