import { TagsOf, UnionOf, ofType, unionize } from 'unionize'
import { LaunchpadConfigInfo, LaunchpadPoolInfo } from '@/hooks/launchpad/usePoolRpcInfo'
import { MintInfo } from '@/features/Launchpad/type'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { ConfigApiData } from '@/hooks/launchpad/useConfigs'
import { CreateMintAdvanceConfig } from '@/store'
import { Point } from '@/features/Launchpad/components/Charts/CurveAreaChart'

type SharedDialogProps = { setIsOpen: (open: boolean) => void }
export type DialogProps<T> = T & SharedDialogProps

// eslint-disable-next-line @typescript-eslint/ban-types
export type InitialBuyDialogProps = {
  name: string
  description?: string
  file: File
  ticker: string
  telegram?: string
  website?: string
  twitter?: string
  configInfo: ConfigApiData
  tag?: number
} & CreateMintAdvanceConfig
export type AddCommentDialogProps = {
  poolId: string
  onUploadSuccess?: () => void
}
export type ThirdPartyWarningDialogProps = {
  url: string
}
export type TradeBoxDialogProps = {
  poolInfo?: LaunchpadPoolInfo
  mintInfo?: MintInfo
  mintBInfo?: ApiV3Token
  configInfo: LaunchpadConfigInfo
  onChain?: boolean
  isMigrating?: boolean
  isLanded?: boolean
}

export type VestingEditDialogProps = {
  remainingAmount: number
  save: () => void
}

export type CurvePreviewDialogProps = { data: Point[] }

export const DialogTypes = unionize(
  {
    InitialBuy: ofType<InitialBuyDialogProps>(),
    AddComment: ofType<AddCommentDialogProps>(),
    ThirdPartyWarning: ofType<ThirdPartyWarningDialogProps>(),
    TradeBox: ofType<TradeBoxDialogProps>(),
    VestingEdit: ofType<VestingEditDialogProps>(),
    CurvePreview: ofType<CurvePreviewDialogProps>()
  },
  { tag: 'type' as const, value: 'props' as const }
)
export type DialogType = UnionOf<typeof DialogTypes>
export type DialogTypesTypes = TagsOf<typeof DialogTypes>
