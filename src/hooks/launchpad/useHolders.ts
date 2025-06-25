import { useMemo } from 'react'
import { useAppStore } from '@/store'
import useSWR from 'swr'
import { AccountInfo, Connection, RpcResponseAndContext, TokenAccountBalancePair } from '@solana/web3.js'
import ToPublicKey from '@/utils/publicKey'
import Decimal from 'decimal.js'
import { MintLayout } from '@solana/spl-token'

const fetcher = async ([connection, mint, hasSupplyData]: [Connection, string, boolean | undefined]): Promise<
  [RpcResponseAndContext<TokenAccountBalancePair[]>, AccountInfo<Buffer> | null]
> => [
  await connection.getTokenLargestAccounts(ToPublicKey(mint)),
  hasSupplyData ? null : await connection.getAccountInfo(ToPublicKey(mint))
]

export default function useHolders({
  mint,
  supply,
  refreshInterval = 10 * 1000
}: {
  mint?: string
  supply?: number
  refreshInterval?: number
}) {
  const connection = useAppStore((s) => s.connection)
  const shouldFetch = !!mint && !!connection

  const { data, isLoading, error, ...rest } = useSWR(shouldFetch ? [connection, mint, !!supply] : null, fetcher, {
    refreshInterval,
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    keepPreviousData: true
  })

  const holders = useMemo(() => {
    if (!data) return []
    const mintData = !supply && data[1]?.data ? MintLayout.decode(data[1].data as any) : undefined
    const all = supply ? new Decimal(supply) : new Decimal(mintData ? mintData.supply.toString() : 0).div(10 ** (mintData?.decimals || 0))

    return (
      data[0]?.value.map((holder, idx) => ({
        rank: idx + 1,
        address: holder.address.toBase58(),
        percentage: new Decimal(holder.uiAmount || 0).div(all).mul(100).toDecimalPlaces(2).toNumber()
      })) ?? []
    )
  }, [data, supply])

  return {
    data: holders,
    isLoading,
    error,
    ...rest
  }
}
