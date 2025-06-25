import { Bar } from '@/charting_library/charting_library'
import { ResolutionToSeconds, SymbolInfo } from './type'
import { Connection } from '@solana/web3.js'
import { Curve, LaunchpadPool, LaunchpadPoolInfo } from '@raydium-io/raydium-sdk-v2'
import ToPublicKey from '@/utils/publicKey'
import { initPoolPriceDecimal } from './utils'

const channelToSubscription = new Map<
  string,
  {
    subscriberUID: string
    resolution: string
    lastDailyBar: Bar
    curveType: number
    mintBDecimals: number
    handlers: {
      id: string
      callback: (data: Bar) => void
    }[]
  }
>()

let lastSocketSubscribe:
  | {
      poolId: string
      subscribeId: number
    }
  | undefined

function logMessage(...args: any) {
  if (typeof window === 'undefined') return
  if (window.location.host.includes('raydium.io')) return
  console.log(...args)
}

export function closeSocket(connection: Connection) {
  if (lastSocketSubscribe) {
    logMessage('[closeSocket]: unsubscribe pool streaming, pool:', lastSocketSubscribe.poolId)
    connection.removeAccountChangeListener(lastSocketSubscribe.subscribeId)
  }
  lastSocketSubscribe = undefined
}

let arrowListener: ((pre: Bar, next: Bar) => void) | undefined
export const setArrowListener = (func: any) => (arrowListener = func)

const poolListener = new Map<string, ((data: LaunchpadPoolInfo) => void)[]>()
export const addPoolListener = (poolId: string, func: (data: LaunchpadPoolInfo) => void) => {
  const current = poolListener.get(poolId) || []
  poolListener.set(poolId, [...current, func])
}

export const removePoolListener = (poolId: string, func: (data: LaunchpadPoolInfo) => void) => {
  const current = poolListener.get(poolId) || []
  poolListener.set(
    poolId,
    current.filter((cbk) => cbk !== func)
  )
}

export async function startSocket({ connection, poolId }: { connection: Connection; poolId: string }) {
  if (lastSocketSubscribe) {
    if (lastSocketSubscribe.poolId !== poolId) connection.removeAccountChangeListener(lastSocketSubscribe.subscribeId)
    else return
  }

  logMessage('[startSocket]: subscribe pool streaming. Channel:', poolId)

  lastSocketSubscribe = {
    poolId,
    subscribeId: connection.onAccountChange(
      ToPublicKey(poolId),
      (d) => {
        const subscriptionItem = channelToSubscription.get(poolId)
        if (subscriptionItem === undefined) {
          return
        }
        const poolInfo = LaunchpadPool.decode(d.data)
        try {
          const cbkList = poolListener.get(poolId) || []
          cbkList.forEach((func) => func(poolInfo))
        } catch {
          //
        }

        const tradePrice = Curve.getPrice({
          poolInfo,
          curveType: subscriptionItem.curveType,
          decimalA: poolInfo.mintDecimalsA,
          decimalB: poolInfo.mintDecimalsB
        }).toNumber()

        const tradeTime = Date.now()
        const lastDailyBar = { ...subscriptionItem.lastDailyBar }

        const unit = 1000 * ResolutionToSeconds[subscriptionItem.resolution as keyof typeof ResolutionToSeconds]
        const newBarTime = Math.floor(tradeTime / unit) * unit
        let bar: Bar
        if (newBarTime > lastDailyBar.time || !lastDailyBar.time) {
          bar = {
            time: newBarTime,
            open: !lastDailyBar.time ? initPoolPriceDecimal : lastDailyBar.close,
            high: !lastDailyBar.time ? tradePrice : Math.max(tradePrice, lastDailyBar.close),
            low: !lastDailyBar.time ? Math.min(initPoolPriceDecimal, tradePrice) : Math.min(tradePrice, lastDailyBar.close),
            close: tradePrice
          }
          logMessage('[socket] Generate new bar', { lastDailyBar, bar })
        } else {
          bar = {
            ...lastDailyBar,
            high: Math.max(lastDailyBar.high, tradePrice),
            low: Math.min(lastDailyBar.low, tradePrice),
            close: tradePrice
          }
          logMessage('[socket] Update the latest bar by price', tradePrice, { lastDailyBar, bar })
        }

        subscriptionItem.lastDailyBar = { ...bar }
        channelToSubscription.set(poolId, subscriptionItem)

        // Send data to every subscriber of that symbol
        subscriptionItem.handlers.forEach((handler) => handler.callback(bar))
        arrowListener?.(lastDailyBar, bar)
      },
      { commitment: 'confirmed' }
    )
  }
}

export function subscribeOnStream({
  symbolInfo,
  resolution,
  subscriberUID,
  lastDailyBar,
  curveType = 0,
  mintBDecimals = 9,
  onRealtimeCallback
}: {
  symbolInfo: SymbolInfo
  resolution: string
  subscriberUID: string
  lastDailyBar: Bar
  curveType?: number
  mintBDecimals?: number
  onRealtimeCallback: (data: Bar) => void
  onResetCacheNeededCallback: () => void
}) {
  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback
  }
  let subscriptionItem = channelToSubscription.get(symbolInfo.poolId)
  if (subscriptionItem) {
    // Already subscribed to the channel, use the existing subscription
    subscriptionItem.handlers.push(handler)
    return
  }
  subscriptionItem = {
    subscriberUID,
    resolution,
    lastDailyBar,
    curveType,
    mintBDecimals,
    handlers: [handler]
  }
  channelToSubscription.set(symbolInfo.poolId, subscriptionItem)
  logMessage(
    '[subscribeBars]: Subscribe to streaming. Channel:',
    symbolInfo.poolId,
    subscriptionItem.resolution,
    new Date(subscriptionItem.lastDailyBar?.time)
  )
}

export function unsubscribeFromStream(subscriberUID: string) {
  // Find a subscription with id === subscriberUID
  for (const channelString of channelToSubscription.keys()) {
    const subscriptionItem = channelToSubscription.get(channelString)!
    const handlerIndex = subscriptionItem.handlers.findIndex((handler) => handler.id === subscriberUID)
    if (handlerIndex !== -1) {
      // Remove from handlers
      subscriptionItem.handlers.splice(handlerIndex, 1)
      if (subscriptionItem.handlers.length === 0) {
        // Unsubscribe from the channel if it was the last handler
        logMessage('[unsubscribeBars]: Unsubscribe from streaming. Channel:', channelString)
        channelToSubscription.delete(channelString)
        break
      }
    }
  }
}
