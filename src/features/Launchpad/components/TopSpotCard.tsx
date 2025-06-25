import { useEffect } from 'react'
import {
  Box,
  Flex,
  Text,
  Image,
  LinkBox,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useColorMode,
  useClipboard
} from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'
import OnFireBigBlackIcon from '@/icons/misc/OnFireBigBlackIcon'
import OnFireBigWhiteIcon from '@/icons/misc/OnFireBigWhiteIcon'
import OnFireIcon from '@/icons/misc/OnFireIcon'
import { useRouter } from 'next/router'
import { useReferrerQuery } from '../utils'
import { motion, useSpring, useTime, useTransform } from 'framer-motion'
import CircleCheck from '@/icons/misc/CircleCheck'
import CopyLaunchpadIcon from '@/icons/misc/CopyLaunchpadIcon'
import { getImgProxyUrl } from '@/utils/url'
import { SocialLinks } from './SocialLinks'

export const TopSpotCard = ({
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
  const router = useRouter()
  const referrerQuery = useReferrerQuery('&')
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const copyContent = mint ?? ''
  const { onCopy: copy, hasCopied } = useClipboard(copyContent)

  const MotionBox = motion(Box)
  const time = useTime()

  const rotate = useTransform(time, (t) => ((t % 3000) / 3000) * 360)
  const rotatingBg = useTransform(rotate, (r) => {
    return isLight
      ? `conic-gradient(from ${r}deg, #DA2EEF, #2B6AFF, #39D0D8, #DA2EEF)`
      : `conic-gradient(from ${r}deg, rgba(218, 46, 239, 0.8), #FFB12B, #D3D839, rgba(218, 46, 239, 0.8))`
  })

  const pulse = useSpring(0, { damping: 0, mass: 5, stiffness: 10 })
  const pulsingBg = useTransform(pulse, (r) => {
    return `blur(${r * 0.5}px)`
  })

  useEffect(() => {
    pulse.set(5)
  }, [])
  return (
    <Box position="relative" mx={[0, 0, 0, 'auto']}>
      <Box position="relative" zIndex={1} borderRadius="8px" background="#000" transition="colors 0.2s">
        <Box position="absolute" top="-35px" right={['60px', '80px', '80px']} width="66px" height="69px" zIndex={1}>
          {isLight ? <OnFireBigWhiteIcon /> : <OnFireBigBlackIcon />}
        </Box>
        <LinkBox
          as="article"
          width={['100%', '28rem', '28.9375rem']}
          height="fit-content"
          borderRadius="8px"
          overflow="hidden"
          background={
            isLight
              ? 'linear-gradient(90deg, #E0F0FF 0%, #FAEBFF 57.3%, #FFE2F5 95.96%)'
              : 'linear-gradient(245.22deg, rgba(218, 46, 239, 0.24) 7.97%, rgba(255, 177, 43, 0.3) 49.17%, rgba(211, 216, 57, 0.3) 92.1%)'
          }
          cursor="pointer"
          onClick={() => {
            router.push(`/launchpad/token?mint=${mint}${referrerQuery}`)
          }}
        >
          <Flex p={3} pt={[0, 3]} gap={3}>
            <Image
              src={getImgProxyUrl(logoUrl, 100)}
              fallbackSrc={logoUrl}
              alt={`${name} logo`}
              width={['80px', '100px']}
              height={['80px', '100px']}
              flexShrink={0}
              overflow="hidden"
              borderRadius="8px"
              objectFit="cover"
            />
            <Flex direction="column" width="100%" justifyContent="space-between" gap={2}>
              <Flex justifyContent="space-between" alignItems="center">
                <Flex alignItems="center" gap={1} lineHeight="20px" maxWidth="15rem" overflow="hidden">
                  <Text
                    flexShrink={0}
                    isTruncated
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    fontWeight="medium"
                    bgGradient={
                      isLight
                        ? 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)'
                        : 'linear-gradient(245.22deg, #FF2FC8 7.97%, #FFB12B 49.17%, #D3D839 92.1%)'
                    }
                    bgClip="text"
                  >
                    {symbol}
                  </Text>
                  <Text
                    flexGrow={1}
                    flexShrink={1}
                    color={colors.lightPurple}
                    isTruncated
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {name}
                  </Text>
                </Flex>
                <SocialLinks twitter={twitter} website={website} telegram={telegram} mint={mint} />
              </Flex>
              <Text
                fontSize="xs"
                noOfLines={2}
                overflow="hidden"
                textOverflow="ellipsis"
                flex={['initial', '1']}
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
              <Flex justifyContent="space-between" alignItems="center">
                <Flex direction="column">
                  <Flex alignItems="center" gap={1} mb={1}>
                    <Text
                      as="span"
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
                  <Slider
                    isReadOnly
                    cursor="default"
                    value={finishingRate}
                    width={['10rem', '13.75rem']}
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
                    <SliderThumb width="25px" height="30px" top="-10%" boxShadow="none">
                      <OnFireIcon />
                    </SliderThumb>
                  </Slider>
                </Flex>
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
          </Flex>
        </LinkBox>
      </Box>
      <MotionBox
        position="absolute"
        inset="-1px"
        borderRadius="8px"
        style={{
          background: rotatingBg,
          filter: pulsingBg
        }}
      />
    </Box>
  )
}
