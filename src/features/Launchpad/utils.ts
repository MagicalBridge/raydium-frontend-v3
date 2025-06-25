import { getStorageItem, setStorageItem } from '@/utils/localStorage'
import { useRouteQuery } from '@/utils/routeTools'
import { PublicKey } from '@solana/web3.js'
import dayjs from 'dayjs'
import BN from 'bn.js'
import { defaultShareFeeRate } from '@/store/useLaunchpadStore'

export function createTimeDiff(created: number) {
  const createDayjs = dayjs(created)
  const now = dayjs()
  const [day, hour, minutes] = [now.diff(createDayjs, 'day'), now.diff(createDayjs, 'hour'), now.diff(createDayjs, 'minute')]

  return (day || hour || minutes) + (day ? 'd' : hour ? 'h' : 'm')
}

const MINT_WATCH_KEY = '_r_m_watch_'

export function getMintWatchList() {
  return new Set((getStorageItem(MINT_WATCH_KEY) || '').split(',').filter(Boolean))
}

export function setMintWatchList(mintList: string[]) {
  return setStorageItem(MINT_WATCH_KEY, mintList.join(','))
}

export function useReferrerQuery(prefix?: string) {
  const query = useRouteQuery()
  return query['lreferrer'] ? `${prefix ?? ''}lreferrer=${query['lreferrer']}` : ''
}

const BN_ZERO = new BN(0)
export function useLaunchPadShareInfo(): {
  wallet: PublicKey | undefined
  shareFeeRate: BN
} {
  const query = useRouteQuery()
  const shareWallet = query['lreferrer']
  if (!shareWallet)
    return {
      wallet: undefined,
      shareFeeRate: BN_ZERO
    }
  try {
    return {
      wallet: new PublicKey(shareWallet),
      shareFeeRate: defaultShareFeeRate
    }
  } catch {
    return {
      wallet: undefined,
      shareFeeRate: BN_ZERO
    }
  }
}
