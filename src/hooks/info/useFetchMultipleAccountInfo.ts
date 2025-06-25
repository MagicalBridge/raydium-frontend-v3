import useSWR from 'swr'
import { useAppStore } from '@/store'
import { Connection, PublicKey, AccountInfo } from '@solana/web3.js'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { useMemo } from 'react'
import ToPublicKey from '@/utils/publicKey'
import logMessage from '@/utils/log'
interface Props {
  name?: string
  publicKeyList?: (string | PublicKey)[]
  readFromCache?: boolean
  refreshInterval?: number
}

const fetcher = async ([connection, publicKeyList, name]: [Connection, string[], string]) => {
  logMessage('rpc: get multiple account info', name, publicKeyList.length, publicKeyList[0])
  const commitment = useAppStore.getState().commitment

  const chunkSize = 100
  const keyGroup = []
  for (let i = 0; i < publicKeyList.length; i += chunkSize) {
    keyGroup.push(publicKeyList.slice(i, i + chunkSize))
  }

  const res = await Promise.all(
    keyGroup.map((list) =>
      connection.getMultipleAccountsInfoAndContext(
        list.map((publicKey) => ToPublicKey(publicKey)),
        commitment
      )
    )
  )
  return res.flat()
  // return connection.getMultipleAccountsInfoAndContext(
  //   publicKeyList.map((publicKey) => ToPublicKey(publicKey)),
  //   { commitment }
  // )
}

export default function useFetchMultipleAccountInfo(props: Props) {
  const connection = useAppStore((s) => s.connection)

  const { publicKeyList = [], name = '', refreshInterval = MINUTE_MILLISECONDS * 2 } = props || {}
  const shouldFetch = connection && publicKeyList.length

  const readyList = Array.from(new Set(publicKeyList.filter(Boolean).map((p) => p.toString())))
  const { data, isLoading, error, ...rest } = useSWR(shouldFetch ? [connection, readyList, name] : null, fetcher, {
    refreshInterval,
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval
  })

  const dataWithId: { [key: string]: AccountInfo<Buffer> | null } = useMemo(() => {
    const allData = data?.map((d) => d.value).flat() || []
    return (
      allData.reduce(
        (acc, cur, idx) => ({
          ...acc,
          [readyList[idx]]: cur
        }),
        {}
      ) || {}
    )
  }, [data])
  const isEmptyResult = !isLoading && !(data && !error)
  const mapData = useMemo(
    () =>
      data
        ? {
            context: data?.[0].context,
            value: publicKeyList.map((p) => dataWithId[p.toString()])
          }
        : data,
    [data]
  )

  return {
    data: mapData,
    dataWithId,
    isLoading,
    error,
    isEmptyResult,
    slot: data?.[0].context.slot ?? 0,
    ...rest
  }
}
