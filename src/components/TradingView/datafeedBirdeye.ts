import { useAppStore, useTokenStore } from '@/store'
import { subscribeOnStream, unsubscribeFromStream } from './streaming'
import axios from '@/api/axios'
import { ResolutionString, Bar, Timezone, SeriesFormat } from '@/charting_library/charting_library'
import { ResolutionToSeconds, SymbolInfo } from './type'
import { encodeStr } from '@/utils/common'
import { solToWSol, wSolToSolString } from '@/utils/token'
import { MintInfo } from '@/features/Launchpad/type'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

const lastBarsCache = new Map()
// DatafeedConfiguration implementation

export default class DataFeed {
  private _mintInfo?: MintInfo
  private _mintBInfo?: ApiV3Token

  constructor(props: { mintInfo?: MintInfo; mintBInfo?: ApiV3Token }) {
    this._mintInfo = props.mintInfo
    this._mintBInfo = props.mintBInfo
  }
  static configurationData = {
    // Represents the resolutions for bars supported by your datafeed
    supported_resolutions: ['1', '5', '15', '60', '240', '1D'] as ResolutionString[],

    // The `exchanges` arguments are used for the `searchSymbols` method if a user selects the exchange
    exchanges: [],
    // The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
    symbols_types: [],
    supports_group_request: true,
    supports_marks: false,
    supports_search: false,
    supports_timescale_marks: false
  }
  public onReady(callback: (data: any) => void) {
    console.log('[onReady]: Method call')
    setTimeout(() => callback(DataFeed.configurationData))
  }

  public async searchSymbols(_userInput: string, _exchange: string, _symbolType: string, onResultReadyCallback: (data: any[]) => void) {
    console.log('[searchSymbols]: Method call')
    onResultReadyCallback([])
  }

  public async resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: (symbol: SymbolInfo) => void,
    onResolveErrorCallback: any,
    _extension: any
  ) {
    const {
      urlConfigs: { BASE_HOST, MINT_INFO_ID }
    } = useAppStore.getState()
    console.log('[resolveSymbol]: Method call birdeye', symbolName)
    const [mintAAdress, mintBAdress, ext] = symbolName.split('_')
    if (!mintAAdress || !mintBAdress) {
      console.log('[resolveSymbol]: cannot resolve symbol', { mintAAdress, mintBAdress })
      onResolveErrorCallback('cannot resolve symbol')
      return
    }

    const tokenMap = useTokenStore.getState().tokenMap
    const [mintA, mintB] = [
      {
        symbol: this._mintInfo?.symbol || tokenMap.get(mintAAdress)?.symbol,
        decimals: Number(this._mintInfo?.decimals || 0) || tokenMap.get(mintAAdress)?.decimals
      },
      {
        symbol: this._mintBInfo?.symbol || tokenMap.get(mintBAdress)?.symbol,
        decimals: this._mintBInfo?.decimals || tokenMap.get(mintBAdress)?.decimals
      }
    ]

    if (mintA.decimals === undefined || mintA.symbol === undefined) {
      const { data: mintsData } = await axios.get(`${BASE_HOST}${MINT_INFO_ID}?mints=${mintAAdress}`)
      const data = mintsData[0]
      if (!data) {
        console.log('[resolveSymbol]: cannot resolve mintA', mintAAdress)
        onResolveErrorCallback('cannot resolve symbol')
        return
      }
      mintA.symbol = data.symbol
      mintA.decimals = data.decimals
    }

    if (this._mintBInfo === undefined) {
      const { data: mintsData } = await axios.get(`${BASE_HOST}${MINT_INFO_ID}?mints=${mintBAdress}`)
      const data = mintsData[0]
      if (!data) {
        console.log('[resolveSymbol]: cannot resolve mintB', mintBAdress)
        onResolveErrorCallback('cannot resolve symbol')
        return
      }
      mintB.symbol = data.symbol
      mintB.decimals = data.decimals
    }

    const tickerName = `${wSolToSolString(mintA.symbol || encodeStr(mintAAdress, 4))}-${wSolToSolString(
      mintB.symbol || encodeStr(mintBAdress, 4)
    )}${ext ? ` ${ext}` : ''}`
    const isMarketCap = ext === 'marketcap' && this._mintInfo

    const symbolInfo = {
      poolId: `${mintAAdress}_${mintBAdress}`,
      mintA: mintAAdress,
      mintB: mintBAdress,
      ticker: tickerName,
      name: tickerName,
      description: `${tickerName} pool`,
      type: 'birdeye data',
      session: '24x7',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as Timezone,
      exchange: 'birdeye',
      minmov: 1,
      pricescale: 10 ** (isMarketCap ? 2 : Math.max(mintA.decimals!, mintB.decimals!)),
      has_intraday: true,
      has_no_volume: true,
      has_weekly_and_monthly: false,
      supported_resolutions: DataFeed.configurationData.supported_resolutions,
      volume_precision: 4,
      listed_exchange: 'Raydium',
      format: 'price' as SeriesFormat,
      decimals: this._mintInfo ? (isMarketCap ? 2 : Math.max(mintA.decimals!, mintB.decimals!)) : Math.min(mintA.decimals!, mintB.decimals!)
    }
    console.log('[resolveSymbol]: Symbol resolved', symbolInfo)
    onSymbolResolvedCallback(symbolInfo)
  }

  public async getBars(
    symbolInfo: SymbolInfo,
    resolution: string,
    periodParams: { from: number; to: number; firstDataRequest: boolean },
    onHistoryCallback: (d: Bar[], params?: any) => any,
    onErrorCallback: (error: any) => any
  ) {
    const { from, to, firstDataRequest } = periodParams
    console.log('[getBars]: Method call', symbolInfo, resolution, from, to, firstDataRequest)
    const timeUnit = ResolutionToSeconds[resolution as keyof typeof ResolutionToSeconds]
    try {
      const frame = timeUnit >= ResolutionToSeconds['1D'] ? resolution : timeUnit <= ResolutionToSeconds['15'] ? `${resolution}m` : '15m'

      const isMarketCap = symbolInfo.name.includes('marketcap') && this._mintInfo
      const quoteAddress = isMarketCap ? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' : solToWSol(symbolInfo.mintB)
      const { data } = await axios.get(
        `https://birdeye-proxy.raydium.io/defi/ohlcv/base_quote?base_address=${solToWSol(
          symbolInfo.mintA
        )}&quote_address=${quoteAddress}&type=${frame}&time_from=${from}&time_to=${to}`
      )

      if (!data?.items.length) {
        console.log('[getBars]: No birdeye data')
        onHistoryCallback([], {
          noData: true
        })
        return
      }

      const bars: Bar[] = []
      let currentBar: Bar | undefined
      data.items.forEach((bar: any) => {
        if (bar.unixTime >= from && bar.unixTime < to) {
          const barTime = Math.floor(bar.unixTime / timeUnit) * timeUnit
          if (currentBar && barTime * 1000 > currentBar.time) {
            bars.push(currentBar)
            currentBar = undefined
          }

          const multiplier = isMarketCap ? this._mintInfo!.supply : 1
          if (!currentBar) {
            currentBar = {
              time: barTime * 1000,
              low: bar.l * multiplier,
              high: bar.h * multiplier,
              open: bar.o * multiplier,
              close: bar.c * multiplier,
              volume: bar.vQuote
            }
            return
          }
          currentBar = {
            ...currentBar,
            volume: (currentBar.volume || 0) + (bar.vQuote || 0),
            close: bar.c * multiplier,
            low: Math.min(bar.l * multiplier, currentBar.low),
            high: Math.max(bar.h * multiplier, currentBar.high)
          }
        }
      })
      if (currentBar) bars.push(currentBar)
      if (firstDataRequest) {
        lastBarsCache.set(symbolInfo.poolId, {
          ...bars[bars.length - 1]
        })
      }
      console.log(
        `[getBars]: returned ${bars.length} bar(s)`,
        bars.map((b) => ({ ...b, time: new Date(b.time) }))
      )
      onHistoryCallback(bars, {
        noData: false
      })

      return
    } catch (error) {
      console.log('[getBars]: Get error', error)
      onErrorCallback(error)
    }
  }

  public subscribeBars(
    symbolInfo: SymbolInfo,
    resolution: string,
    onRealtimeCallback: any,
    subscriberUID: string,
    onResetCacheNeededCallback: any
  ) {
    if (symbolInfo.exchange === 'birdeye') {
      console.log('[subscribeBars]: birdeye pool, not subscribe')
      return
    }
    console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID)
    subscribeOnStream({
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      lastDailyBar: lastBarsCache.get(symbolInfo.poolId)
    })
  }

  public unsubscribeBars(subscriberUID: string) {
    console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID)
    unsubscribeFromStream(subscriberUID)
  }
}
