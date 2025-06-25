import { PublicKey } from '@solana/web3.js'
import { Dayjs } from 'dayjs'

export type TorqueConversion = {
  id: string
  convertedAt: string
  createdAt: string
  updatedAt: string
  offer: {
    id: string
    projectId: string
  }
  cranks: TorqueCrank[]
}

type TorqueCrank = {
  id: string
  status: 'DONE' | 'PENDING' | 'FAILED' | 'STAGED'
  sequenceNumber: number
  transaction: string
  webhookId: string | null
  allocation: {
    input: number
    output: number
  }
  isAsymmetricPayout: boolean
  createdAt: string
  updatedAt: string
  distributorId: string
}

export type TorqueRawOffer = {
  id: string
  status: 'ACTIVE' | 'COMPLETED'
  startTime: string
  endTime: string
  eligible: boolean
  eligibleAmount: number
  numberOfConversions: number
  metadata: {
    title: string
    description: string
  }
  distributors: TorqueDistributor[]
  campaignId?: string
  campaign?: TorqueCampaign
}

export type TorqueRawCampaign = {
  id: string
  name: string
  description: string
}

export type TorqueRawLeaderboard = {
  config: {
    id: string
    name: string
    startDate: string
    endDate: string
    limit: number
    interval: 'DAILY' | 'WEEKLY'
  }
  period: {
    startDate: string
    endDate: string
  }
  entries: {
    user: string
    value: number
  }[]
  updatedAt: string
}

type TorqueDistributor = {
  pubkey: string
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED'
  crankerStatus: 'IDLE' | 'CRANKING' | 'CRANKED'
  type: 'CONVERSION'
  emissionType: 'SOL' | 'TOKENS' | 'NFT' | 'POINTS'
  tokenAddress?: string
  tokenDecimals?: number
  totalFundAmount: number
  crankGuard: {
    id: string
    recipient: 'USER' | 'PUBLISHER' | 'BOTH' | 'NONE'
    activation: {
      type: 'OFFER_START' | 'OFFER_END'
      requiredConversionCount: number
    }
    availability: {
      maxConversionsPerRecipient: number
      maxTotalConversions: number
    }
  }
  distributionFunction: {
    id: string
    type: 'CONSTANT' | 'LINEAR' | 'EXPONENTIAL' | 'STEP'
    yIntercept: number
    trend: 'NEGATIVE' | 'POSITIVE' | null
    slope: number | null
    curveDepth: number | null
    curveWidth: number | null
  }
}

export type TorqueOffer = {
  id: string
  name: string
  description: string
  image?: string
  status: 'ACTIVE' | 'CLAIMED' | 'PENDING' | 'EXPIRED' | 'INELIGIBLE'
  startTime: Dayjs
  endTime: Dayjs
  eligible: boolean
  rewardPerUser: number
  rewardTotal: number
  rewardDenomination: string
  numberOfConversions: number
  maxParticipants: number
  txSignature?: string
  distributor?: PublicKey
  campaignId?: string
}

export type TorqueCampaign = Pick<
  TorqueOffer,
  | 'id'
  | 'name'
  | 'description'
  | 'rewardTotal'
  | 'maxParticipants'
  | 'numberOfConversions'
  | 'rewardDenomination'
  | 'status'
  | 'startTime'
  | 'endTime'
> & {
  offers: TorqueOffer[]
}

export type TorqueLeaderboard = {
  id: string
  name: string
  description: string
  totalRewards: number
  rewardDenomination: string
  startTime: Dayjs
  endTime: Dayjs
  leaderboard: TorqueLeaderboardPosition[]
  usersPositions?: TorqueLeaderboardPosition
}

export type TorqueLeaderboardPosition = {
  rank: number
  wallet: string
  amount: number
  reward?: string
}

export type TorqueLeaderboardOffer = {
  name: string
  description: string
  totalRewards: number
  rewardDenomination: string
  positionRewards: Record<number, string>
}

export type TorqueRaffle = TorqueRaffleConfig & {
  startTime: Dayjs
  endTime: Dayjs
  days: { day: Dayjs; threshold: number }[]
  userDetails?: TorqueUserRaffleDetails
  lastUpdated: Dayjs
  todaysThreshold: number
}

export type TorqueRawRaffle = {
  wallet?: string
  volumes: { day: string; volume: number; updatedAt: string }[]
  config: TorqueRaffleConfig
}

type TorqueUserRaffleDetails = {
  days: TorqueUserRaffleDay[]
  currentDayTotal: number
  totalTickets: number
  todaysDate: Dayjs
}

export type TorqueUserRaffleDay = {
  day: Dayjs
  ticketAchieved: boolean
  dayInitial: string
  tense: 'PAST' | 'PRESENT' | 'FUTURE'
  threshold: number
}

export type TorqueRaffleConfig = {
  name: string
  description: string
  totalRewards: number
  rewardDenomination: string
  totalWinners: number
  rewards: { winnersCount: number; reward: number }[]
  dailyVolumeRequired: Record<string, number>
  volumeDenomination: string
  ticketsPerDay: number
  maxWeeklyTickets: number
  winMoreThanOnce: boolean
}
