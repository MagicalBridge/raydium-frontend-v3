import { Box, Flex, Grid, Text, Tooltip } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'
import { useTranslation } from 'react-i18next'
import ExternalLink from '@/icons/misc/ExternalLink'
import NotFound from '@/components/NotFound'
import { useAppStore } from '@/store'

import { encodeStr } from '@/utils/common'
import Government from '@/icons/misc/Government'
import Dev from '@/icons/misc/Dev'
import useHolders from '@/hooks/launchpad/useHolders'
import { MintInfo } from '../type'
import RaydiumLogo from '@/icons/RaydiumLogo'

const Holders = ({
  mintInfo,
  mintVault,
  ownerAta,
  poolVault
}: {
  mintInfo?: MintInfo
  mintVault?: string
  ownerAta?: string
  poolVault?: string
}) => {
  const { t } = useTranslation()
  const explorerUrl = useAppStore((s) => s.explorerUrl)
  const { data: holders } = useHolders({ mint: mintInfo?.mint, supply: mintInfo?.supply })

  return (
    <Grid
      templateColumns="repeat(3, auto)"
      justifyContent="space-between"
      columnGap={4}
      overflow="auto"
      scrollBehavior="smooth"
      overscrollBehavior="contain"
      alignContent={holders.length === 0 ? 'initial' : 'start'}
    >
      <Grid
        gridColumn="1 / -1"
        templateColumns="subgrid"
        bg="#ABC4FF12"
        borderTopRadius="12px"
        px={[4, 4, 20]}
        height="40px"
        alignItems="center"
        backdropFilter="blur(8px)"
        position="sticky"
        top={0}
        zIndex={1}
      >
        <Text fontSize="sm" fontWeight="medium" lineHeight="18px" color={colors.textSecondary}>
          {t('launchpad.rank')}
        </Text>
        <Text fontSize="sm" fontWeight="medium" lineHeight="18px" color={colors.textSecondary}>
          {t('launchpad.holder')}
        </Text>
        <Text fontSize="sm" fontWeight="medium" lineHeight="18px" color={colors.textSecondary} textAlign="right">
          {t('launchpad.percentage')}
        </Text>
      </Grid>
      {holders.length === 0 ? (
        <Grid gridColumn="1 / -1" justifyContent="center">
          <NotFound />
        </Grid>
      ) : (
        holders.map((item, index) => (
          <Grid
            key={index}
            gridColumn="1 / -1"
            templateColumns="subgrid"
            bg={index % 2 === 0 ? 'transparent' : '#ABC4FF12'}
            height="40px"
            alignItems="center"
            px={[4, 4, 20]}
          >
            <Text fontSize="sm" lineHeight="18px">
              {index + 1}
            </Text>
            <Flex gap={1} alignItems="center">
              <Text
                width="12ch"
                fontSize="sm"
                lineHeight="18px"
                sx={
                  item.address === ownerAta
                    ? {
                        background: 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }
                    : {}
                }
              >
                {encodeStr(item.address, 5, 3)}
              </Text>
              <a href={`${explorerUrl}/account/${item.address}`} target="_blank" rel="noreferrer">
                <ExternalLink width="20px" height="20px" />
              </a>
              {item.address === poolVault && (
                <Tooltip hasArrow placement="top" label={t('launchpad.raydium_pool')}>
                  <Box>
                    <RaydiumLogo width="20" height="20" />
                  </Box>
                </Tooltip>
              )}
              {item.address === ownerAta && <Dev />}
              {item.address === mintVault && (
                <Tooltip hasArrow placement="top" label={t('launchpad.bongding_curve')}>
                  <Box>
                    <Government />
                  </Box>
                </Tooltip>
              )}
            </Flex>
            <Text fontSize="sm" lineHeight="18px" textAlign="right">
              {item.percentage}%
            </Text>
          </Grid>
        ))
      )}
    </Grid>
  )
}

export default Holders
