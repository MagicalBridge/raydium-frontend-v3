import { useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TorqueLeaderboard, TorqueLeaderboardOffer } from '../types'
import { fetchTorqueLeaderboard, fetchLeaderboardOfferDetails } from '../utils'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import dayjs, { Dayjs } from 'dayjs'

const LEADERBOARD_ID = process.env.NEXT_PUBLIC_TORQUE_LEADERBOARD_ID || 'cmaaz4o7b00006ddrm6tdii0h'

export function useTorqueLeaderboard() {
  const interval = useRef<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [refetching, setRefetching] = useState<boolean>(false)
  const [lastUpdated, setLastUpdated] = useState<Dayjs>(dayjs())
  const [error, setError] = useState<string | null>(null)
  const [leaderboard, setLeaderboard] = useState<TorqueLeaderboard>()
  const offerDetailsRef = useRef<TorqueLeaderboardOffer>()

  const wallet = useWallet()

  const fetchLeaderboard = useCallback(
    async (refetching = false) => {
      if (refetching) {
        setRefetching(true)
      } else {
        setLoading(true)
      }

      try {
        if (!offerDetailsRef.current) {
          const offerDetails = await fetchLeaderboardOfferDetails()
          offerDetailsRef.current = offerDetails
        }

        const leaderboard = await fetchTorqueLeaderboard(LEADERBOARD_ID)

        const leaderboardEntries = leaderboard.entries.map((entry, index) => {
          const reward = offerDetailsRef.current?.positionRewards[index + 1]
            ? offerDetailsRef.current.positionRewards[index + 1]
            : undefined

          return {
            rank: index + 1,
            wallet: entry.user,
            amount: Math.round(entry.value / LAMPORTS_PER_SOL),
            reward
          }
        })

        setLeaderboard({
          id: leaderboard.config.id,
          name: offerDetailsRef.current?.name ?? leaderboard.config.name,
          totalRewards: offerDetailsRef.current?.totalRewards,
          rewardDenomination: offerDetailsRef.current?.rewardDenomination,
          description: offerDetailsRef.current?.description,
          startTime: dayjs(leaderboard.period.startDate),
          endTime: dayjs(leaderboard.period.endDate),
          usersPositions: leaderboardEntries.find((entry) => entry.wallet === wallet?.publicKey?.toBase58()),
          leaderboard: leaderboardEntries
        })
        setLastUpdated(dayjs(leaderboard.updatedAt))
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
    leaderboard,
    loading,
    error,
    lastUpdated,
    refetching
  }
}
