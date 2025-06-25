export const isValidUrl = (url?: string) => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const getImgProxyUrl = (url: string, size: number) => `https://wsrv.nl/?fit=cover&w=${size}&h=${size}&url=${url}`
