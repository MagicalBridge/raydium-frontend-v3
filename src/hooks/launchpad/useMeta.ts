import useSWR from 'swr'
import axios from '@/api/axios'

export interface Meta {
  name: string
  symbol: string
  description: string
  createdOn: string
  image: string
}

interface Props {
  shouldFetch?: boolean
  url?: string
}

const fetcher = (url: string): Promise<Meta> => axios.get(url, { skipError: true, skipRetry: true })

export default function useMeta({ shouldFetch = true, url }: Props) {
  const { data } = useSWR(shouldFetch && url ? url : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 0,
    focusThrottleInterval: 0,
    refreshInterval: 0
  })

  return data
}
