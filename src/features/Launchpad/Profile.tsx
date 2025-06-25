import React, { useEffect, useMemo } from 'react'
import { Box, Grid, GridItem, Flex, Text, Button, Avatar, Link, useClipboard, Image } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { colors } from '@/theme/cssVariables/colors'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import { GridTable, ColumnDef } from '@/components/GridTable'
import NotFound from '@/components/NotFound'
import TelegrameIcon from '@/icons/misc/TelegrameIcon'
import TwitterIcon from '@/icons/misc/TwitterIcon'
import WebIcon from '@/icons/misc/WebIcon'
import NextLink from 'next/link'
import ThreeStageProgress from './components/ThreeStageProgress'
import { useAppStore, useDialogsStore } from '@/store'
import useOwnerMints from '@/hooks/launchpad/useOwnerMints'
import { MintInfo } from './type'
import { formatCurrency } from '@/utils/numberish/formatter'
import dayjs from 'dayjs'
import { encodeStr } from '@/utils/common'
import { DialogTypes } from '@/constants/dialogs'
import CircleCheck from '@/icons/misc/CircleCheck'
import CopyLaunchpadIcon from '@/icons/misc/CopyLaunchpadIcon'
import { useStateWithUrl } from '@/hooks/useStateWithUrl'
import ConnectedButton from '@/components/ConnectedButton'
import { useReferrerQuery } from './utils'
import useReferrerInfo from '@/hooks/launchpad/useReferrerInfo'
import TokenAvatar from '@/components/TokenAvatar'
import { getImgProxyUrl } from '@/utils/url'

const Profile = () => {
  const { t } = useTranslation()
  const publicKey = useAppStore((s) => s.publicKey)
  const openDialog = useDialogsStore((s) => s.openDialog)
  const referrerQuery = useReferrerQuery('&')

  const [wallet, setWallet] = useStateWithUrl('', 'wallet', {
    fromUrl: (u) => u,
    toUrl: (v) => v
  })

  const referrerInfo = useReferrerInfo({ wallet })

  const { data, isLoading, loadMore, hasMore } = useOwnerMints({ wallet })

  const hasWallet = !!wallet
  useEffect(() => {
    if (publicKey && !hasWallet) setWallet(publicKey.toBase58())
  }, [hasWallet, publicKey])

  const columns = useMemo<ColumnDef<MintInfo>[]>(
    () =>
      [
        {
          columnKey: 'symbol',
          label: 'Token',
          renderCell: (token) => <TokenCell token={token} />
        },
        {
          columnKey: 'market_cap',
          label: 'Market cap',
          align: 'end',
          renderCell: (token) => {
            return <Text>{formatCurrency(token.marketCap, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}</Text>
          }
        },
        {
          columnKey: 'progress',
          label: 'Progress bar',
          renderCell: (token) => (
            <Box width="100%">
              <ThreeStageProgress percent={token.finishingRate} />
            </Box>
          )
        },
        {
          columnKey: 'social',
          label: 'Social',
          renderCell: (token) => (
            <Flex color={colors.textLink} alignItems="center" gap={2}>
              {token.twitter ? (
                <Link as={NextLink} href={token.twitter} isExternal>
                  <TwitterIcon width="24px" height="24px" />
                </Link>
              ) : null}

              {token.website ? (
                <Box
                  cursor="pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    openDialog(DialogTypes.ThirdPartyWarning({ url: token.website! }))
                  }}
                >
                  <WebIcon width="24px" height="24px" />
                </Box>
              ) : null}

              {token.telegram ? (
                <Link as={NextLink} href={token.telegram} isExternal>
                  <TelegrameIcon width="24px" height="24px" />
                </Link>
              ) : null}
            </Flex>
          )
        },
        {
          columnKey: 'created_at',
          label: 'Created at',
          renderCell: (token) => {
            return <Text>{dayjs(token.createAt).format('YYYY/MM/DD HH:mm:ss')}</Text>
          }
        },
        {
          columnKey: 'action',
          label: '',
          align: 'end',
          renderCell: (token) => (
            <Link as={NextLink} display="contents" href={`/launchpad/token?mint=${token.mint}${referrerQuery}`}>
              <Button size="sm" variant="outline" colorScheme="cyan" borderRadius="md" fontSize="xs">
                View token
              </Button>
            </Link>
          )
        }
      ] as ColumnDef<MintInfo>[],
    []
  )

  if (!wallet) return <ConnectedButton w="fit-content" mx="auto" />
  return (
    <Grid templateRows="auto auto 1fr" gap={5} height="100%">
      <GridItem>
        <Flex alignItems="center" gap={1} opacity={0.5}>
          <Link as={NextLink} href={`/launchpad${referrerQuery.replace('&', '?')}`} display="contents" shallow color={colors.lightPurple}>
            <ChevronLeftIcon />
            <Text fontWeight="medium" fontSize="xl">
              {t('common.back')}
            </Text>
          </Link>
        </Flex>
      </GridItem>
      <GridItem>
        <Flex justifyContent="center" direction="column" alignItems="center" gap={1}>
          <Text color={colors.lightPurple} fontSize="sm">
            Token created by
          </Text>
          <Text fontSize="xl">@{encodeStr(wallet ?? '', 4, 3)}</Text>
        </Flex>
      </GridItem>
      <GridItem overflow="auto">
        <GridTable
          data={data}
          getRowKey={(row: MintInfo) => row.mint}
          label={'ProfileDataTable'}
          columns={columns}
          slotEmpty={<NotFound />}
          isLoading={isLoading}
          getRowAttributes={(row: MintInfo, rowIndex: number) => ({
            style: {
              height: 'fit-content',
              background: rowIndex % 2 === 0 ? 'transparent' : ' #ABC4FF12',
              paddingLeft: '3.125rem',
              paddingRight: '1rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem'
            }
          })}
          sx={{
            gridTemplateColumns: '280px 150px 200px 100px 180px 116px',
            justifyContent: 'space-between',
            columnGap: '1rem',
            '--table-row-height': '4.375rem'
          }}
          headerRowSx={{
            background: '#1C243E4D',
            color: colors.textSecondary,
            fontSize: 'sm',
            fontWeight: 'medium',
            height: '3.125rem',
            backdropFilter: 'blur(8px)',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            borderTopRadius: '12px',
            pl: '3.125rem',
            pr: '1rem'
          }}
        />
        {hasMore ? (
          <Button variant="outline" display="block" mt="4" mx="auto" onClick={loadMore}>
            Load More
          </Button>
        ) : null}
        {referrerInfo.length ? (
          <Box mt={8}>
            <Text color={colors.lightPurple} mb="2">
              {t('launchpad.referrer_fee_earned')}
            </Text>
            <Flex gap="3" alignItems={'center'} color={colors.textSecondary}>
              {referrerInfo.map((referrer, idx) => (
                <Flex
                  key={`${referrer.mintInfo.symbol}-${idx}`}
                  bg="rgba(28, 36, 62, 1)"
                  py="2"
                  px="4"
                  borderRadius="xl"
                  alignItems={'center'}
                  gap="1"
                >
                  <TokenAvatar token={referrer.mintInfo} />
                  {formatCurrency(referrer.referrerInfo.amount, { decimalPlaces: 4 })} {referrer.mintInfo.symbol}
                </Flex>
              ))}
            </Flex>
          </Box>
        ) : null}
      </GridItem>
    </Grid>
  )
}

const TokenCell = ({ token }: { token: MintInfo }) => {
  const { onCopy: copy, hasCopied } = useClipboard(token.mint)
  return (
    <Flex alignItems="center" gap={2}>
      <Image width="2.5rem" height="2.5rem" src={getImgProxyUrl(token.imgUrl, 50)} fallbackSrc={token.imgUrl} borderRadius="50%" />
      <Box>
        <Text
          fontSize="18px"
          fontWeight="medium"
          maxWidth="10rem"
          isTruncated
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {token.symbol}
        </Text>
        <Flex alignItems="center" gap={1} color={colors.lightPurple} fontSize="sm">
          <Text maxWidth="10rem" isTruncated whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
            {token.name}
          </Text>
          <Text fontSize="xs" color={colors.lightPurple} opacity={0.6} pl="0.5rem">
            {encodeStr(token.mint, 5, 3)}
          </Text>
          <Flex alignItems="center">
            <Box
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
      </Box>
    </Flex>
  )
}

export default Profile
