export interface Comment {
  createAt: number
  id: number
  imgUrl: string
  poolId: string
  text: string
  wallet: string
  isDeveloper?: boolean
}

export interface VestingConfig {
  pubKey: string
  epoch: string
  poolId: string
  beneficiary: string
  claimedAmount: string
  tokenShareAmount: string
  slot: number
}
export interface CACHE_VESTING_CONFIG_BY_FILTER {
  [key: string]: VestingConfig
}
export interface CACHE_VESTING_CONFIG_BY_FILTER_NULL {
  [key: string]: VestingConfig | null
}
