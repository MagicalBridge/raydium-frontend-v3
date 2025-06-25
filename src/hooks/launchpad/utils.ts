import { LaunchpadConfigInfo } from '@raydium-io/raydium-sdk-v2'
import { Comment } from './type'
import { MintInfo } from '@/features/Launchpad/type'
import ToPublicKey from '@/utils/publicKey'
import { BN } from 'bn.js'
import { PublicKey } from '@solana/web3.js'

export const mergeComments = (comments: Comment[][], sort?: boolean) => {
  const combinedData: Comment[] = []
  const existedComment = new Set()
  comments.forEach((childComment) => {
    childComment.forEach((c) => {
      if (!existedComment.has(c.id)) {
        combinedData.push(c)
        existedComment.add(c.id)
      }
    })
  })
  if (!sort) return combinedData
  return combinedData.sort((a, b) => b.createAt - a.createAt)
}

export function ToLaunchPadConfig(configInfo: MintInfo['configInfo']): LaunchpadConfigInfo {
  return {
    index: configInfo.index,
    epoch: new BN(configInfo.epoch),
    mintB: ToPublicKey(configInfo.mintB),
    tradeFeeRate: new BN(configInfo.tradeFeeRate),
    curveType: configInfo.curveType,
    migrateFee: new BN(configInfo.migrateFee),
    maxShareFeeRate: new BN(configInfo.maxShareFeeRate),
    minSupplyA: new BN(configInfo.minSupplyA),
    maxLockRate: new BN(configInfo.maxLockRate),
    minSellRateA: new BN(configInfo.minSellRateA),
    minMigrateRateA: new BN(configInfo.minMigrateRateA),
    minFundRaisingB: new BN(configInfo.minFundRaisingB),
    protocolFeeOwner: configInfo.protocolFeeOwner ? ToPublicKey(configInfo.protocolFeeOwner) : PublicKey.default,
    migrateFeeOwner: configInfo.migrateFeeOwner ? ToPublicKey(configInfo.migrateFeeOwner) : PublicKey.default,
    migrateToAmmWallet: configInfo.migrateToAmmWallet ? ToPublicKey(configInfo.migrateToAmmWallet) : PublicKey.default,
    migrateToCpmmWallet: configInfo.migrateToCpmmWallet ? ToPublicKey(configInfo.migrateToCpmmWallet) : PublicKey.default
  }
}
