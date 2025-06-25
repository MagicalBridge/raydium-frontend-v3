import { Heading, Stack, Text, Spinner, VStack, HStack, Badge, Skeleton, SkeletonText, Progress, Flex, Box } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'
import { TorqueCountdown } from './TorqueCountDown'
import TicketIcon from '@/icons/misc/TicketIcon'
import { TorqueRaffle as TorqueRaffleType } from '../types'
import { displayNumber } from '../utils'
import dayjs from 'dayjs'
import { TorqueDayActivity } from './TorqueDayActivity'
import GiftIcon from '@/icons/misc/Gift'
import CalendarIcon from '@/icons/misc/Calendar'
import GaugeIcon from '@/icons/misc/Gauge'

interface TorqueLeaderboardProps {
  raffle?: TorqueRaffleType
  loading: boolean
  error: string | null
  refetching: boolean
}

export default function TorqueRaffle({ raffle, loading, error, refetching }: TorqueLeaderboardProps) {
  const totalTicketsPercentage = ((raffle?.userDetails?.totalTickets ?? 0) / (raffle?.maxWeeklyTickets ?? 7)) * 100

  if (loading || !raffle) {
    return (
      <Wrapper>
        <TorqueRaffleSkeleton />
      </Wrapper>
    )
  }

  if (error) {
    return (
      <Wrapper>
        <VStack
          w="full"
          spacing={4}
          p={3}
          minH={24}
          borderRadius="md"
          bg={colors.backgroundDark}
          opacity={0.7}
          justify="center"
          align="center"
        >
          <Heading as="h3" fontSize="md">
            Unable to load the raffle
          </Heading>
          <Text fontSize="sm" align="center">
            Looks like there was an error loading the raffle. Please try again later.
          </Text>
        </VStack>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <VStack w="full" spacing={4} p={3} borderRadius="md" bg={colors.backgroundDark}>
        <HStack w="full" justifyContent={'space-between'}>
          <Heading as="h3" fontSize="md">
            {raffle?.name}
          </Heading>
          <Badge variant="crooked" fontSize={'md'}>
            {displayNumber(raffle?.totalRewards)} {raffle?.rewardDenomination}
          </Badge>
        </HStack>
        <Text fontSize="xs" w="full" color={colors.textTertiary}>
          {raffle?.description}
        </Text>
        <HStack w="full" justifyContent={'space-between'}>
          <Text fontSize="sm" w="full" color={colors.textPrimary}>
            Raffle ends in:
          </Text>
          <TorqueCountdown date={raffle?.endTime} size="sm" />
        </HStack>
        <VStack w="full" spacing={4}>
          <HStack w="full" justifyContent={'space-between'} gap={2}>
            <TicketIcon />
            <Text w="full" color={colors.textPrimary}>
              Your Tickets
            </Text>
          </HStack>
          <HStack w="full" justifyContent={'space-between'}>
            <Text fontSize="xs" w="full" color={colors.textTertiary}>
              {raffle.userDetails?.totalTickets ?? 0} of {raffle.maxWeeklyTickets}
            </Text>
            <Progress value={totalTicketsPercentage} width={'50%'} bg={colors.backgroundMedium} />
          </HStack>
        </VStack>
      </VStack>

      <Section
        title="My Progress Today"
        icon={refetching ? <Spinner size="sm" /> : <GaugeIcon />}
        text={`Updated at: ${dayjs(raffle.lastUpdated).format('h:mm A')}`}
      >
        {raffle.userDetails ? (
          <VStack w="full" spacing={4} p={3} minH={24} borderRadius="md" bg={colors.backgroundDark} justify="center" align="center">
            <HStack w="full" justifyContent={'space-between'} alignItems={'center'}>
              <HStack w="full" alignItems={'flex-end'} gap={2}>
                <Text fontSize={'lg'} color={colors.textPrimary} marginBottom={0} lineHeight={1}>
                  {raffle.userDetails.currentDayTotal.toFixed(2)}
                </Text>
                <Text fontSize="xs" color={colors.textPrimary} marginBottom={0}>
                  / {raffle.todaysThreshold} {raffle.volumeDenomination}
                </Text>
              </HStack>
              <TorqueCountdown date={raffle.userDetails.todaysDate.utc().endOf('day')} size="sm" />
            </HStack>
            <Progress
              value={(raffle.userDetails.currentDayTotal / raffle.todaysThreshold) * 100}
              width={'100%'}
              bg={colors.backgroundMedium}
            />
            <Text fontSize="xs" w="full" color={colors.textTertiary}>
              {raffle.todaysThreshold - raffle.userDetails.currentDayTotal <= 0
                ? "You've got todays ticket!"
                : `You need ${raffle.todaysThreshold - raffle.userDetails.currentDayTotal} ${raffle.volumeDenomination} to get a ticket.`}
            </Text>
          </VStack>
        ) : (
          <Stack
            w="full"
            spacing={4}
            p={3}
            minH={24}
            borderRadius="md"
            bg={colors.backgroundDark}
            justify="center"
            align="center"
            opacity={0.7}
          >
            <Text textAlign="center">Please connect your wallet to see your progress.</Text>
          </Stack>
        )}
      </Section>
      <Section
        title="My Weekly Activity"
        icon={refetching ? <Spinner size="sm" /> : <CalendarIcon />}
        text={`${raffle.userDetails?.totalTickets ?? 0}/7 Days`}
      >
        {raffle.userDetails ? (
          <VStack w="full" spacing={4} p={3} borderRadius="md" bg={colors.backgroundDark} justify="center" align="center">
            <HStack w="full" justifyContent={'space-between'}>
              {raffle.userDetails.days.map((day) => (
                <TorqueDayActivity key={day.day.toISOString()} day={day} />
              ))}
            </HStack>
          </VStack>
        ) : (
          <Stack
            w="full"
            spacing={4}
            p={3}
            minH={24}
            borderRadius="md"
            bg={colors.backgroundDark}
            justify="center"
            align="center"
            opacity={0.7}
          >
            <Text textAlign="center">Please connect your wallet to see your weekly activity.</Text>
          </Stack>
        )}
      </Section>
      <Section title="Prize Tiers" icon={<GiftIcon />}>
        <Stack w="full" spacing={4} p={3} minH={24} borderRadius="md" bg={colors.backgroundDark} justify="center" align="center">
          {raffle.rewards.map((reward, index) => (
            <Flex key={index} w="full" justifyContent={'space-between'} pb={2} mt={0}>
              <Text fontSize="sm" w="full" color={colors.textTertiary}>
                {reward.winnersCount} winners
              </Text>
              <Badge variant="crooked" fontSize={'xs'}>
                {displayNumber(reward.reward)} {raffle.rewardDenomination}
              </Badge>
            </Flex>
          ))}
          <Flex w="full" justifyContent={'space-between'} pb={2} mt={-2} borderTop={`1px solid ${colors.dividerBg}`} pt={2}>
            <Text fontSize="sm" w="full" color={colors.textTertiary}>
              Total
            </Text>
            <Badge variant="crooked" fontSize={'xs'}>
              {displayNumber(raffle.totalRewards)} {raffle.rewardDenomination}
            </Badge>
          </Flex>
        </Stack>
      </Section>
      <Section title="Raffle Details" icon={<TicketIcon />}>
        <Stack w="full" spacing={4} p={3} minH={24} borderRadius="md" bg={colors.backgroundDark} justify="center" align="center">
          <Flex w="full" justifyContent={'space-between'} pb={2} mt={0}>
            <Text fontSize="sm" w="full" color={colors.textTertiary}>
              Today&apos;s Required Points
            </Text>
            <Badge variant="crooked">{displayNumber(raffle.todaysThreshold)}</Badge>
          </Flex>
          <Flex w="full" justifyContent={'space-between'} pb={2} mt={0}>
            <Text fontSize="sm" w="full" color={colors.textTertiary}>
              Tickets per day
            </Text>
            <Text fontSize="sm" w="full" color={colors.textTertiary} textAlign={'end'}>
              {raffle.ticketsPerDay} tickets
            </Text>
          </Flex>
          <Flex w="full" justifyContent={'space-between'} pb={2} mt={0}>
            <Text fontSize="sm" w="full" color={colors.textTertiary}>
              Weekly ticket cap
            </Text>
            <Text fontSize="sm" w="full" color={colors.textTertiary} textAlign={'end'}>
              {raffle.maxWeeklyTickets} tickets
            </Text>
          </Flex>
          <Flex w="full" justifyContent={'space-between'} pb={2} mt={0}>
            <Text fontSize="sm" w="full" color={colors.textTertiary}>
              Repeat wins
            </Text>
            <Text fontSize="sm" w="full" color={colors.textTertiary} textAlign={'end'}>
              {raffle.winMoreThanOnce ? 'Yes' : 'No'}
            </Text>
          </Flex>
        </Stack>
      </Section>
    </Wrapper>
  )
}

function Section({ children, title, icon, text }: { children: React.ReactNode; title: string; icon?: React.ReactNode; text?: string }) {
  return (
    <VStack gap={2} p={0} w="full" align="flex-start">
      <HStack gap={2} justifyContent={'space-between'} alignItems={'center'} w="full">
        <HStack gap={2} alignItems={'center'}>
          {icon}
          <Heading as="h3" fontSize="md" alignSelf="flex-start">
            {title}
          </Heading>
        </HStack>
        {text && (
          <Text fontSize="xs" color={colors.textTertiary}>
            {text}
          </Text>
        )}
      </HStack>
      {children}
    </VStack>
  )
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <VStack w="full" h="full" spacing={4}>
      {children}
    </VStack>
  )
}

function TorqueRaffleSkeleton() {
  return (
    <VStack w="full" h="full" spacing={4}>
      <VStack w="full" spacing={4} p={3} borderRadius="md" bg={colors.backgroundDark}>
        <HStack w="full" justifyContent={'space-between'}>
          <Skeleton w="55%" h={5} />
          <Skeleton h={5} w={10} />
        </HStack>
        <SkeletonText w="full" noOfLines={3} />
        <HStack w="full" justifyContent={'space-between'}>
          <SkeletonText w="30%" noOfLines={1} />
          <HStack>
            <Skeleton height={9} width={14} />
            <Skeleton height={9} width={14} />
            <Skeleton height={9} width={14} />
          </HStack>
        </HStack>
        <SkeletonText w="full" noOfLines={2} />
        <Skeleton height={3} width={'100%'} />
      </VStack>
      <Section title="My Progress Today" icon={<GaugeIcon />}>
        <VStack w="full" spacing={4} p={3} minH={24} borderRadius="md" bg={colors.backgroundDark} alignItems={'flex-start'}>
          <SkeletonText w="30%" noOfLines={1} />
          <Skeleton width={'100%'} height={3} borderRadius={'md'} />
          <SkeletonText w="70%" noOfLines={1} />
        </VStack>
      </Section>
      <Section title="My Weekly Activity" icon={<CalendarIcon />}>
        <HStack w="full" spacing={4} p={3} borderRadius="md" bg={colors.backgroundDark} justifyContent={'space-between'}>
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton width={'100%'} h={8} w={8} borderRadius={'sm'} key={index} />
          ))}
        </HStack>
      </Section>
      <Section title="Prize Tiers" icon={<GiftIcon />}>
        <Box w="full" p={3} borderRadius="md" bg={colors.backgroundDark}>
          <SkeletonText noOfLines={10} />
        </Box>
      </Section>
      <Section title="Raffle Details" icon={<TicketIcon />}>
        <Box w="full" p={3} borderRadius="md" bg={colors.backgroundDark}>
          <SkeletonText noOfLines={10} />
        </Box>
      </Section>
    </VStack>
  )
}
