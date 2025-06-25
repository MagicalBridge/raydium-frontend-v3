import { useState, useCallback } from 'react'
import { Button, Flex, Grid, Text, Spinner, Switch, Input } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import ExternalLink from '@/icons/misc/ExternalLink'
import NotFound from '@/components/NotFound'
import useTradeHistory from '@/hooks/launchpad/useTradeHistory'
import { useAppStore } from '@/store'
import { formatCurrency } from '@/utils/numberish/formatter'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { AddressHightlight, AddressProvider } from '@/components/AddressHightlight'

enum TransactionType {
  All = 'All',
  Buy = 'buy',
  Sell = 'sell'
}

const Transactions = ({ poolId, mintBInfo }: { poolId?: string; mintBInfo?: ApiV3Token }) => {
  const { t } = useTranslation()
  const publicKey = useAppStore((s) => s.publicKey)
  const [myTransaction, setMyTransaction] = useState(false)
  const [type, setType] = useState(TransactionType.All)
  const [values, setValues] = useState<{ min: number | undefined; max: number | undefined }>({
    min: undefined,
    max: undefined
  })
  const { data, loadMore, isLoading, hasMore } = useTradeHistory({
    poolId,
    minAmount: values.min,
    maxAmount: values.max,
    refreshInterval: 10 * 1000
  })

  const handleChange = useCallback(
    (type: 'min' | 'max') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)

      const updatedValues =
        type === 'min'
          ? { min: newValue || undefined, max: !e.target.value || values.max === undefined ? values.max : Math.max(values.max, newValue) }
          : { min: !e.target.value || values.min === undefined ? values.min : Math.min(values.min, newValue), max: newValue || undefined }

      setValues(updatedValues)
    },
    [values]
  )

  const handleLoadMoreClick = () => {
    loadMore()
  }

  return (
    <Grid templateRows="auto 1fr" overflow="auto">
      <Flex gap={5} mb="4">
        <Flex gap={2} alignItems="center">
          <Text fontSize="sm" fontWeight="medium" color={colors.lightPurple}>
            My transactions
          </Text>
          <Switch checked={myTransaction} onChange={() => setMyTransaction((b) => !b)} />
        </Flex>
        {/* <Flex gap={2} alignItems="center">
          <Text fontSize="sm" fontWeight="medium" color={colors.lightPurple}>
            Type
          </Text>
          <ButtonGroup size="sm" isAttached variant="ghost">
            <Button
              border="none"
              background="#ABC4FF1F"
              color="#BFD2FF80"
              fontSize="18px"
              borderRadius="22px"
              _hover={{
                color: colors.lightPurple
              }}
              _active={{
                color: colors.lightPurple
              }}
              isActive={type === TransactionType.All}
              onClick={() => setType(TransactionType.All)}
            >
              {TransactionType.All}
            </Button>
            <Button
              border="none"
              background="#ABC4FF1F"
              color="#BFD2FF80"
              textTransform="capitalize"
              _hover={{
                color: colors.lightPurple
              }}
              _active={{
                color: colors.lightPurple
              }}
              isActive={type === TransactionType.Buy}
              onClick={() => setType(TransactionType.Buy)}
            >
              {TransactionType.Buy}
            </Button>
            <Button
              border="none"
              background="#ABC4FF1F"
              color="#BFD2FF80"
              borderRadius="22px"
              textTransform="capitalize"
              _hover={{
                color: colors.lightPurple
              }}
              _active={{
                color: colors.lightPurple
              }}
              isActive={type === TransactionType.Sell}
              onClick={() => setType(TransactionType.Sell)}
            >
              {TransactionType.Sell}
            </Button>
          </ButtonGroup>
        </Flex> */}
        <Flex gap={2} alignItems="center">
          <Text fontSize="sm" fontWeight="medium" color={colors.lightPurple}>
            Size greater than
          </Text>
          <Flex
            height="32px"
            background="#ABC4FF1F"
            borderRadius="full"
            px={4}
            py={2}
            alignItems="center"
            position="relative"
            borderWidth={1}
          >
            <Input
              variant="unstyled"
              width="25px"
              textAlign="center"
              color={colors.lightPurple}
              fontSize="sm"
              lineHeight="18px"
              value={values.min}
              onChange={handleChange('min')}
              type="number"
              // step="0.1"
              min={0}
              _focus={{
                outline: 'none'
              }}
            />
            {/* <Text color={colors.lightPurple}>-</Text>
            <Input
              variant="unstyled"
              width="25px"
              textAlign="center"
              color={colors.lightPurple}
              fontSize="sm"
              lineHeight="18px"
              value={values.max}
              onChange={handleChange('max')}
              type="number"
              // step="0.1"
              // min={values.min}
              _focus={{
                outline: 'none'
              }}
            /> */}
          </Flex>
          <Text fontSize="sm" fontWeight="medium" color={colors.lightPurple}>
            {mintBInfo?.symbol ?? 'SOL'}
          </Text>
        </Flex>
      </Flex>
      <AddressProvider>
        <Grid
          templateColumns={['130px 50px 100px 100px 120px 140px', 'repeat(6, auto)', 'repeat(6, auto)']}
          justifyContent="space-between"
          columnGap={4}
          // overflow="auto"
          // scrollBehavior="smooth"
          // overscrollBehavior="contain"
          alignContent={data.length === 0 ? 'initial' : 'start'}
          mb={hasMore ? 0 : 10}
        >
          <Grid
            gridColumn="1 / -1"
            templateColumns="subgrid"
            bg="#ABC4FF12"
            borderTopRadius="12px"
            px="30px"
            height="40px"
            alignItems="center"
            backdropFilter="blur(8px)"
            position="sticky"
            top={0}
            zIndex={1}
          >
            <Text fontSize="sm" fontWeight="medium" lineHeight="18px" color={colors.textSecondary}>
              {t('launchpad.account')}
            </Text>
            <Text fontSize="sm" fontWeight="medium" lineHeight="18px" color={colors.textSecondary}>
              {t('launchpad.type')}
            </Text>
            <Text fontSize="sm" fontWeight="medium" lineHeight="18px" color={colors.textSecondary} textAlign="right">
              {mintBInfo?.symbol ?? 'SOL'} {t('common.amount')}
            </Text>
            <Text fontSize="sm" fontWeight="medium" lineHeight="18px" color={colors.textSecondary} textAlign="right">
              {t('launchpad.token_amount')}
            </Text>
            <Text fontSize="sm" fontWeight="medium" lineHeight="18px" color={colors.textSecondary}>
              {t('launchpad.time')}
            </Text>
            <Text fontSize="sm" fontWeight="medium" lineHeight="18px" color={colors.textSecondary} textAlign="center">
              {t('launchpad.tx_link')}
            </Text>
          </Grid>
          {data.length === 0 && !isLoading ? (
            <Grid gridColumn="1 / -1" justifyContent="center">
              <NotFound />
            </Grid>
          ) : (
            data
              .filter((i) => (type === TransactionType.All || i.side === type) && (!myTransaction || i.owner === publicKey?.toBase58()))
              .map((item, index) => (
                <Grid
                  key={index}
                  gridColumn="1 / -1"
                  templateColumns="subgrid"
                  bg={index % 2 === 0 ? 'transparent' : '#ABC4FF12'}
                  px="30px"
                  height="40px"
                  alignItems="center"
                >
                  <AddressHightlight
                    address={item.owner}
                    sx={{
                      fontSize: 'sm',
                      lineHeight: '18px'
                    }}
                  />
                  <Text fontSize="sm" lineHeight="18px" color={item.side === 'buy' ? colors.positive : colors.negative}>
                    {item.side}
                  </Text>
                  <Text fontSize="sm" lineHeight="18px" textAlign="right">
                    {formatCurrency(item.amountB, { maximumDecimalTrailingZeroes: 3 })}
                  </Text>
                  <Text fontSize="sm" lineHeight="18px" textAlign="right">
                    {formatCurrency(item.amountA, { abbreviated: true, decimalPlaces: 4 })}
                  </Text>
                  <Text fontSize="sm" lineHeight="18px">
                    {dayjs(item.blockTime * 1000).format('MM-DD HH:mm:ss')}
                  </Text>
                  <Flex justifyContent="center">
                    <a href={`${useAppStore.getState().explorerUrl}/tx/${item.txid}`} target="_blank" rel="noreferrer">
                      <ExternalLink width="20px" height="20px" />
                    </a>
                  </Flex>
                </Grid>
              ))
          )}
          {isLoading ? (
            <Grid gridColumn="1 / -1" justifyContent="center" height="41px" mt={3}>
              <Flex alignItems="center">
                <Spinner size="sm" />
              </Flex>
            </Grid>
          ) : (
            hasMore && (
              <Grid gridColumn="1 / -1" justifyContent="center" height="41px" mt={3}>
                <Button variant="ghost" color={colors.textLink} _hover={{ background: 'transparent' }} px={0} onClick={handleLoadMoreClick}>
                  {t('launchpad.load_more')}
                </Button>
              </Grid>
            )
          )}
        </Grid>
      </AddressProvider>
    </Grid>
  )
}

export default Transactions
