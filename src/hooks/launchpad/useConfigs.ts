import { useLaunchpadStore } from '@/store'
import useSWR from 'swr'
import axios from '@/api/axios'
import { ConfigInfo } from '@/features/Launchpad/type'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { useMemo } from 'react'
import { wSolToSolString } from '@/utils/token'

export interface ConfigApiData {
  key: ConfigInfo
  mintInfoB: ApiV3Token
}

interface Props {
  shouldFetch?: boolean
}

const fetcher = (
  url: string
): Promise<{
  id: string
  success: boolean
  msg?: string
  data: {
    data: ConfigApiData[]
  }
}> => axios.get(url)

export default function useConfigs({ shouldFetch = true }: Props) {
  const mintHost = useLaunchpadStore((s) => s.mintHost)

  const { data } = useSWR(shouldFetch ? `${mintHost}/main/configs` : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 0,
    focusThrottleInterval: 0,
    refreshInterval: 0
  })

  const configs = useMemo(() => {
    const configMap = new Map<string, ConfigApiData>()
    const configList = (data?.data.data || []).map((d) => {
      const info = {
        ...d,
        mintInfoB: {
          ...d.mintInfoB,
          symbol: wSolToSolString(d.mintInfoB.symbol)
        }
      }

      configMap.set(info.key.pubKey, info)
      return info
    })

    return { configMap, configList }
  }, [data])

  return configs
}
