import { toastSubject } from '@/hooks/toast/useGlobalToast'
import Head from 'next/head'
import { RefObject, useEffect, useImperativeHandle } from 'react'
import { Box, SystemStyleObject } from '@chakra-ui/react'

export type ActionRef = { validate: () => string | undefined }
interface Props {
  actionRef?: RefObject<ActionRef>
  sx?: SystemStyleObject
  show?: boolean
}

function activateTurnstile() {
  let retryCount = 0
  const id = turnstile.render('#cf-turnstile', {
    sitekey: process.env.NEXT_PUBLIC_TURNSTILE_ID || '1x00000000000000000000AA',
    async callback(token: string) {
      retryCount = 0
      console.log(`Challenge Success ${token}`)
    },
    'expired-callback': (token) => {
      console.log(`Challenge expired: ${token}`)
      if (retryCount++ < 3) {
        if (id) turnstile.reset(id)
        else turnstile.reset()
      }
    },
    'error-callback': (error: string) => {
      const isDomainError = error == '110200' || error == '400020'
      console.log(`Challenge error ${error}`)

      if (!isDomainError) {
        toastSubject.next({
          status: 'error',
          title: 'Validation Failed',
          description: `error: ${error}`
        })
        if (retryCount++ < 3) turnstile.reset()
      }
    }
  })
  // })
}

export default function Turnstile(props: Props) {
  useEffect(() => {
    if (!props.show) return
    if (!turnstile) {
      let loadCount = 0
      const intervalId = window.setInterval(() => {
        loadCount++
        if (!turnstile) {
          if (loadCount > 60) {
            window.clearInterval(intervalId)
            toastSubject.next({
              status: 'error',
              title: 'Load Turnstile failed..',
              description: 'Turnstile is not available, please try refresh page.'
            })
          }
          return
        }

        window.clearInterval(intervalId)
        activateTurnstile()
      }, 1000)

      return () => {
        window.turnstile?.remove()
        window.clearInterval(intervalId)
      }
    }
    activateTurnstile()

    return () => {
      window.turnstile?.remove()
    }
  }, [props.show])

  useImperativeHandle(props.actionRef, () => ({
    validate: () => {
      if (!window.turnstile) {
        toastSubject.next({
          status: 'info',
          title: 'Turnstile loading',
          description: 'Please wait validator loading..'
        })
        return
      }
      if (turnstile.isExpired()) {
        toastSubject.next({
          status: 'warning',
          title: 'Validation Expired',
          description: 'Please validate again'
        })
        turnstile.reset()
        return
      }
      return turnstile.getResponse()
    }
  }))

  return (
    <>
      <Head>
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" />
      </Head>
      <Box id="cf-turnstile" m="0 auto" sx={props.sx} data-theme="light" />
    </>
  )
}
