import { useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TorqueRaffle, TorqueUserRaffleDay } from '../types'
import { fetchRaffleDetails, formatBadDateString } from '../utils'
import dayjs, { Dayjs } from 'dayjs'
import weekday from 'dayjs/plugin/weekday'

dayjs.extend(weekday)

export function useTorqueRaffle() {
  const interval = useRef<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [refetching, setRefetching] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [raffle, setRaffle] = useState<TorqueRaffle>()

  const wallet = useWallet()

  const fetchLeaderboard = useCallback(
    async (refetching = false) => {
      if (refetching) {
        setRefetching(true)
      } else {
        setLoading(true)
      }

      try {
        // Using empty wallet is none is there to then be able to populate the details in the UI
        const raffleDetails = await fetchRaffleDetails(wallet.publicKey?.toBase58() ?? undefined)

        const todayUtc = dayjs().utc()

        const days: { day: Dayjs; threshold: number }[] = []
        let startTime = dayjs()
        let endTime = dayjs()

        Object.entries(raffleDetails.config.dailyVolumeRequired).forEach(([day, volume]) => {
          // The date is formatted as M-D-YY but in Safari it doesn't see it as a valid date so we need to convert it to a valid date in it's eyes
          const strDate = formatBadDateString(day, true)
          const formattedDay = dayjs(strDate).utc()
          days.push({ day: formattedDay, threshold: volume })
          if (formattedDay.isBefore(startTime)) {
            startTime = formattedDay
          }
          if (formattedDay.isAfter(endTime)) {
            endTime = formattedDay
          }
        })

        const userDetails =
          raffleDetails.volumes.length > 0
            ? raffleDetails.volumes.reduce<{
                days: TorqueUserRaffleDay[]
                currentDayTotal: number
                totalTickets: number
                todaysDate: Dayjs
              }>(
                (acc, volume) => {
                  // The date is formatted as M-D-YY but in Safari it doesn't see it as a valid date so we need to convert it to a valid date in it's eyes
                  const dayForDisplay = dayjs(formatBadDateString(volume.day))
                  // We need to use the UTC date for comparison because the date is stored in UTC and we compare locally to UTC
                  const dayForComparison = dayjs(formatBadDateString(volume.day, true))

                  const dailyThreshold = raffleDetails.config.dailyVolumeRequired[volume.day]

                  if (!dailyThreshold) {
                    throw new Error(`Threshold not found for day: ${dayForDisplay.format('DD-MM-YYYY')}`)
                  }

                  acc.days.push({
                    day: dayForDisplay,
                    ticketAchieved: volume.volume >= dailyThreshold,
                    dayInitial: dayForDisplay.format('dd'),
                    tense: dayForComparison.utc().isSame(todayUtc, 'day')
                      ? 'PRESENT'
                      : dayForComparison.utc().isAfter(todayUtc, 'day')
                      ? 'FUTURE'
                      : 'PAST',
                    threshold: dailyThreshold
                  })
                  acc.totalTickets += volume.volume >= dailyThreshold ? 1 : 0
                  if (dayForComparison.utc().isSame(todayUtc, 'day')) {
                    acc.currentDayTotal = volume.volume
                    acc.todaysDate = dayjs.utc(formatBadDateString(volume.day, true))
                  }
                  return acc
                },
                { days: [], currentDayTotal: 0, totalTickets: 0, todaysDate: dayjs() }
              )
            : undefined

        setRaffle({
          ...raffleDetails.config,
          startTime: startTime.startOf('day'),
          endTime: endTime.endOf('day'),
          lastUpdated: dayjs(raffleDetails.volumes.find((volume) => dayjs(volume.day).isSame(todayUtc, 'day'))?.updatedAt),
          days,
          userDetails,
          todaysThreshold: raffleDetails.config.dailyVolumeRequired[todayUtc.format('M-D-YY')]
        })
      } catch (error) {
        setError(error as string)
      } finally {
        setLoading(false)
        setRefetching(false)
      }
    },
    [wallet?.publicKey]
  )

  useEffect(() => {
    fetchLeaderboard()

    interval.current = setInterval(() => {
      fetchLeaderboard(true)
      // Refetch every 1 minute
    }, 1 * 60 * 1000)

    return () => {
      if (interval.current) {
        clearInterval(interval.current)
      }
    }
  }, [wallet?.publicKey])

  return {
    raffle,
    loading,
    error,
    refetching
  }
}
