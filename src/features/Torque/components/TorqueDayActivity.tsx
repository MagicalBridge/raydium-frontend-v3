import { colors } from '@/theme/cssVariables'
import { Flex, Text, Tooltip } from '@chakra-ui/react'
import { TorqueUserRaffleDay } from '../types'
import { Check, XCircle } from 'react-feather'

export function TorqueDayActivity({ day }: { day: TorqueUserRaffleDay }) {
  return (
    <Flex direction={'column'} alignItems={'center'} justifyContent={'space-between'}>
      <Text fontSize="xs" color={colors.textTertiary}>
        {day.dayInitial}
      </Text>

      {day.tense === 'PAST' && (
        <Flex
          h={8}
          w={8}
          bg={day.ticketAchieved ? colors.positive : colors.semanticError}
          borderRadius={'md'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Tooltip
            label={
              day.ticketAchieved
                ? `You got a ticket for ${day.day.format('dddd')}!`
                : `You didn't get a ticket for ${day.day.format('dddd')}.`
            }
          >
            {day.ticketAchieved ? <Check color={colors.backgroundDark} /> : <XCircle color={colors.textPrimary} />}
          </Tooltip>
        </Flex>
      )}

      {day.tense === 'PRESENT' && (
        <Flex
          h={8}
          w={8}
          bg={day.ticketAchieved ? colors.positive : colors.backgroundMedium}
          borderRadius={'md'}
          alignItems={'center'}
          justifyContent={'center'}
          border={`1px solid ${colors.textTertiary}`}
        >
          {day.ticketAchieved ? (
            <Tooltip label="You got your ticket for today!">
              <Check color={colors.backgroundDark} />
            </Tooltip>
          ) : (
            <Text fontSize="xs" color={colors.textTertiary}>
              {day.day.format('D')}
            </Text>
          )}
        </Flex>
      )}

      {day.tense === 'FUTURE' && (
        <Flex h={8} w={8} bg={colors.backgroundMedium} borderRadius={'md'} alignItems={'center'} justifyContent={'center'}>
          <Text fontSize="xs" color={colors.textTertiary}>
            {day.day.format('D')}
          </Text>
        </Flex>
      )}
    </Flex>
  )
}
