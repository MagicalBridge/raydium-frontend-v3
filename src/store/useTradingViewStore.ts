import { persist } from 'zustand/middleware'
import createStore from './createStore'

export interface TradingViewState {
  chartConfig?: object

  updateChartConfig: (config: object) => void

  birdeyeChartConfig?: object
  updateBirdeyeChartConfig: (config: object) => void
}

const initialState = {
  chartConfig: undefined,
  birdeyeChartConfig: undefined
}

export const useTradingViewStore = createStore<TradingViewState>(
  persist(
    (set) => ({
      ...initialState,
      updateChartConfig: (config: object) => {
        set({ chartConfig: config }, false, { type: 'updateChartConfig' })
      },
      updateBirdeyeChartConfig: (config: object) => {
        set({ birdeyeChartConfig: config }, false, { type: 'updateChartConfig' })
      }
    }),
    {
      name: 'persist:_r_tradingView',
      getStorage: () => localStorage
    }
  ),
  'useTradingViewStore'
)
