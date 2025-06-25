import React, { useEffect, useRef, useMemo } from 'react'
import { Box, Grid, Flex, Text, Image, Skeleton, useColorMode, useClipboard, Tooltip } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'
import { useRouter } from 'next/router'
import ThreeStageProgress from './ThreeStageProgress'
import { MintInfo } from '../type'
import { formatCurrency } from '@/utils/numberish/formatter'
import { createTimeDiff, useReferrerQuery } from '../utils'
import NotFound from '@/components/NotFound'
import CircleCheck from '@/icons/misc/CircleCheck'
import CopyLaunchpadIcon from '@/icons/misc/CopyLaunchpadIcon'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import ListItem from '@/components/ListItem'
import { listContext } from '@/components/List'
import Curve from '@/icons/misc/Curve'
import { getImgProxyUrl } from '@/utils/url'
import useResponsive from '@/hooks/useResponsive'
import { motion } from 'framer-motion'
import { SocialLinks } from './SocialLinks'

const HEATING_RATE = 33.3

const CardSkeleton = ({ index }: { index: number }) => {
  const opacity = Math.max(0, 1 - index / 6)
  return (
    <Box
      width="100%"
      minWidth={['100%', '360px']}
      maxWidth="500px"
      background="#ABC4FF12"
      border="1px solid #ABC4FF1A"
      px={3}
      py={2}
      borderRadius="8px"
      cursor="wait"
      sx={{
        contentVisibility: 'auto',
        containIntrinsicWidth: 'auto',
        containIntrinsicHeight: `auto 128px`,
        minHeight: `128px`,
        opacity
      }}
    >
      <Flex alignItems="center" mb={3}>
        <Skeleton width="12rem" height="1.25rem" />
        <Skeleton ml="auto" width="3.75rem" height="1.25rem" />
      </Flex>
      <Flex>
        <Skeleton width="5rem" height="5rem" mr={4} borderRadius="8px" />
        <Box flex="1">
          <Skeleton height="1rem" w="90%" borderRadius="8px" mb={2} />
          <Skeleton height="1rem" w="70%" borderRadius="8px" mb={4} />
          <Skeleton height="1.25rem" width="3.75rem" borderRadius="8px" mb={2} />
        </Box>
      </Flex>
    </Box>
  )
}

const TokenListCard = ({
  tokens,
  isLoading = false,
  onLoadMore,
  hasMore = false
}: {
  tokens: MintInfo[]
  isLoading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
}) => {
  const parentRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const { isMobile } = useResponsive()
  const isEmpty = !isLoading && tokens.length === 0

  const { observe, stop } = useIntersectionObserver({ rootRef: parentRef, options: { rootMargin: '80%' } })
  const contextValue = useMemo(() => ({ observeFn: observe }), [observe])

  useEffect(() => stop, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore?.()
        }
      },
      { rootMargin: '200px' }
    )

    const currentSentinel = sentinelRef.current
    if (currentSentinel) {
      observer.observe(currentSentinel)
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel)
      }
    }
  }, [onLoadMore, hasMore, isLoading])

  if (isEmpty) {
    return (
      <Grid
        gridAutoFlow="row"
        gridTemplateColumns="minmax(0, 1fr)"
        height="100%"
        justifyItems="center"
        alignContent="center"
        padding="4rem"
      >
        <NotFound />
      </Grid>
    )
  }

  return (
    <listContext.Provider value={contextValue}>
      <Grid
        gridTemplateColumns={['repeat(1, minmax(0,1fr))', 'repeat(auto-fill, minmax(360px, 1fr))']}
        justifyItems="center"
        gap={[3, 5, 5]}
        my={3}
        sx={
          isMobile
            ? {}
            : {
                containerType: 'inline-size',
                '& > *': {
                  maxWidth: '100cqw'
                }
              }
        }
      >
        {isLoading
          ? Array(6)
              .fill(0)
              .map((_, index) => <CardSkeleton key={`skeleton-${index}`} index={index} />)
          : tokens.map((token) => (
              <ListItem key={token.mint}>
                <motion.div
                  layoutId={token.mint}
                  layout="position"
                  transition={{
                    type: 'spring',
                    bounce: 0.1,
                    duration: 0.3
                  }}
                  style={{ width: '100%' }}
                >
                  {<TokenCard token={token} />}
                </motion.div>
              </ListItem>
            ))}
        {!isLoading && hasMore && <Box ref={sentinelRef} width="100%" height="1px" />}
      </Grid>
    </listContext.Provider>
  )
}

const TokenCard = ({ token }: { token: MintInfo }) => {
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const router = useRouter()
  const queryReferrer = useReferrerQuery('&')
  const { onCopy: copy, hasCopied } = useClipboard(token.mint)

  return (
    <Box
      background={
        token.finishingRate >= HEATING_RATE
          ? isLight
            ? 'linear-gradient(90deg, #EEF7FF 0%, #FBEDFF 100%)'
            : 'linear-gradient(245.22deg, rgba(255, 156, 50, 0.07) 7.97%, rgba(255, 208, 0, 0.07) 49.17%, rgba(237, 255, 220, 0.07) 92.1%)'
          : '#ABC4FF12'
      }
      border={isLight ? '1px solid #ABC4FF80' : '1px solid #ABC4FF1A'}
      borderRadius="8px"
      overflow="hidden"
      position="relative"
      px={3}
      py={2}
      width="100%"
      minWidth={['100%', '360px']}
      maxWidth="500px"
      m={[0, 'auto', 0]}
      cursor="pointer"
      onClick={() => {
        router.push(`/launchpad/token?mint=${token.mint}${queryReferrer}`)
      }}
      _before={
        token.finishingRate >= HEATING_RATE
          ? isLight
            ? {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                borderRadius: '8px',
                padding: '1px',
                background: 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                pointerEvents: 'none'
              }
            : {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                borderRadius: '8px',
                padding: '1px',
                background:
                  'linear-gradient(245.22deg, rgba(255, 156, 50, 0.4) 7.97%, rgba(255, 208, 0, 0.4) 49.17%, rgba(237, 255, 220, 0.4) 92.1%)',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                pointerEvents: 'none'
              }
          : {}
      }
    >
      <Grid templateRows="auto 1fr" gap={2}>
        <Grid templateColumns="1fr auto" alignItems="center">
          <Flex gap={3} alignItems="center" overflow="hidden" lineHeight="20px">
            <Flex fontWeight="medium" gap={2}>
              <Text
                maxWidth={['6rem', '10rem', '10rem']}
                isTruncated
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                sx={
                  token.finishingRate >= HEATING_RATE
                    ? {
                        background: isLight
                          ? 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)'
                          : 'linear-gradient(245.22deg, #FF9C32 7.97%, #FFD000 39.94%, #EDFFDC 92.1%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }
                    : {}
                }
              >
                {token.symbol}
              </Text>
              <Text
                color={colors.lightPurple}
                maxWidth={['12rem', '12rem', '10rem']}
                isTruncated
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {token.name}
              </Text>
            </Flex>
            <Text color={colors.lightPurple} fontSize="sm">
              {createTimeDiff(token.createAt)}
            </Text>
          </Flex>
          <Flex color={colors.textLaunchpadLink} alignItems="center" gap="1">
            {token.defaultCurve ? null : (
              <Tooltip
                hasArrow
                placement="top"
                label={'This token has custom LaunchLab parameters set by the creator. Make sure to check the token page for full details.'}
              >
                <Box>
                  <Curve />
                </Box>
              </Tooltip>
            )}
            <SocialLinks
              platformInfo={token.platformInfo}
              twitter={token.twitter}
              website={token.website}
              telegram={token.telegram}
              mint={token.mint}
              sx={{
                gap: '0.5'
              }}
            />
          </Flex>
        </Grid>
        <Grid templateColumns="5rem 1fr" gap="10px">
          <Image
            src={getImgProxyUrl(token.imgUrl, 80)}
            fallbackSrc={token.imgUrl}
            objectFit="cover"
            width="5rem"
            height="5rem"
            draggable={false}
          />
          <Flex direction="column" justifyContent="space-between" gap={3}>
            <Text
              color={colors.lightPurple}
              opacity={isLight ? 0.7 : 0.5}
              fontSize="xs"
              lineHeight="15px"
              noOfLines={2}
              wordBreak="break-word"
            >
              {token.description}
            </Text>
            <Flex justifyContent="space-between">
              <Grid templateRows="1fr auto" alignItems="center" rowGap={1}>
                <Flex gap={2} alignItems="center" lineHeight="18px">
                  <Text
                    fontSize="sm"
                    sx={
                      token.finishingRate >= HEATING_RATE
                        ? {
                            background: isLight ? '#8C6EEF' : 'linear-gradient(245.22deg, #FF9C32 7.97%, #FFD000 39.94%, #EDFFDC 92.1%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }
                        : { color: colors.textLaunchpadLink }
                    }
                  >
                    MC:
                    {formatCurrency(token.marketCap, {
                      symbol: '$',
                      abbreviated: true,
                      decimalPlaces: 2,
                      maximumDecimalTrailingZeroes: 4
                    })}
                  </Text>
                  {token.finishingRate >= HEATING_RATE ? '🔥' : ''}
                  {token.migrateAmmId ? '🎓' : ''}
                </Flex>

                <Flex justifyContent="space-between" alignItems="center">
                  <ThreeStageProgress
                    percent={token.finishingRate}
                    sx={{
                      width: '10rem'
                    }}
                  />
                </Flex>
              </Grid>
              <Box
                alignSelf="flex-end"
                cursor={hasCopied ? 'default' : 'pointer'}
                onClick={(e) => {
                  e.stopPropagation()
                  copy()
                }}
              >
                {hasCopied ? <CircleCheck color={colors.textLaunchpadLink} /> : <CopyLaunchpadIcon color={colors.textLaunchpadLink} />}
              </Box>
            </Flex>
          </Flex>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TokenListCard
