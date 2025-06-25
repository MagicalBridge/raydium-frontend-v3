import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useEvent } from '../useEvent'
import { toastSubject } from '../toast/useGlobalToast'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { getStorageItem, setStorageItem, deleteStorageItem } from '@/utils/localStorage'
import axios from '@/api/axios'
import base58 from 'bs58'
import { useLaunchpadStore } from '@/store'
import { isClient } from '@/utils/common'
import { onboardingDialogSubject } from '@/components/Dialogs/OnboardingDialog'

interface RequestTokenRes {
  id: string
  msg?: string
  success: boolean
  data: {
    token: string
  }
}

interface StorageToken {
  checkTime: number
  token: string
}

export default function useWalletSign() {
  const { signMessage, signTransaction, wallet, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const authHost = useLaunchpadStore((s) => s.authHost)

  const ledgerStorageKey = `_ray_ledger_${publicKey?.toBase58()}`
  const useLedger = wallet?.adapter.name === 'Ledger' || getStorageItem(ledgerStorageKey) === 'true'
  const tokenStorageKey = `_ray_pump_token_${publicKey?.toBase58()}`

  const getTokenFromStorage = useEvent((): StorageToken | undefined => {
    const storage = getStorageItem(tokenStorageKey)
    return storage ? JSON.parse(storage) : undefined
  })

  const showToastAndOpenOnboarding = useEvent(({ successCbk, errorCbk }: { successCbk?: () => void; errorCbk?: () => void }) => {
    errorCbk?.()
    toastSubject.next({
      status: 'warning',
      title: 'Token Expired',
      description: 'Please sign in again'
    })
    onboardingDialogSubject.next({ open: true, successCbk })
  })

  const checkToken = useEvent(
    async ({ checkTime, successCbk, errorCbk }: { checkTime?: boolean; successCbk?: () => void; errorCbk?: () => void }) => {
      if (!isClient()) return
      const tokenData = getTokenFromStorage()
      try {
        if (!tokenData) {
          errorCbk?.()
          onboardingDialogSubject.next({ open: true, successCbk })
          return false
        }

        if (checkTime && Math.floor(Date.now() / 1000) - tokenData.checkTime < 60 * 60) {
          useLaunchpadStore.setState({ token: tokenData.token })
          return true
        }

        const data: {
          data: string // 'OK'
          id: string
          success: boolean
        } = await axios.get(authHost + `/check-token?wallet=${publicKey!.toBase58()}&token=${tokenData.token}`)
        useLaunchpadStore.setState({ token: tokenData.token })
        if (data.success) {
          setStorageItem(
            tokenStorageKey,
            JSON.stringify({
              ...tokenData,
              checkTime: Math.floor(Date.now() / 1000)
            })
          )
          return true
        }
        console.log('auth token check failed')
        showToastAndOpenOnboarding({ successCbk, errorCbk })
        return false
      } catch {
        console.log('auth token check error')
        showToastAndOpenOnboarding({ successCbk, errorCbk })
        return false
      }
    }
  )

  const signVerifyMessage = useEvent(async ({ isLedger }: { isLedger?: boolean }) => {
    if (!publicKey) {
      setVisible(true)
      toastSubject.next({
        status: 'error',
        title: 'Wallet not connected',
        description: 'Please Connect wallet first'
      })
      return
    }

    try {
      const msgDef = 'Sign in to raydium.io: '
      const time = Math.floor(new Date().getTime() / 1000)
      const signInMsg = `${msgDef}${time}`

      if (isLedger ?? useLedger) {
        const signInTx = new Transaction()
        signInTx.add(
          new TransactionInstruction({
            data: Buffer.from(signInMsg),
            programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
            keys: []
          })
        )

        signInTx.feePayer = publicKey
        signInTx.recentBlockhash = PublicKey.default.toString()
        const signedTx = await signTransaction!(signInTx)

        const res: RequestTokenRes = await axios.post(authHost + '/request-token-ledger', {
          wallet: publicKey.toString(),
          time,
          transaction: signedTx.serialize().toString('base64')
        })
        if (!res.success) {
          throw new Error(res.msg || 'request ledger token error')
        }
        setStorageItem(
          tokenStorageKey,
          JSON.stringify({
            checkTime: time,
            token: res.data.token
          })
        )
        setStorageItem(ledgerStorageKey, 'true')
        return res.data.token
      }

      const encodeStr = new TextEncoder().encode(signInMsg)
      const signature = await signMessage!(encodeStr)
      const res: RequestTokenRes = await axios.post(
        authHost + '/request-token',
        {
          wallet: publicKey.toString(),
          time,
          signature: base58.encode(signature)
        },
        { skipError: true }
      )

      if (!res.success) {
        throw new Error(res.msg || 'request token error')
      }

      setStorageItem(
        tokenStorageKey,
        JSON.stringify({
          checkTime: Date.now(),
          token: res.data.token
        })
      )
      deleteStorageItem(ledgerStorageKey)
      return res.data.token
    } catch (e: any) {
      toastSubject.next({
        status: 'error',
        title: 'Sign message error',
        description: e.message
      })
      return
    }
  })

  const deleteToken = useEvent(async (token: string) => {
    await axios.get(`${authHost}/del-token?token=${token}`)
  })

  return {
    useLedger,
    signVerifyMessage,
    deleteToken,
    checkToken,
    getTokenFromStorage
  }
}
