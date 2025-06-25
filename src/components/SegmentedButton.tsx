import React from 'react'
import { Button, Flex } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

export type SegmentedItem = {
  label: string
  value: string
  disabled?: boolean
}

export const SegmentedButton: React.FC<{
  buttons: SegmentedItem[]
  value?: string
  onChange?: (value: string) => void
}> = ({ buttons, value, onChange }) => {
  if (buttons.length < 2) {
    return null
  }

  return (
    <Flex bg={colors.backgroundDark} borderRadius="27px">
      {buttons.map((item, index) => (
        <Button
          key={index}
          variant="ghost"
          w="full"
          height="2.625rem"
          borderRadius="22px"
          color={colors.lightPurple}
          fontSize="xl"
          onClick={() => onChange?.(item.value)}
          isDisabled={item.disabled}
          isActive={item.value === value}
          _hover={{
            bg: 'transparent'
          }}
          _active={{
            bg: item.value === OrderSide.BUY ? colors.positive : colors.negative,
            color: colors.textQuinary
          }}
          _disabled={{ opacity: 0.4 }}
        >
          {item.label}
        </Button>
      ))}
    </Flex>
  )
}
