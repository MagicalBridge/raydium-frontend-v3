import { useMemo } from 'react'

const enum WalletColorIndex {
  DEFAULT = 0,
  MAX_COLORS = 7
}

const WALLET_COLORS = ['#FF4EA3', '#FED33A', '#FF7043', '#22D1F8', '#8C6EEF', '#4F53F3', '#BFD2FF'] as const

type WalletColors = typeof WALLET_COLORS
type WalletColor = WalletColors[number]

const colorCache = new Map<string, WalletColor>()

const computeAddressHash = (address: string): number => {
  return Array.from(address).reduce((hash, char) => {
    const code = char.charCodeAt(0)
    return ((hash << 5) - hash + code) | 0
  }, 0)
}

const getWalletColor = (address?: string | null): WalletColor => {
  if (!address?.trim()) {
    return WALLET_COLORS[WalletColorIndex.DEFAULT]
  }

  const normalizedAddress = address.toLowerCase()

  const cachedColor = colorCache.get(normalizedAddress)
  if (cachedColor) {
    return cachedColor
  }

  const hash = computeAddressHash(normalizedAddress)
  const colorIndex = Math.abs(hash) % WalletColorIndex.MAX_COLORS
  const color = WALLET_COLORS[colorIndex]

  colorCache.set(normalizedAddress, color)

  return color
}

export const useWalletColor = (address?: string | null): WalletColor => {
  return useMemo(() => getWalletColor(address), [address && address.toLowerCase()])
}
