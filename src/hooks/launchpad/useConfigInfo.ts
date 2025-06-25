import { PublicKey } from '@solana/web3.js'
import { useAppStore, useLaunchpadStore } from '@/store'
import useSWR from 'swr'

interface Props {
  shouldFetch?: boolean
  programId?: PublicKey
  curveType?: number
  configIndex?: number
  configId?: PublicKey
}

const fetcher = (configId: string) => useLaunchpadStore.getState().getConfigInfo(configId)

export function useConfigInfo({ shouldFetch = true, configId }: Props) {
  const [connection] = useAppStore((s) => [s.connection])

  const { data } = useSWR(shouldFetch && connection && configId ? configId.toBase58() : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 0,
    focusThrottleInterval: 0,
    refreshInterval: 0
  })

  return { data, configId }
}
