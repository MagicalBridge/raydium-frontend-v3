import { useState, useEffect } from 'react'

export function useObjectUrl(file: File | Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  return url
}
