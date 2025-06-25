import { memo } from 'react'
import { Box, Flex, Text, Image, Link, Slider, SliderTrack, SliderFilledTrack, VStack, useColorMode } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'
import OnFireBigBlackIcon from '@/icons/misc/OnFireBigBlackIcon'
import OnFireBigWhiteIcon from '@/icons/misc/OnFireBigWhiteIcon'
import { createTimeDiff, useReferrerQuery } from '../utils'
import { getImgProxyUrl } from '@/utils/url'
import { CopyButton } from '@/components/CopyButton'
import { formatCurrency } from '@/utils/numberish/formatter'
import { TokenCarousel } from '@/components/TokenCarousel'
import { SocialLinks } from './SocialLinks'
import { MintInfo } from '../type'

export const TopMobileCarousel = ({
  indexTopMint,
  lastTrade
}: {
  indexTopMint?: MintInfo
  lastTrade: {
    mintInfo: MintInfo
    tradeInfo: {
      amountA: number
      amountB: number
      side: 'buy' | 'sell'
    }
  }
}) => {
  return (
    <Box
      overflowX="auto"
      sx={{
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      <TokenCarousel>
        {indexTopMint ? (
          <TopCarouselCard
            mint={indexTopMint.mint}
            symbol={indexTopMint.symbol}
            name={indexTopMint.name}
            timeAgo={`${createTimeDiff(indexTopMint.createAt)}`}
            marketCap={formatCurrency(indexTopMint.marketCap, {
              symbol: '$',
              maximumDecimalTrailingZeroes: 4,
              abbreviated: true,
              decimalPlaces: 2
            })}
            description={indexTopMint.description}
            finishingRate={indexTopMint.finishingRate}
            logoUrl={indexTopMint.imgUrl}
            twitter={indexTopMint.twitter}
            website={indexTopMint.website}
            telegram={indexTopMint.telegram}
          />
        ) : null}
        <LastTradeCarouselCard lastTrade={lastTrade} />
      </TokenCarousel>
    </Box>
  )
}

const TopCarouselCard = memo(
  ({
    mint,
    symbol,
    name,
    timeAgo,
    marketCap,
    description,
    finishingRate,
    logoUrl,
    twitter,
    website,
    telegram
  }: {
    mint: string
    symbol: string
    name: string
    timeAgo: string
    marketCap: string
    description: string
    finishingRate: number
    logoUrl: string
    twitter?: string
    website?: string
    telegram?: string
  }) => {
    const referrerQuery = useReferrerQuery('&')

    const { colorMode } = useColorMode()
    const isLight = colorMode === 'light'

    return (
      <Box overflow="visible" width="330px" maxWidth="400px">
        <Link
          href={`/launchpad/token?mint=${mint}${referrerQuery}`}
          draggable="false"
          display="block"
          width="100%"
          _hover={{ textDecoration: 'none' }}
        >
          <Flex
            position="relative"
            width="100%"
            p={2}
            background={
              isLight
                ? 'linear-gradient(90deg, #E0F0FF 0%, #FAEBFF 57.3%, #FFE2F5 95.96%)'
                : 'linear-gradient(245.22deg, rgba(218, 46, 239, 0.24) 7.97%, rgba(255, 177, 43, 0.3) 49.17%, rgba(211, 216, 57, 0.3) 92.1%)'
            }
            borderRadius="8px"
            align="flex-start"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '4px',
              padding: '1px',
              background: 'linear-gradient(245.22deg, rgba(218, 46, 239, 0.8) 7.97%, #FFB12B 49.17%, #D3D839 92.1%)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
              pointerEvents: 'none'
            }}
          >
            <Box position="relative" mr={3} flexShrink={0} width="60px" height="60px">
              {logoUrl ? (
                <Image
                  src={getImgProxyUrl(logoUrl, 100)}
                  fallbackSrc={logoUrl}
                  alt={`${name} logo`}
                  flexShrink={0}
                  overflow="hidden"
                  borderRadius="8px"
                  objectFit="cover"
                  boxSize="100%"
                  draggable={false}
                />
              ) : (
                <Flex background={colors.backgroundLight} boxSize="100%" align="center" justify="center" borderRadius="8px">
                  <Text fontSize="xs">No Image</Text>
                </Flex>
              )}
              <Box position="absolute" top="-14px" right="-16px" width="33px" height="35px" zIndex={1}>
                {isLight ? <OnFireBigWhiteIcon width="33" height="35" /> : <OnFireBigBlackIcon width="33" height="35" />}
              </Box>
            </Box>
            <VStack align="flex-start" spacing={1} flex={1} minWidth={0} maxHeight="100%" height="60px" justifyContent="space-between">
              <Flex justifyContent="space-between" alignItems="center" width="100%">
                <Flex alignItems="center" gap={1} overflow="hidden" flexGrow={1} mr={1}>
                  <Text
                    flexShrink={0}
                    isTruncated
                    fontWeight="medium"
                    lineHeight="18px"
                    bgGradient={
                      isLight
                        ? 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)'
                        : 'linear-gradient(245.22deg, #FF2FC8 7.97%, #FFB12B 49.17%, #D3D839 92.1%)'
                    }
                    bgClip="text"
                  >
                    {symbol}
                  </Text>
                  <Text flexGrow={1} flexShrink={1} color={colors.lightPurple} isTruncated lineHeight="18px">
                    {name}
                  </Text>
                </Flex>
                <SocialLinks twitter={twitter} website={website} telegram={telegram} mint={mint} />
              </Flex>
              <Text
                noOfLines={1}
                fontSize="xs"
                sx={
                  isLight
                    ? {
                        color: '#474ABB'
                      }
                    : {
                        bgGradient: 'linear-gradient(245.22deg, #FF2FC8 7.97%, #FFB12B 49.17%, #D3D839 92.1%)',
                        bgClip: 'text'
                      }
                }
              >
                {description}
              </Text>
              <Flex justifyContent="space-between" alignItems="center" width="100%">
                <Flex alignItems="center" gap={1} flex={1} minWidth={0} mr={1}>
                  <Slider
                    isReadOnly
                    cursor="default"
                    value={finishingRate}
                    width="5rem"
                    height="6px"
                    py="0 !important"
                    sx={{
                      '--slider-track-size': '0.375rem',
                      '.chakra-slider__thumb': {
                        background: 'transparent'
                      }
                    }}
                  >
                    <SliderTrack borderRadius="full" background={isLight ? '#8C6EEF' : '#ABC4FF1F'}>
                      <SliderFilledTrack
                        background={
                          isLight
                            ? 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)'
                            : 'linear-gradient(245.22deg, #FF2FC8 7.97%, #FFB12B 49.17%, #D3D839 92.1%)'
                        }
                      />
                    </SliderTrack>
                    {/* <SliderThumb width="25px" height="30px" top="-10%" boxShadow="none">
                  <OnFireIcon />
                </SliderThumb> */}
                  </Slider>
                  <Text
                    isTruncated
                    flex={1}
                    minWidth={0}
                    color={colors.textLaunchpadLink}
                    fontSize="sm"
                    lineHeight="18px"
                    sx={
                      isLight
                        ? {}
                        : {
                            bgGradient: 'linear-gradient(245.22deg, #FF2FC8 7.97%, #FFB12B 49.17%, #D3D839 92.1%)',
                            bgClip: 'text'
                          }
                    }
                  >
                    MC: {marketCap}
                  </Text>
                  <Text color={colors.lightPurple} fontSize="sm" lineHeight="18px">
                    {timeAgo}
                  </Text>
                </Flex>
                <CopyButton buttonType="icon" value={mint ?? ''} />
              </Flex>
            </VStack>
          </Flex>
        </Link>
      </Box>
    )
  }
)

const LastTradeCarouselCard = memo(
  ({
    lastTrade
  }: {
    lastTrade: {
      mintInfo: MintInfo
      tradeInfo: {
        amountA: number
        amountB: number
        side: 'buy' | 'sell'
      }
    }
  }) => {
    const { colorMode } = useColorMode()
    const isLight = colorMode === 'light'
    const referrerQuery = useReferrerQuery('&')
    const lastTradeData = lastTrade?.tradeInfo
    const isBuy = lastTradeData?.side === 'buy'
    if (!lastTradeData) {
      return null
    }
    return (
      <Box overflow="visible" width="330px" maxWidth="400px">
        <Link
          href={`/launchpad/token?mint=${lastTrade.mintInfo.mint}${referrerQuery}`}
          draggable="false"
          display="block"
          width="100%"
          _hover={{ textDecoration: 'none' }}
        >
          <Flex
            position="relative"
            width="100%"
            p={2}
            background={isLight ? colors.backgroundLight30 : 'linear-gradient(89.25deg, #174756 0.37%, #1A2A5F 52.97%, #3E1958 99.74%)'}
            borderRadius="8px"
            align="flex-start"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '4px',
              padding: '1px',
              background: 'linear-gradient(244.41deg, #7748FC 8.17%, #39D0D8 101.65%)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
              pointerEvents: 'none'
            }}
          >
            <Box position="relative" mr={3} flexShrink={0} width="60px" height="60px">
              {lastTrade.mintInfo.imgUrl ? (
                <Image
                  src={getImgProxyUrl(lastTrade.mintInfo.imgUrl, 100)}
                  fallbackSrc={lastTrade.mintInfo.imgUrl}
                  alt={`${lastTrade.mintInfo.name} logo`}
                  flexShrink={0}
                  overflow="hidden"
                  borderRadius="8px"
                  objectFit="cover"
                  boxSize="100%"
                  draggable={false}
                />
              ) : (
                <Flex background={colors.backgroundLight} boxSize="100%" align="center" justify="center" borderRadius="8px">
                  <Text fontSize="xs">No Image</Text>
                </Flex>
              )}
            </Box>
            <VStack align="flex-start" spacing={1} flex={1} minWidth={0} maxHeight="100%" height="60px">
              <Text fontSize="xs" color={colors.lightPurple} lineHeight="18px">
                someone just {isBuy ? 'bought' : 'sold'}
              </Text>
              <Text fontSize="sm" fontWeight="medium" color={colors.textPrimary}>
                {formatCurrency(lastTradeData.amountB, {
                  maximumDecimalTrailingZeroes: 3
                })}{' '}
                SOL
                <Text as="span" color={colors.lightPurple} fontSize="xs" mx={1}>
                  of
                </Text>
                #{lastTrade.mintInfo.symbol}
              </Text>
            </VStack>
          </Flex>
        </Link>
      </Box>
    )
  }
)
