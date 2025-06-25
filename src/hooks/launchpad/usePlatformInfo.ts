import { Connection, PublicKey } from '@solana/web3.js'
import { useAppStore, useLaunchpadStore } from '@/store'
import useSWR from 'swr'
import ToPublicKey from '@/utils/publicKey'
import { useMemo } from 'react'
import { PlatformConfig } from '@raydium-io/raydium-sdk-v2'

interface Props {
  shouldFetch?: boolean
  platformId?: PublicKey
  refreshInterval?: number
}

const fetcher = ([connection, id]: [Connection, string]) => connection.getAccountInfo(ToPublicKey(id))

export function usePlatformInfo({ shouldFetch = true, platformId, refreshInterval = 2 * 60 * 60 * 1000 }: Props) {
  const connection = useAppStore((s) => s.connection)

  const { data } = useSWR(shouldFetch && connection && platformId ? [connection, platformId.toBase58()] : null, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })

  const info = useMemo(() => {
    if (!data) return
    return PlatformConfig.decode(data.data)
  }, [data])

  return info
}
