import { useLaunchpadStore } from '@/store'
import axios from '@/api/axios'
import { MintInfo } from '@/features/Launchpad/type'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { debounce } from '@/utils/functionMethods'
import useSWRInfinite from 'swr/infinite'
import { useEvent } from '../useEvent'

export const mintInfoFetcher = (
  url: string
): Promise<{
  id: string
  success: boolean
  msg?: string
  data: {
    rows: MintInfo[]
  }
}> => axios.get(url)

export default function useSearchMint({
  search,
  size = 100,
  includeNsfw = true,
  refreshInterval = 60 * 1000
}: {
  search?: string
  refreshInterval?: number
  size?: number
  includeNsfw?: boolean
}) {
  const mintHost = useLaunchpadStore((s) => s.mintHost)
  const [innerSearch, setInnerSearch] = useState('')

  const handleChange = useCallback(
    debounce((val: string) => {
      setInnerSearch(val)
    }, 200),
    []
  )

  const {
    data,
    setSize,
    size: page,
    ...rest
  } = useSWRInfinite(
    (index) =>
      innerSearch ? `${mintHost}/get/search?text=${innerSearch}&size=${size}&page=${index}${`&includeNsfw=${includeNsfw}`}` : null,
    mintInfoFetcher,
    {
      refreshInterval,
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      keepPreviousData: true
    }
  )

  useEffect(() => {
    handleChange(search)
  }, [search, handleChange])

  const resultData = useMemo(
    () =>
      data
        ?.map((d) => d?.data?.rows)
        .flat()
        .filter(Boolean) || [],
    [data]
  )!

  const isEmptyResult = !!refreshInterval && !rest.isLoading && !(resultData.length && !rest.error)
  const hasNextPage = (data?.[page - 1]?.data.rows.length || 0) >= size
  const onLoadMore = useEvent(() => {
    setSize((s) => s + 1)
  })

  return {
    data: resultData || [],
    hasNextPage,
    onLoadMore,
    isEmptyResult,
    ...rest
  }
}
