import Button from '@/components/Button'
import DecimalInput from '@/components/DecimalInput'
import Close from '@/icons/misc/Close'
import { useEvent } from '@/hooks/useEvent'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { Flex, Text, HStack, Spacer } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { setStorageItem } from '@/utils/localStorage'
import { KeyboardEvent, useCallback, useState } from 'react'
import Decimal from 'decimal.js'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import { useLaunchpadStore, LAUNCHPAD_SLIPPAGE_KEY } from '@/store'

export function SlippageSettingField({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation()
  const slippage = useLaunchpadStore((s) => s.slippage)
  const [currentSlippage, setCurrentSlippage] = useState(new Decimal(slippage).mul(100).toFixed())
  const [isFirstFocused, setIsFirstFocused] = useState(false)
  const slippageDecimal = new Decimal(currentSlippage || 0)
  const isForerun = slippageDecimal.gt('3')
  const isFailrun = slippageDecimal.lt('0.5')
  // const isWarn = isSwap && (isForerun || isFailrun)
  // const warnText = isForerun ? t('setting_board.slippage_tolerance_forerun') : isFailrun ? t('setting_board.slippage_tolerance_fail') : ''
  const isWarn = false
  const warnText = ''
  const handleChange = useEvent((val: string | number) => {
    setIsFirstFocused(false)
    setCurrentSlippage(String(val))
  })
  const handleUpdateSlippage = useEvent((val: string | number) => {
    const setVal = Number(val ?? 0) / 100
    setStorageItem(LAUNCHPAD_SLIPPAGE_KEY, setVal)
    useLaunchpadStore.setState({ slippage: setVal }, false, { type: 'SlippageToleranceSettingField' })
  })
  const handleBlur = useEvent(() => {
    setIsFirstFocused(false)
    if (!currentSlippage) handleChange(0)
    handleUpdateSlippage(currentSlippage || 0)
  })
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }, [])
  const handleFocus = useEvent(() => {
    setIsFirstFocused(true)
  })

  return (
    <Flex
      flexDirection="column"
      gap="4"
      my="2"
      p="4"
      border={`1px solid ${colors.backgroundTransparent10}`}
      bg={colors.backgroundTransparent07}
      rounded="xl"
    >
      <HStack alignItems="center" flexWrap={['wrap', 'nowrap']}>
        <Text color={colors.textSecondary}>{t('setting_board.slippage_tolerance_launchpad')}</Text>
        <QuestionToolTip label={t('setting_board.slippage_tolerance_tooltip_launchpad')} iconProps={{ color: colors.textSecondary }} />
        <Spacer />
        <Close style={{ cursor: 'pointer' }} width={12} height={12} color={colors.textSecondary} onClick={onClose} />
      </HStack>
      <Flex rowGap={2} flexWrap={['wrap', 'unset']} justifyContent="space-between">
        <Flex gap="2">
          {[1, 2.5, 5].map((v) => (
            <Button
              key={v}
              size={'sm'}
              isActive={slippage * 100 == v}
              variant="capsule-radio"
              onClick={() => {
                handleChange(v)
                handleUpdateSlippage(v)
              }}
            >
              {formatToRawLocaleStr(toPercentString(v))}
            </Button>
          ))}
        </Flex>
        <Flex alignItems="center" rounded="full">
          <Text fontSize="xs" whiteSpace={'nowrap'} color={colors.textSecondary}>
            {t('setting_board.custom')}
          </Text>
          <DecimalInput
            variant="filledDark"
            value={isFirstFocused ? '' : currentSlippage}
            placeholder={currentSlippage}
            max={50}
            decimals={2}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            inputSx={{ textAlign: 'right', rounded: '40px', h: '36px', w: '70px', py: 0, px: '3' }}
          />
          <Text fontSize="xs" color={colors.textSecondary}>
            %
          </Text>
        </Flex>
      </Flex>
      {isWarn ? (
        <Text fontSize="sm" color={colors.semanticWarning}>
          {warnText}
        </Text>
      ) : null}
    </Flex>
  )
}
