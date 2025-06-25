import { Flex, Text, LinkBox, LinkOverlay, Avatar, Image } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'
import { MintInfo } from '../type'
import { createTimeDiff, useReferrerQuery } from '../utils'
import { formatCurrency } from '@/utils/numberish/formatter'
import NextLink from 'next/link'
import { wSolToSolString } from '@/utils/token'
import { getImgProxyUrl } from '@/utils/url'

export const TopListCard = ({
  mintInfo,
  tradeData
}: {
  mintInfo: MintInfo
  tradeData?: { amountA: number; amountB: number; side: 'buy' | 'sell' }
}) => {
  const query = useReferrerQuery('&')
  const isBuy = tradeData?.side === 'buy'

  const symbolB = wSolToSolString(mintInfo.mintB.symbol ?? 'SOL')

  return (
    <LinkBox as="article" width="100%">
      <Flex justifyContent="space-between" alignItems="center">
        <Flex alignItems="center" gap={2}>
          <Image
            src={getImgProxyUrl(mintInfo.imgUrl, 40)}
            fallbackSrc={mintInfo.imgUrl}
            width="40px"
            height="40px"
            overflow="hidden"
            borderRadius="0"
            objectFit="cover"
          />
          <LinkOverlay as={NextLink} href={`/launchpad/token?mint=${mintInfo.mint}${query}`}>
            {tradeData ? (
              <Flex flexDirection="column">
                <Text fontSize="xs" color={colors.lightPurple} noOfLines={1}>
                  someone just {isBuy ? 'bought' : 'sold'}
                </Text>
                <Text fontWeight="medium" wordBreak="break-word" noOfLines={1}>
                  {formatCurrency(tradeData.amountB, { maximumDecimalTrailingZeroes: 3, abbreviated: true })} {symbolB}{' '}
                  <Text as="span" fontSize="xs" color={colors.lightPurple}>
                    of
                  </Text>{' '}
                  {/* {lastData.amountA} */}
                  {mintInfo.symbol}
                </Text>
              </Flex>
            ) : null}
            {tradeData ? null : (
              <Flex flexDirection="column">
                <Text fontSize="xs" color={colors.lightPurple} noOfLines={1}>
                  New Token Created
                </Text>
                <Text fontWeight="medium" wordBreak="break-word" noOfLines={1}>
                  {mintInfo.symbol}{' '}
                  <Text as="span" color={colors.lightPurple}>
                    ({mintInfo.name})
                  </Text>
                </Text>
              </Flex>
            )}
          </LinkOverlay>
        </Flex>
        {tradeData ? (
          <Text color={colors.textLaunchpadLink} fontSize="xs" alignSelf="flex-start">
            MC: {formatCurrency(mintInfo.marketCap, { symbol: '$', decimalPlaces: 2, abbreviated: true })}
          </Text>
        ) : null}
        {tradeData ? null : (
          <Text color={colors.lightPurple} fontSize="xs" alignSelf="flex-start">
            {createTimeDiff(mintInfo.createAt)}
          </Text>
        )}
      </Flex>
    </LinkBox>
  )
}
