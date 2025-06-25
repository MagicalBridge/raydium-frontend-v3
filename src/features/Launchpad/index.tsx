import {
  Box,
  Button,
  Collapse,
  Flex,
  Text,
  Grid,
  FormControl,
  FormLabel,
  Switch,
  Skeleton,
  useBreakpointValue,
  useColorMode,
  useOutsideClick
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { colors } from '@/theme/cssVariables/colors'
import { CoinList, CoinListActionRef } from './CoinList'
import { MetasList } from './components/MetasList'
import { SearchInput, OnSearchChangeData } from './components/SearchInput'
import { TopSpotCard } from './components/TopSpotCard'
import { DropdownSelectMenu } from '@/components/DropdownSelectMenu'
import RefreshIcon from '@/icons/misc/RefreshIcon'
import UserIcon from '@/icons/misc/UserIcon'
import SearchIcon from '@/icons/misc/SearchIcon'
import { MintSortField } from '@/hooks/launchpad/useMintList'
import { useRef, useState, ChangeEvent, useCallback } from 'react'
import { useRouteQuery } from '@/utils/routeTools'
import { useDisclosure } from '@/hooks/useDelayDisclosure'
import useTopMintList from '@/hooks/launchpad/useTopMintList'
import { TopListCard } from './components/TopListCard'
import { AnimatedCardStack } from './components/AnimatedCardStack'
import { createTimeDiff, useReferrerQuery } from './utils'
import { formatCurrency } from '@/utils/numberish/formatter'
import MoreListControllers from '@/icons/misc/MoreListControllers'
import { useStateWithUrl } from '@/hooks/useStateWithUrl'
import useResponsive from '@/hooks/useResponsive'
import { useEvent } from '@/hooks/useEvent'
import { MintInfo } from './type'
import { useAppStore } from '@/store'
import { X } from 'react-feather'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { LocalStorageKey } from '@/constants/localStorage'
import PlatformButton from './components/PlatformButton'
import { TopMobileCarousel } from './components/TopMobileCarousel'

const DropdownItems = [
  // { label: 'Featured', value: MintSortField.Featured },
  { label: 'Last Trade', value: MintSortField.LastTrade },
  { label: 'New', value: MintSortField.New },
  { label: 'Market cap', value: MintSortField.MarketCap }
  // { label: 'Finish Rate', value: MintSortField.FinishRate }
]

export default function Launchpad() {
  const { t } = useTranslation()
  const { sort: querySort } = useRouteQuery<{ sort?: MintSortField; feat?: string }>()
  const publicKey = useAppStore((s) => s.publicKey)
  const { isOpen: isLoading, onOpen: onLoading, onClose: offLoading } = useDisclosure()
  const [sort, setSort] = useState(querySort || MintSortField.LastTrade)
  const [isSearch, setIsSearch] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchResultRef = useRef<MintInfo[]>([])
  const timeRef = useRef(Date.now())
  const referrerQuery = useReferrerQuery('?')

  const actionRef = useRef<CoinListActionRef>({ refresh: () => {}, onSearchChange: () => {} })

  const [showAnimations, setShowAnimations] = useStateWithUrl(true, 'show_animations', {
    fromUrl: (u) => u === 'true',
    toUrl: (v) => String(v)
  })

  const [isIncludeNsfw, setIsIncludeNsfw] = useStateWithUrl(false, 'include_nsfw', {
    fromUrl: (u) => u === 'true',
    toUrl: (v) => String(v)
  })

  const [meta, setMeta] = useStateWithUrl('', 'feat', {
    fromUrl: (u) => u,
    toUrl: (v) => v?.replace('_up', '')
  })

  const [platform, setPlatform] = useStateWithUrl('', 'platform', {
    fromUrl: (u) => u,
    toUrl: (v) => (v === 'PlatformWhiteList' ? '' : v)
  })

  const handlePlatformChange = useCallback((val?: string) => {
    setPlatform(val || '')
  }, [])

  const {
    topLastTrade,
    isLoading: isTopMintListLoading,
    topMarketCapMints,
    indexTopMint,
    mutate
  } = useTopMintList({ notRefresh: !showAnimations, includeNsfw: isIncludeNsfw, timeTag: timeRef.current })

  const { isOpen: isCollapseOpen, onToggle: toggleCollapse } = useDisclosure()
  const { isOpen: isMobileSearchOpen, onOpen: openMobileSearch, onClose: closeMobileSearch } = useDisclosure()
  const listControllerIconSize = useBreakpointValue({ base: '24px', sm: '28px' })
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const { isMobile, isDesktopSmall, isDesktopMedium, isDesktopLarge } = useResponsive()
  const [isFeeDistributionBannerShown, setIsFeeDistributionBannerShown] = useLocalStorage({
    key: LocalStorageKey.IsFeeDistributionBannerShown,
    defaultValue: false
  })

  const [isReferBannerShown, setIsReferBannerShown] = useLocalStorage({
    key: LocalStorageKey.IsReferBannerShown,
    defaultValue: false
  })

  const handleClickRefresh = () => {
    onLoading()
    actionRef.current.refresh()
    mutate()
    setTimeout(() => {
      offLoading()
    }, 700)
  }

  const handleSwitchAnimationsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setShowAnimations(e.currentTarget.checked)
  }

  const handleSwitchNsfwChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsIncludeNsfw(e.currentTarget.checked)
  }

  const handleSearchResultChange = useEvent((props: OnSearchChangeData) => {
    // const isSearch = !!props.searchTerm
    setIsSearch(!!props.searchTerm)
    if (!!props.searchTerm && !isMobileSearchOpen) {
      openMobileSearch()
    }

    if (isSearch && props.data !== searchResultRef.current) setSort(MintSortField.MarketCap)
    searchResultRef.current = props.data
    actionRef.current.onSearchChange({
      isSearch,
      ...props
    })
  })

  useOutsideClick({
    ref: searchInputRef,
    handler() {
      if (!isSearch) {
        closeMobileSearch()
      }
    }
  })

  return (
    <Grid
      // minWidth={['initial', '1240px', 'initial']}
      height="fit-content"
      pt={1}
    >
      {(!isReferBannerShown || !isFeeDistributionBannerShown) && (
        <Box marginX={['-20px', 0, `min((100vw - 1600px) / -2, -7%)`]} mb={[0, 6]}>
          <Flex
            direction={['column', 'column', 'row']}
            maxWidth="100%"
            justifyContent="space-between"
            alignItems="center"
            paddingX={['20px', 0, '12px']}
            gap={[1, 1, 0]}
          >
            {!isReferBannerShown ? (
              <Flex borderRadius="8px" background="#8C6EEF33" width="100%" px={3} py={2} justifyContent="space-between">
                <Flex alignItems="center" lineHeight="18px">
                  <Text>🎉</Text>
                  <Flex gap={1}>
                    <Text
                      fontSize="sm"
                      bgGradient={
                        isLight
                          ? 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)'
                          : 'linear-gradient(245.22deg, #FF2FC8 7.97%, #FFB12B 49.17%, #D3D839 92.1%)'
                      }
                      bgClip="text"
                    >
                      Share, Refer, Earn SOL! Share your link and get referral fees airdropped to you!
                    </Text>
                    <Link
                      href="https://docs.raydium.io/raydium/pool-creation/launchlab/earn-referral-fees"
                      shallow
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '14px',
                        color: colors.textLink
                      }}
                    >
                      More info
                    </Link>
                  </Flex>
                </Flex>
                <X width="22px" height="22px" color="#4F53F3" cursor="pointer" onClick={() => setIsReferBannerShown(true)} />
              </Flex>
            ) : null}
            {!isFeeDistributionBannerShown ? (
              <Flex borderRadius="8px" background="#8C6EEF33" width="100%" px={3} py={2} ml={[0, 0, 5]} justifyContent="space-between">
                <Flex alignItems="center" lineHeight="18px">
                  <Text>🤑</Text>
                  <Text
                    fontSize="sm"
                    bgGradient={
                      isLight
                        ? 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)'
                        : 'linear-gradient(245.22deg, #FF2FC8 7.97%, #FFB12B 49.17%, #D3D839 92.1%)'
                    }
                    bgClip="text"
                  >
                    Rewards are LIVE for traders AND creators! Check ‘Rewards’ tab and X account for updates!
                  </Text>
                </Flex>
                <X width="22px" height="22px" color="#4F53F3" cursor="pointer" onClick={() => setIsFeeDistributionBannerShown(true)} />
              </Flex>
            ) : null}
          </Flex>
        </Box>
      )}
      <Grid gap={[2, 5]}>
        <Flex justifyContent="space-evenly" alignItems="center">
          {(isDesktopMedium || isDesktopLarge) && (
            <AnimatedCardStack
              items={topLastTrade.map((d) => d.mintInfo)}
              isLoading={isTopMintListLoading}
              renderItem={(mintInfo, index) => (
                <TopListCard key={`top-trade-${mintInfo.mint}`} mintInfo={mintInfo} tradeData={topLastTrade[index].tradeInfo} />
              )}
            />
          )}
          {!isMobile && (
            <>
              {isTopMintListLoading ? (
                <Flex
                  background="#ABC4FF12"
                  width={['100%', '28rem', '28.9375rem']}
                  p={3}
                  borderRadius="8px"
                  cursor="wait"
                  sx={{
                    contentVisibility: 'auto',
                    containIntrinsicWidth: 'auto',
                    containIntrinsicHeight: `auto 124px`,
                    minHeight: `124px`
                  }}
                >
                  <Skeleton width="6.25rem" height="6.25rem" mr={3} borderRadius="8px" />
                  <Box flex="1">
                    <Flex alignItems="center" mb={3}>
                      <Skeleton width={['8rem', '12rem', '12rem']} height="1.25rem" />
                      <Skeleton ml="auto" width="3.75rem" height="1.25rem" />
                    </Flex>
                    <Skeleton height="1rem" w="90%" borderRadius="8px" mb={2} />
                    <Skeleton height="1rem" width="3.75rem" borderRadius="8px" mb={2} />
                    <Skeleton height="1rem" w="70%" borderRadius="8px" mb={2} />
                  </Box>
                </Flex>
              ) : indexTopMint ? (
                <TopSpotCard
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
              <AnimatedCardStack
                items={topMarketCapMints}
                isLoading={isTopMintListLoading}
                isRightAligned
                renderItem={(mintInfo) => <TopListCard key={`top-cap-${mintInfo.mint}`} mintInfo={mintInfo} />}
              />
            </>
          )}
        </Flex>
        {isMobile ? (
          <>
            <TopMobileCarousel indexTopMint={indexTopMint} lastTrade={topLastTrade[0]} />
            <Flex direction="column" gap={3}>
              <Flex justifyContent="space-between" alignItems="center">
                <DropdownSelectMenu
                  placement="bottom-end"
                  triggerSx={{
                    width: '8.625rem',
                    height: '2.5rem',
                    minHeight: '2.5rem',
                    background: colors.backgroundDark,
                    border: `1px solid ${colors.buttonPrimary__01}`,
                    color: colors.buttonPrimary__01,
                    _hover: { background: colors.backgroundDark }
                  }}
                  popoverSx={{
                    py: 2,
                    button: {
                      color: colors.textPrimary,
                      px: '0.75rem',
                      py: '0.25rem'
                    }
                  }}
                  items={[
                    {
                      group: 'sort',
                      items: DropdownItems
                    }
                  ]}
                  value={sort}
                  onValueChange={setSort}
                />
                <Flex gap={2} alignItems="center">
                  <Button variant="ghost" px="1" height="34px" isLoading={isLoading} onClick={handleClickRefresh}>
                    <RefreshIcon width="24px" height="24px" color={colors.buttonPrimary__01} />
                  </Button>
                  <Link
                    href={`/launchpad/profile?wallet=${publicKey ? publicKey.toBase58() : ''}${referrerQuery.replace('?', '&')}`}
                    shallow
                  >
                    <UserIcon width="24px" height="24px" color={colors.buttonPrimary__01} />
                  </Link>
                </Flex>
                <Link href={`/launchpad/create${referrerQuery}`} shallow>
                  <Button
                    width="8.75rem"
                    height="2.125rem"
                    minHeight="2.125rem"
                    transition="200ms"
                    background={
                      isLight
                        ? 'linear-gradient(272.03deg, #4F53F3 2.63%, #8C6EEF 95.31%)'
                        : 'linear-gradient(90deg, #39D0D8 3.76%, #7748FC 78.34%)'
                    }
                    _hover={{
                      background: isLight
                        ? 'linear-gradient(272.03deg, #4F53F3 2.63%, #8C6EEF 95.31%)'
                        : 'linear-gradient(90deg, #39D0D8 3.76%, #7748FC 78.34%)'
                    }}
                  >
                    {t('launchpad.launch_token')}
                  </Button>
                </Link>
              </Flex>
              <Flex justifyContent="space-between" alignItems="center">
                <Flex gap={3}>
                  <MetasList
                    onMetaSelected={(val) => setMeta(val as any)}
                    activeMeta={meta}
                    metas={[
                      // {
                      //   word: 'heating',
                      //   word_with_strength: (
                      //     <Flex alignItems="center" gap={[0, '10px', '10px']}>
                      //       {/* <Text fontSize="sm">Heating up</Text> */}
                      //       🔥
                      //     </Flex>
                      //   )
                      // },
                      {
                        word: 'watch_list',
                        word_with_strength: (
                          <Flex alignItems="center" gap={[0, '10px', '10px']}>
                            {/* <Text fontSize="sm">Watch list</Text> */}
                            ⭐️
                          </Flex>
                        )
                      },
                      {
                        word: 'graduated',
                        word_with_strength: (
                          <Flex alignItems="center" gap={[0, '10px', '10px']}>
                            {/* <Text fontSize="sm">Graduated</Text> */}
                            🎓
                          </Flex>
                        )
                      }
                    ]}
                  />
                  <PlatformButton defaultValue={platform} onChange={handlePlatformChange} />
                </Flex>
                <Flex alignItems="center" justifyContent="space-between" gap={2}>
                  {!isMobileSearchOpen && (
                    <Button
                      onClick={() => {
                        openMobileSearch()
                      }}
                      variant="capsule"
                      height="34px"
                      pl={3}
                      pr={7}
                    >
                      <SearchIcon color={colors.textQuaternary} opacity={0.5} width="16px" height="16px" />
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      toggleCollapse()
                    }}
                    variant="capsule"
                    height={['34px', '40px']}
                    isActive={isCollapseOpen}
                  >
                    <MoreListControllers color={colors.textSecondary} width={listControllerIconSize} height={listControllerIconSize} />
                  </Button>
                </Flex>
              </Flex>
              {isMobileSearchOpen && (
                <SearchInput ref={searchInputRef} onSearchResultChange={handleSearchResultChange} includeNsfw={isIncludeNsfw} />
              )}
            </Flex>
          </>
        ) : (
          <Box marginX={['-20px', 0, 0, `min((100vw - 1600px) / -2, -7%)`]}>
            <Flex
              maxWidth="100%"
              height="3.75rem"
              justifyContent="space-between"
              paddingX={['20px', 0, 0, `max((100vw - 1600px) / 2, 7%)`]}
              background={colors.backgroundLight30}
            >
              <Flex gap={4} alignItems="center">
                <DropdownSelectMenu
                  placement="bottom-end"
                  triggerSx={{
                    width: '10rem',
                    minW: 'fit-content',
                    background: colors.backgroundDark,
                    border: `1px solid ${colors.buttonPrimary__01}`,
                    color: colors.buttonPrimary__01,
                    fontSize: ['md', 'md', 'xl'],
                    lineHeight: '26px',
                    _hover: { background: colors.backgroundDark }
                  }}
                  popoverSx={{
                    py: 2,
                    button: {
                      color: colors.textPrimary,
                      px: '0.75rem',
                      py: '0.25rem'
                    }
                  }}
                  items={[
                    {
                      group: 'sort',
                      items: DropdownItems
                    }
                  ]}
                  value={sort}
                  onValueChange={setSort}
                />
                <SearchInput onSearchResultChange={handleSearchResultChange} includeNsfw={isIncludeNsfw} />
                <Button
                  onClick={() => {
                    toggleCollapse()
                  }}
                  variant="capsule"
                  height={['34px', '40px']}
                  isActive={isCollapseOpen}
                >
                  <MoreListControllers color={colors.textSecondary} width={listControllerIconSize} height={listControllerIconSize} />
                </Button>
                <MetasList
                  onMetaSelected={(val) => setMeta(val as any)}
                  activeMeta={meta}
                  metas={[
                    // {
                    //   word: 'heating',
                    //   word_with_strength: (
                    //     <Flex alignItems="center" gap="10px">
                    //       {isDesktopSmall ? <Text fontSize="sm">Heating up</Text> : null}
                    //       🔥
                    //     </Flex>
                    //   )
                    // },
                    {
                      word: 'watch_list',
                      word_with_strength: (
                        <Flex alignItems="center" gap="10px">
                          {isDesktopSmall || isDesktopMedium || isDesktopLarge ? <Text fontSize="sm">Watch list</Text> : null}
                          ⭐️
                        </Flex>
                      )
                    },
                    {
                      word: 'graduated',
                      word_with_strength: (
                        <Flex alignItems="center" gap="10px">
                          {isDesktopSmall || isDesktopMedium || isDesktopLarge ? <Text fontSize="sm">Graduated</Text> : null}
                          🎓
                        </Flex>
                      )
                    }
                  ]}
                />
                <PlatformButton defaultValue={platform} onChange={handlePlatformChange} />
              </Flex>
              <Flex alignItems="center" gap={[2, 2, 7]}>
                <Flex gap="1" alignItems="center">
                  <Button variant="ghost" px="1" isLoading={isLoading} onClick={handleClickRefresh}>
                    <RefreshIcon color={colors.buttonPrimary__01} />
                  </Button>
                  <Link
                    href={`/launchpad/profile?wallet=${publicKey ? publicKey.toBase58() : ''}${referrerQuery.replace('?', '&')}`}
                    shallow
                  >
                    <UserIcon width="28px" height="28px" color={colors.buttonPrimary__01} />
                  </Link>
                </Flex>
                <Link href={`/launchpad/create${referrerQuery}`} shallow>
                  <Button
                    width="8.75rem"
                    transition="200ms"
                    background={
                      isLight
                        ? 'linear-gradient(272.03deg, #4F53F3 2.63%, #8C6EEF 95.31%)'
                        : 'linear-gradient(90deg, #39D0D8 3.76%, #7748FC 78.34%)'
                    }
                    _hover={{
                      background: isLight
                        ? 'linear-gradient(272.03deg, #4F53F3 2.63%, #8C6EEF 95.31%)'
                        : 'linear-gradient(90deg, #39D0D8 3.76%, #7748FC 78.34%)'
                    }}
                  >
                    {t('launchpad.launch_token')}
                  </Button>
                </Link>
              </Flex>
            </Flex>
          </Box>
        )}
      </Grid>
      <Collapse in={isCollapseOpen}>
        <Flex justifyContent={['space-between', 'flex-start']} gap={16} pt={3}>
          <Flex alignItems="center">
            <FormControl display="flex" alignItems="center">
              <FormLabel color={colors.lightPurple}>{t('launchpad.show_animations')}</FormLabel>
              <Switch defaultChecked={showAnimations} onChange={handleSwitchAnimationsChange} />
            </FormControl>
          </Flex>
          <Flex alignItems="center">
            <FormControl display="flex" alignItems="center">
              <FormLabel color={colors.lightPurple}>{t('launchpad.include_nsfw')}</FormLabel>
              <Switch defaultChecked={isIncludeNsfw} onChange={handleSwitchNsfwChange} />
            </FormControl>
          </Flex>
        </Flex>
      </Collapse>
      <CoinList
        actionRef={actionRef}
        sort={sort}
        meta={meta}
        platformId={platform}
        showAnimations={showAnimations}
        includeNsfw={isIncludeNsfw}
      />
    </Grid>
  )
}
