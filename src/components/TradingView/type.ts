import { LibrarySymbolInfo } from '@/charting_library/charting_library'

export interface SymbolInfo extends LibrarySymbolInfo {
  poolId: string
  description: string
  type: string
  session: string
  exchange: string
  minmov: number
  pricescale: number
  has_intraday: boolean
  has_no_volume: boolean
  has_weekly_and_monthly: boolean
  volume_precision: number
  mintA: string
  mintB: string
  decimals: number
}

export const ResolutionToSeconds = {
  1: 60,
  5: 5 * 60,
  15: 15 * 60,
  60: 60 * 60,
  240: 60 * 60 * 4,
  '1D': 60 * 60 * 24,
  '1W': 60 * 60 * 24 * 7,
  '1M': 60 * 60 * 24 * 30
}
