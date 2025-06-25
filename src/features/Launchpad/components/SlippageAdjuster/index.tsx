import React, { useState, useEffect } from 'react'
import { Flex, Button } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'
import { useDisclosure } from '@/hooks/useDelayDisclosure'
import MoreListControllers from '@/icons/misc/MoreListControllers'
import { SlippageSettingModal } from './SlippageSettingModal'
import Decimal from 'decimal.js'
import { useLaunchpadStore } from '@/store'

export function SlippageAdjuster({ onClick }: { onClick?: () => void }) {
  const { isOpen, onClose, onToggle } = useDisclosure()
  const slippage = useLaunchpadStore((s) => s.slippage)
  const [currentSlippage, setCurrentSlippage] = useState<string | undefined>()
  const [isWarn, setIsWarn] = useState(false)

  useEffect(() => {
    const slippageDecimal = new Decimal(slippage * 100)
    setCurrentSlippage(slippageDecimal.toDecimalPlaces(2).toString())
    // setIsWarn(slippageDecimal.gt('2.5'))
  }, [slippage])

  const handleOnClick = () => {
    onToggle()
  }
  return (
    <>
      <Flex align="center" onClick={onClick || handleOnClick}>
        <Button
          size="xs"
          height="fit-content"
          py={1}
          px={2}
          borderRadius="full"
          bg={isWarn ? colors.warnButtonBg : colors.buttonBg01}
          color={isWarn ? colors.semanticWarning : colors.textSecondary}
          fontSize={'sm'}
          fontWeight="normal"
          border={isWarn ? `1px solid ${colors.semanticWarning}` : '1px solid transparent'}
          _hover={{
            borderColor: colors.secondary,
            color: colors.secondary,
            bg: colors.buttonBg01,
            '.chakra-icon-hover': {
              fill: colors.secondary
            }
          }}
          _focus={{ boxShadow: 'outline' }}
          iconSpacing={1}
          leftIcon={
            <MoreListControllers
              width="14"
              height="14"
              className="chakra-icon chakra-icon-hover"
              color={isWarn ? colors.semanticWarning : colors.textSecondary}
            />
          }
          variant={'ghost'}
        >
          {currentSlippage}%
        </Button>
      </Flex>
      <SlippageSettingModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
