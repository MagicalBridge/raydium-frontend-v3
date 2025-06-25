import { useEffect } from 'react'
import useWalletSign from './useWalletSign'

export default function useCheckToken() {
  const { checkToken } = useWalletSign()

  useEffect(() => {
    const interval = window.setInterval(() => {
      checkToken({ checkTime: true })
    }, 60 * 30 * 1000)

    return () => window.clearInterval(interval)
  }, [])

  return { checkToken }
}
