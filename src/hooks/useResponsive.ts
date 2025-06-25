import { useState, useEffect, createContext, useContext } from 'react'
import { useBreakpointValue } from '@chakra-ui/react'

export const MatchBreakpointsContext = createContext<BreakpointChecks>({
  isMobile: false,
  isTablet: false,
  isDesktopSmall: false,
  isDesktopMedium: false,
  isDesktopLarge: false
})

export type BreakpointChecks = {
  isMobile: boolean
  isTablet: boolean
  isDesktopSmall: boolean
  isDesktopMedium: boolean
  isDesktopLarge: boolean
}

const useResponsive = (): BreakpointChecks => {
  const [isClient, setIsClient] = useState(false)
  const breakPoints = useContext(MatchBreakpointsContext)

  const isMobile = useBreakpointValue({ base: true, sm: false }) || false
  const isTablet = useBreakpointValue({ sm: true, md: false }) || false
  const isDesktopSmall = useBreakpointValue({ md: true, lg: false }) || false
  const isDesktopMedium = useBreakpointValue({ lg: true, xl: false }) || false
  const isDesktopLarge = useBreakpointValue({ xl: true }) || false

  useEffect(() => {
    setIsClient(typeof window !== 'undefined')
  }, [])

  if (!isClient && breakPoints) {
    return breakPoints
  }

  return { isMobile, isTablet, isDesktopSmall, isDesktopMedium, isDesktopLarge }
}

export default useResponsive
