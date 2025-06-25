import { RefObject, useImperativeHandle } from 'react'
import { Flex, Grid, Text, Image, Button, Box, Link, useColorMode, useClipboard } from '@chakra-ui/react'
import NextLink from 'next/link'
import { colors } from '@/theme/cssVariables/colors'
import { Comment } from '@/hooks/launchpad/type'
import usePoolComments from '@/hooks/launchpad/usePoolComments'
import dayjs from 'dayjs'
import Dev from '@/icons/misc/Dev'
import { useWalletColor } from '@/hooks/launchpad/useWalletColor'
import { encodeStr } from '@/utils/common'
import { MintInfo } from '../type'
import CircleCheck from '@/icons/misc/CircleCheck'
import CopyLaunchpadIcon from '@/icons/misc/CopyLaunchpadIcon'
import { useReferrerQuery } from '../utils'
import { getImgProxyUrl } from '@/utils/url'

export interface CommentAction {
  loadNewComments: () => void
}

function htmlDecode(input: string) {
  if (!input) return ''
  const e = document.createElement('div')
  e.innerHTML = input
  return e.childNodes[0].nodeValue || e.innerHTML
}

export default function Comments({ actionRef, mintInfo }: { actionRef?: RefObject<CommentAction>; mintInfo?: MintInfo }) {
  const { mergedComments, isLoading, isEmptyPrevComments, prevCommentsLoading, loadNewComments, loadMorePrev } = usePoolComments({
    poolId: mintInfo?.poolId
  })

  useImperativeHandle(
    actionRef,
    () => ({
      loadNewComments
    }),
    [loadNewComments]
  )

  if (!isLoading && !mergedComments.length && !mintInfo) return <Flex justifyContent="center">No Comments Data</Flex>

  return (
    <Box>
      <Flex direction="column" gap={4}>
        {mintInfo ? (
          <CommentItem
            comment={{
              id: Date.now(),
              createAt: mintInfo.createAt,
              imgUrl: mintInfo.imgUrl,
              poolId: mintInfo.poolId,
              text: mintInfo.description,
              wallet: mintInfo.creator
            }}
            isDeveloper={true}
            isFirst={true}
          />
        ) : null}
        {mergedComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} isDeveloper={comment.wallet === mintInfo?.creator} />
        ))}
      </Flex>
      <Box my="15px" textAlign="center">
        {isEmptyPrevComments ? null : (
          <Button variant="outline" onClick={loadMorePrev} isLoading={prevCommentsLoading}>
            Load Previous
          </Button>
        )}
      </Box>
    </Box>
  )
}

const CommentItem = ({ comment, isDeveloper, isFirst }: { comment: Comment; isDeveloper?: boolean; isFirst?: boolean }) => {
  const walletColor = useWalletColor(comment.wallet)
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const { onCopy: copy, hasCopied } = useClipboard(comment.wallet)
  const referrerQuery = useReferrerQuery('&')

  return (
    <Grid
      width="100%"
      background={isLight ? '#EDEDFF' : '#ABC4FF12'}
      p={3}
      borderRadius="4px"
      position="relative"
      _before={
        isFirst
          ? {
              content: `""`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 'inherit',
              padding: '1px',
              background: 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none'
            }
          : {}
      }
      templateRows="auto 1fr"
      gap={4}
    >
      {isDeveloper ? (
        <Grid templateColumns="auto 1fr" gap={4}>
          {comment.imgUrl ? <Image src={getImgProxyUrl(comment.imgUrl, 100)} fallbackSrc={comment.imgUrl} boxSize="100px" /> : null}
          <Flex direction="column" gap={4}>
            <Text color={colors.lightPurple} fontSize="sm">
              {htmlDecode(comment.text)}
            </Text>
            {/* <Text fontSize="sm" color={colors.lightPurple}>
              {comment.description}
            </Text> */}
          </Flex>
        </Grid>
      ) : (
        <Text overflowWrap="break-word" wordBreak="break-word">
          {htmlDecode(comment.text)}
          {comment.imgUrl ? (
            <Image src={getImgProxyUrl(comment.imgUrl, 100)} fallbackSrc={comment.imgUrl} mt="10px" boxSize="100px" />
          ) : null}
        </Text>
      )}
      <Flex justifyContent="space-between" alignItems="center" width="100%">
        <Flex alignItems="center" gap={1}>
          <Text fontSize="sm" color={colors.lightPurple} mr={2} lineHeight="18px">
            By
          </Text>
          <Flex alignItems="center" gap={1} fontSize="sm" pr="0.5rem">
            <Link
              as={NextLink}
              sx={
                isDeveloper
                  ? {
                      background: 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }
                  : { color: walletColor }
              }
              href={`/launchpad/profile/?wallet=${comment.wallet}${referrerQuery}`}
            >
              {encodeStr(comment.wallet, 5, 3)}
            </Link>
            <Flex alignItems="center">
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
          {isDeveloper && <Dev />}
        </Flex>
        <Text fontSize="sm" color={colors.lightPurple} opacity={0.6} lineHeight="18px" noOfLines={1}>
          {dayjs(comment.createAt).format('YYYY/MM/DD HH:mm:ss')}
        </Text>
      </Flex>
    </Grid>
  )
}
