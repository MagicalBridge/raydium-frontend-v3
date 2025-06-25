import { useEffect, useState } from 'react'

import { LocalStorageKey } from '@/constants/localStorage'

export const setLocalStorage = <Value>({ key, value }: { key: LocalStorageKey; value: Value }) => {
  if (value === undefined) {
    removeLocalStorage({ key })
    return
  }

  const serializedValue = JSON.stringify(value)

  globalThis.localStorage.setItem(key, serializedValue)
}

export const getLocalStorage = <Value>({
  key,
  defaultValue,
  validateFn
}: {
  key: LocalStorageKey
  defaultValue?: Value
  validateFn?: (value: Value) => boolean
}) => {
  try {
    const unserializedValue = globalThis.localStorage.getItem(key)

    if (unserializedValue !== null) {
      const value = JSON.parse(unserializedValue) as Value
      if (validateFn && !validateFn(value)) throw new Error('Unsupported value')

      return value
    }
  } catch (error) {
    console.log('getLocalStorage', error)
    removeLocalStorage({ key })
  }

  return defaultValue!
}

const removeLocalStorage = ({ key }: { key: LocalStorageKey }) => {
  globalThis.localStorage.removeItem(key)
}

export const useLocalStorage = <Value>({
  key,
  defaultValue,
  validateFn
}: {
  key: LocalStorageKey
  defaultValue: Value
  validateFn?: (value: Value) => boolean
}) => {
  const [value, setValue] = useState(getLocalStorage({ key, defaultValue, validateFn }))

  // Sync localStorage values across parallel browser sessions
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (key === e.key) {
        try {
          const newValue = e.newValue ? (JSON.parse(e.newValue) as Value) : undefined
          if (newValue !== undefined) setValue(newValue)
        } catch (error) {
          console.log('useLocalStorage/onStorage', error)
          return false
        }
      }
      return undefined
    }

    globalThis.window.addEventListener('storage', onStorage)

    return () => globalThis.window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    setLocalStorage({ key, value })
  }, [value])

  return [value, setValue] as const
}
