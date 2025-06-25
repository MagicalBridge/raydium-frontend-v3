import { useState, memo } from 'react'
import { Box, Flex, Link, Img, SystemStyleObject } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'
import StarIcon from '@/icons/misc/StarIcon'
import TelegrameIcon from '@/icons/misc/TelegrameIcon'
import TwitterIcon from '@/icons/misc/TwitterIcon'
import WebIcon from '@/icons/misc/WebIcon'
import NextLink from 'next/link'
import { useDialogsStore } from '@/store'
import { DialogTypes } from '@/constants/dialogs'
import { getMintWatchList, setMintWatchList } from '../utils'
import { useEvent } from '@/hooks/useEvent'
import { LaunchpadPoolInitParam } from '@raydium-io/raydium-sdk-v2'

export const SocialLinks = memo(
  ({
    platformInfo,
    twitter,
    website,
    telegram,
    mint,
    sx
  }: {
    platformInfo?: {
      feeRate: string
      img: string
      name: string
      platformClaimFeeWallet: string
      pubKey: string
      web: string
    }
    twitter?: string
    website?: string
    telegram?: string
    mint: string
    sx?: SystemStyleObject
  }) => {
    const openDialog = useDialogsStore((s) => s.openDialog)
    const [watchList, setWatchList] = useState(getMintWatchList())

    const onUpdateWatchList = useEvent((mint: string, isAdd: boolean) => {
      const newWatchSet = new Set(Array.from(watchList))
      if (isAdd) {
        newWatchSet.add(mint)
      } else newWatchSet.delete(mint)

      setWatchList(newWatchSet)
      setMintWatchList(Array.from(newWatchSet.values()))
    })

    return (
      <Flex color={colors.textLaunchpadLink} alignItems="center" sx={sx}>
        {platformInfo && platformInfo.pubKey !== LaunchpadPoolInitParam.platformId.toBase58() ? (
          <Img width="14px" src={platformInfo.img} />
        ) : null}
        {twitter ? (
          <Link
            as={NextLink}
            href={twitter}
            isExternal
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <TwitterIcon color={colors.textLaunchpadLink} />
          </Link>
        ) : null}
        {website ? (
          <Box
            cursor="pointer"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openDialog(DialogTypes.ThirdPartyWarning({ url: website }))
            }}
          >
            <WebIcon color={colors.textLaunchpadLink} />
          </Box>
        ) : null}
        {telegram ? (
          <Link
            as={NextLink}
            href={telegram}
            isExternal
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <TelegrameIcon color={colors.textLaunchpadLink} />
          </Link>
        ) : null}
        <Box
          cursor="pointer"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onUpdateWatchList(mint, !watchList.has(mint))
          }}
        >
          <StarIcon selected={watchList.has(mint)} />
        </Box>
      </Flex>
    )
  }
)
