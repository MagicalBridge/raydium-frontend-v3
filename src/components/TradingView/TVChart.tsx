import {
  LanguageCode,
  ResolutionString,
  EntityId,
  TradingTerminalWidgetOptions,
  widget as Widget,
  ChartPropertiesOverrides,
  Timezone,
  Bar
} from '@/charting_library'
import { useEffect, useMemo, useState } from 'react'
import { Themes, THEME_NAMES, AppTheme, AppColorMode } from './TvTheme'
import { Box, useColorMode } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import Datafeed from './datafeed'
import DatafeedBirdeye from './datafeedBirdeye'
import { closeSocket, setArrowListener } from './streaming'
import { useTradingViewStore } from '@/store/useTradingViewStore'
import { getSavedResolution } from './utils'
import { useAppStore, useLaunchpadStore } from '@/store'
import { formatCurrency } from '@/utils/numberish/formatter'
import { SymbolInfo } from './type'
import { isEmpty } from 'lodash'
import axiosInstance from '@/api/axios'
import { Subject } from 'rxjs'
import { MintInfo } from '@/features/Launchpad/type'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

export const refreshChartSubject = new Subject<string>()
const isIFrame = (element: HTMLElement | null): element is HTMLIFrameElement => element !== null && element.tagName === 'IFRAME'

export default function TVChart({
  poolId,
  height = '100%',
  id = 'tv-chart',
  birdeye,
  mintInfo,
  mintBInfo,
  curveType,
  needRefresh
}: {
  poolId?: string
  mint?: string
  height?: string
  id?: string
  birdeye?: boolean
  mintInfo?: MintInfo
  mintBInfo?: ApiV3Token
  curveType?: number
  needRefresh?: boolean
}) {
  const { colorMode } = useColorMode()
  const connection = useAppStore((s) => s.connection)
  const [reloadChartTag, setReloadChartTag] = useState(0)
  const [refreshChartMint, setRefreshChartMint] = useState('')
  const appTheme = colorMode === 'light' ? AppTheme.Light : AppTheme.Dark
  const appColorMode = AppColorMode.GreenUp
  const theme = Themes[appTheme][appColorMode]
  const { i18n } = useTranslation()
  const locale = i18n.language === 'zh-CN' ? 'zh' : i18n.language

  const updateChartConfig = useTradingViewStore((s) => (birdeye ? s.updateBirdeyeChartConfig : s.updateChartConfig))

  const savedTvChartConfig = useTradingViewStore((s) => (birdeye ? s.birdeyeChartConfig : s.chartConfig))
  const savedResolution = useMemo(() => getSavedResolution({ savedConfig: savedTvChartConfig }), [savedTvChartConfig])

  const isNeedRefreshData = needRefresh || (refreshChartMint && refreshChartMint === mintInfo?.mint)

  useEffect(() => {
    refreshChartSubject.asObservable().subscribe((mint: string) => {
      setRefreshChartMint(mint)
    })
  }, [])

  useEffect(() => {
    if (!poolId || birdeye || !isNeedRefreshData || !connection) return

    const checkData = async () => {
      try {
        const { data } = await axiosInstance.get(`${useLaunchpadStore.getState().historyHost}/kline?poolId=${poolId}&interval=1m&limit=1`)
        return data.rows.length > 0
        // if (data.rows.length > 0) {
        //   const poolData = await connection.getAccountInfo(ToPublicKey(poolId), { commitment: 'confirmed' })
        //   return !!poolData
        // }
        // return false
      } catch {
        return false
      }
    }

    let count = 0
    const interval = window.setInterval(() => {
      checkData().then((r) => {
        console.log('hasData:', r)
        if (r || count++ >= 15) {
          window.clearInterval(interval)
          setReloadChartTag(Date.now())
        }
      })
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [birdeye, isNeedRefreshData, poolId, connection])

  useEffect(() => {
    if (!connection || !poolId) return

    const overrides = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as Timezone,
      'paneProperties.background': theme.layer0,
      'paneProperties.horzGridProperties.color': theme.layer1,
      'paneProperties.vertGridProperties.color': theme.layer1,
      'paneProperties.crossHairProperties.style': 1,
      'paneProperties.legendProperties.showBarChange': true,
      'paneProperties.legendProperties.showVolume': false,
      'paneProperties.legendProperties.showSeriesTitle': false,
      'paneProperties.legendProperties.backgroundTransparency': 50,
      'paneProperties.legendProperties.showStudyTitles': false,
      'paneProperties.legendProperties.showStudyArguments': false,
      'paneProperties.legendProperties.showSeriesOHLC': true,
      'paneProperties.legendProperties.showPriceSource': true,
      'paneProperties.backgroundType': 'solid' as const,
      'paneProperties.topMargin': 10,
      'paneProperties.bottomMargin': 10,

      'mainSeriesProperties.style': 1,
      'mainSeriesProperties.candleStyle.upColor': theme.positive,
      'mainSeriesProperties.candleStyle.borderUpColor': theme.positive,
      'mainSeriesProperties.candleStyle.wickUpColor': theme.positive,
      'mainSeriesProperties.candleStyle.downColor': theme.negative,
      'mainSeriesProperties.candleStyle.borderDownColor': theme.negative,
      'mainSeriesProperties.candleStyle.wickDownColor': theme.negative,
      'mainSeriesProperties.statusViewStyle.symbolTextSource': 'ticker',
      'mainSeriesProperties.highLowAvgPrice.highLowPriceLabelsVisible': true,
      'mainSeriesProperties.highLowAvgPrice.highLowPriceLinesVisible': true,
      'mainSeriesProperties.highLowAvgPrice.averageClosePriceLabelVisible': true,

      'scalesProperties.textColor': theme.textPrimary,
      'scalesProperties.backgroundColor': theme.layer0,
      'scalesProperties.lineColor': theme.layer1,
      'scalesProperties.fontSize': 12,
      'scalesProperties.showSeriesPrevCloseValue': false,
      'scalesProperties.showSymbolLabels': false,
      'scalesProperties.showStudyPlotLabels': false,
      'scalesProperties.showFundamentalNameLabel': false,

      'chartEventsSourceProperties.breaks.visible': false,

      volumePaneSize: 'small'
    } as Partial<ChartPropertiesOverrides>

    const studies_overrides = {
      'volume.volume.color.0': theme.negative,
      'volume.volume.color.1': theme.positive,

      'relative strength index.plot.color': theme.accent,
      'relative strength index.plot.linewidth': 1.5
    }

    const ChartDataFeed = birdeye ? DatafeedBirdeye : Datafeed
    const resolutionSupported =
      savedResolution && ChartDataFeed.configurationData.supported_resolutions.indexOf(savedResolution as ResolutionString) > -1

    const options: TradingTerminalWidgetOptions = {
      // debug: true,
      container: id,
      library_path: '/charting_library/charting_library/',
      custom_css_url: '/tradingview.css',
      autosize: true,
      disabled_features: [
        'header_symbol_search',
        'header_compare',
        'symbol_search_hot_key',
        'symbol_info',
        'go_to_date',
        'header_layouttoggle',
        'trading_account_manager',
        'hide_main_series_symbol_from_indicator_legend',
        'display_market_status',
        'volume_force_overlay',
        'header_undo_redo'
      ],
      enabled_features: [
        'side_toolbar_in_fullscreen_mode',
        'remove_library_container_border',
        'hide_last_na_study_output',
        'dont_show_boolean_study_arguments',
        'hide_left_toolbar_by_default',
        'hide_right_toolbar'
      ],

      theme: THEME_NAMES[appTheme],
      overrides,

      studies_overrides,
      loading_screen: {
        backgroundColor: theme.layer0,
        foregroundColor: theme.layer0
      },
      time_frames: [],
      symbol: poolId, // Default symbol

      datafeed: new ChartDataFeed({ connection, mintInfo, mintBInfo, curveType }),
      interval: (resolutionSupported ? savedResolution : birdeye ? '15' : '5') as ResolutionString,
      locale: locale as LanguageCode,
      numeric_formatting: { decimal_sign: '.', grouping_separator: '.' },
      saved_data: !isEmpty(savedTvChartConfig) ? savedTvChartConfig : undefined,
      custom_formatters: {
        priceFormatterFactory: (symbolInfo, minTick) => {
          if (symbolInfo === null) return null
          const decimals = (symbolInfo as SymbolInfo).decimals
          return {
            format: (price, signPositive) => {
              return formatCurrency(price.toFixed(20), { maximumDecimalTrailingZeroes: 5, decimalPlaces: decimals })
            }
          }
        }
        // studyFormatterFactory: (format, symbol) => {
        //   if (!symbol) return null
        //   if (format.type === 'volume') {
        //     const decimals = (symbol as any).decimals
        //     return {
        //       format: (val) => {
        //         return formatCurrency((val! / 10 ** 6).toFixed(decimals), {
        //           maximumDecimalTrailingZeroes: 5,
        //           decimalPlaces: decimals
        //         })
        //       }
        //     }
        //   }
        //   return null
        // }
      },
      auto_save_delay: 1
    }

    const tvChartWidget = new Widget(options)

    let lastInterval = 0
    let lastEntityId: EntityId
    let mCapButton: null | HTMLElement

    // landed launchpad
    if (birdeye && mintInfo) {
      tvChartWidget.headerReady().then(function () {
        mCapButton = tvChartWidget.createButton()
        mCapButton.style.cursor = 'pointer'
        mCapButton.innerHTML = "<span style='color:#2937e8'>Price</span>/<span>Mcap</span>"

        mCapButton.addEventListener('click', function () {
          const isMarketCap = tvChartWidget.activeChart().symbolExt()?.name.includes('marketcap')
          tvChartWidget.setSymbol(`${poolId}${isMarketCap ? '' : '_marketcap'}`, tvChartWidget.activeChart().resolution(), () => {
            // mCapButton!.innerHTML = `<span ${isMarketCap ? "style='color:#2937e8'" : ''}>Price</span> / <span ${
            //   !isMarketCap ? "style='color:#2937e8'" : ''
            // }>Mcap</span>`
          })
        })

        tvChartWidget.activeChart().onSymbolChanged().unsubscribeAll(null)
        tvChartWidget
          .activeChart()
          .onSymbolChanged()
          .subscribe(null, () => {
            const isMarketCap = tvChartWidget.activeChart().symbolExt()?.name.includes('marketcap')
            mCapButton!.innerHTML = `<span ${isMarketCap ? '' : "style='color:#2937e8'"}>Price</span> / <span ${
              !isMarketCap ? '' : "style='color:#2937e8'"
            }>Mcap</span>`
          })
      })
    }

    tvChartWidget.onChartReady(() => {
      const chartIns = tvChartWidget.activeChart()
      chartIns.removeAllShapes() // clear all shapes
      const priceScale = chartIns.getPanes()[0].getMainSourcePriceScale()
      priceScale?.setAutoScale(true)
      const volumeScale = chartIns.getPanes()[1]?.getRightPriceScales()[0]
      volumeScale?.setAutoScale(true)

      // let dataMin = Number.MAX_SAFE_INTEGER
      // let dataMax = Number.MIN_SAFE_INTEGER

      tvChartWidget.applyOverrides(overrides)
      tvChartWidget.applyStudiesOverrides(studies_overrides)

      tvChartWidget.subscribe('onAutoSaveNeeded', () =>
        tvChartWidget.save((chartConfig: object) => {
          updateChartConfig(chartConfig)
        })
      )
      tvChartWidget.changeTheme(THEME_NAMES[appTheme]).then(() => {
        const tvChartId = (tvChartWidget as any)._id

        if (tvChartId) {
          const frame = document.getElementById(tvChartId)

          if (isIFrame(frame) && frame.contentWindow) {
            const innerHtml = frame.contentWindow.document.documentElement
            switch (appTheme) {
              case AppTheme.Dark:
                innerHtml.classList.remove('theme-light')
                innerHtml.classList.add('theme-dark')
                break
              case AppTheme.Light:
                innerHtml.classList.remove('theme-dark')
                innerHtml.classList.add('theme-light')
                break
              default:
                break
            }
          }
        }

        tvChartWidget.applyOverrides(overrides)
        tvChartWidget.applyStudiesOverrides(studies_overrides)

        const volumeStudyId = chartIns.getAllStudies().find((x) => x.name === 'Volume')?.id
        if (volumeStudyId) {
          const volume = chartIns.getStudyById(volumeStudyId)
          volume.applyOverrides({
            'volume.color.0': studies_overrides['volume.volume.color.0'],
            'volume.color.1': studies_overrides['volume.volume.color.1']
          })
        }
      })

      if (!birdeye) {
        // if (priceScale) {
        //   chartIns.exportData().then((r) => {
        //     r.data.forEach((point) => {
        //       const ohcl = point.slice(1)
        //       dataMin = Math.min(dataMin, ...ohcl)
        //       dataMax = Math.max(dataMax, ...ohcl)
        //     })
        //     const visibleRange = priceScale.getVisiblePriceRange()
        //     if (visibleRange && (visibleRange.from >= dataMin || visibleRange.to <= dataMax)) {
        //       priceScale?.setVisiblePriceRange({
        //         from: dataMin * 0.9,
        //         to: dataMax * 1.1
        //       })
        //     }
        //   })
        // }

        setArrowListener((prev: Bar, next: Bar) => {
          window.clearInterval(lastInterval)
          lastEntityId && chartIns.removeEntity(lastEntityId)
          chartIns.removeAllShapes()
          if (prev.close === next.close) return

          const isUp = !prev.close || next.close > prev.close

          try {
            const id = chartIns.createShape(
              {
                time: next.time * 1000000,
                price: isUp ? next.low : next.close
              },
              { shape: isUp ? 'arrow_up' : 'arrow_down', overrides: { fontsize: 8, visible: true, arrowColor: 'yellow' } }
            )!
            try {
              chartIns.bringToFront([id])
            } catch {
              console.info('bringToFront not works')
            }
            lastEntityId = id

            let i = 0
            lastInterval = window.setInterval(() => {
              const s = chartIns.getShapeById(id)
              i++
              if (i > 5) {
                clearInterval(lastInterval)
                chartIns.removeEntity(id)
                return
              }
              s.setProperties({ visible: !s.getProperties().visible })
            }, 100)

            // lastClose = d.close
          } catch (e) {
            console.log('reset')
            chartIns.resetData()
          }
        })
      }
    })

    return () => {
      // if (onTickCbk) tvChartWidget.unsubscribe('onTick', onTickCbk)
      setArrowListener(undefined)
      tvChartWidget.remove()

      clearInterval(lastInterval)
    }
  }, [poolId, birdeye, id, theme, connection, reloadChartTag, mintInfo?.mint, mintBInfo?.address, curveType])

  useEffect(() => {
    if (connection) {
      return () => closeSocket(connection)
    }
  }, [connection])

  return <Box height={height} id={id} />
}
