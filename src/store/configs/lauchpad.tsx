import { Trans } from 'react-i18next'
import { Text } from '@chakra-ui/react'
import i18n from '@/i18n'
import { colors } from '@/theme/cssVariables/colors'

const LAUCHPAD_TX_MSG = {
  launchBuy: {
    title: 'launchpad.launch_and_buy',
    desc: 'launchpad.buy_token_desc',
    txHistoryTitle: 'launchpad.launch_and_buy',
    txHistoryDesc: 'launchpad.buy_token_desc',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  },
  buy: {
    title: 'launchpad.buy_token_title',
    desc: 'launchpad.buy_token_desc',
    txHistoryTitle: 'launchpad.buy_token_title',
    txHistoryDesc: 'launchpad.buy_token_desc',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  },
  sell: {
    title: 'launchpad.sell_token_title',
    desc: 'launchpad.sell_token_desc',
    txHistoryTitle: 'launchpad.sell_token_title',
    txHistoryDesc: 'launchpad.sell_token_desc',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  }
}

export const getTxMeta = ({ action, values }: { action: keyof typeof LAUCHPAD_TX_MSG; values: Record<string, unknown> }) => {
  const meta = LAUCHPAD_TX_MSG[action]
  return {
    title: i18n.t(meta.title, values),
    description: <Trans i18nKey={meta.desc} values={values} components={meta.components} />,
    txHistoryTitle: meta.txHistoryTitle || meta.title,
    txHistoryDesc: meta.txHistoryDesc || meta.desc,
    txValues: values
  }
}
