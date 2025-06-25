import { Grid, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { colors } from '@/theme/cssVariables/colors'
import NotFoundIcon from '@/icons/misc/NotFound'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <Grid gridAutoFlow="row" gridTemplateColumns="minmax(0, 1fr)" height="100%" justifyItems="center" alignContent="center" gap={8}>
      <NotFoundIcon width={60} height={60} />
      <Text fontSize="sm" color={colors.lightPurple}>
        {t('launchpad.no_results_found')}
      </Text>
    </Grid>
  )
}
