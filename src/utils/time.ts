/** timeA is before timeB */
export const isBefore = (timeA: number, timeB: number) => timeA < timeB

/** timeA is after timeB */
export const isAfter = (timeA: number, timeB: number) => timeA > timeB

export const DATE_FORMAT_REGEX = 'YYYY-MM-DD HH:mm'
export const DATE_FORMAT_REGEX_UTC = 'YYYY-MM-DD HH:mm UTC'
export const HOUR_SECONDS = 3600
export const DAY_SECONDS = HOUR_SECONDS * 24
export const MONTH_SECONDS = 2628000
export const YEAR_SECONDS = 31536000
// duration should be seconds
export const getDurationUnits = (duration: number) => {
  const months = Math.floor(duration / MONTH_SECONDS)
  const days = Math.floor(duration / DAY_SECONDS)
  const hours = Math.floor((duration % DAY_SECONDS) / HOUR_SECONDS)
  const minutes = Math.floor((duration % HOUR_SECONDS) / 60)
  const seconds = Math.floor(duration % 60)
  return {
    months,
    days,
    hours,
    minutes,
    seconds,
    text: [[`${days}D`, ...(hours ? [`${hours}H`] : [])].join(' ')]
  }
}

export const getDurationUText = (duration: number) => {
  const years = Math.floor(duration / YEAR_SECONDS)
  const months = Math.floor(duration / MONTH_SECONDS)
  const weeks = Math.floor(duration / DAY_SECONDS / 7)
  const days = Math.floor(duration / DAY_SECONDS)
  return {
    years,
    months,
    weeks,
    days,
    text: years ? `${years} years` : months ? `${months} months` : weeks ? `${weeks} weeks` : days ? `${days} days` : ''
  }
}

export const timeBasis = {
  day: '24h',
  week: '7d',
  month: '30d'
}

export const timeBasisOptions = Object.values(timeBasis)

export const getTimeBasis = (idx: number) => {
  return timeBasisOptions[idx]
}
