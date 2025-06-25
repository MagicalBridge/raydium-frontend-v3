import { Heading, Stack, Text, Spinner, VStack, HStack, Badge, Skeleton, SkeletonText } from '@chakra-ui/react'
import TorqueLeaderboardCard, { TorqueLeaderboardCardSkeleton } from './TorqueLeaderboardCard'
import { colors } from '@/theme/cssVariables'
import { useWallet } from '@solana/wallet-adapter-react'
import { TorqueCountdown } from './TorqueCountDown'
import LeaderboardIcon from '@/icons/misc/Leaderboard'
import MedalIcon from '@/icons/misc/Medal'
import { TorqueLeaderboard as TorqueLeaderboardType } from '../types'
import { displayNumber } from '../utils'
import { Dayjs } from 'dayjs'

interface TorqueLeaderboardProps {
  leaderboard?: TorqueLeaderboardType
  loading: boolean
  error: string | null
  lastUpdated: Dayjs
  refetching: boolean
}

export default function TorqueLeaderboard({ leaderboard, loading, error, lastUpdated, refetching }: TorqueLeaderboardProps) {
  const wallet = useWallet()

  if (loading || !leaderboard) {
    return (
      <Wrapper>
        <TorqueLeaderboardSkeleton />
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
            Unable to load leaderboard
          </Heading>
          <Text fontSize="sm" align="center">
            Looks like there was an error loading the leaderboard. Please try again later.
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
            {leaderboard?.name}
          </Heading>
          <Badge variant="crooked" fontSize={'md'}>
            {displayNumber(leaderboard?.totalRewards)} {leaderboard?.rewardDenomination}
          </Badge>
        </HStack>
        <Text fontSize="xs" w="full" color={colors.textTertiary}>
          {leaderboard?.description}
        </Text>
        <HStack w="full" justifyContent={'space-between'}>
          <Text fontSize="sm" w="full" color={colors.textPrimary}>
            Snapshot in:
          </Text>
          <TorqueCountdown date={leaderboard?.endTime} size="sm" />
        </HStack>
      </VStack>

      <Section title="Your Position" icon={<MedalIcon />}>
        {leaderboard.usersPositions ? (
          <TorqueLeaderboardCard {...leaderboard.usersPositions} isCurrentUser={true} />
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
            <Text textAlign="center">
              {wallet.publicKey
                ? "You're close, but not quite on the leaderboard yet."
                : 'Please connect your wallet to see your position.'}
            </Text>
          </Stack>
        )}
      </Section>
      <Section
        title="Leaderboard"
        icon={refetching ? <Spinner size="sm" /> : <LeaderboardIcon />}
        text={`Updated at: ${lastUpdated.format('h:mm A')}`}
      >
        {leaderboard.leaderboard.length > 0 ? (
          leaderboard.leaderboard.map((position) => (
            <TorqueLeaderboardCard
              key={position.rank}
              {...position}
              isCurrentUser={position.wallet === leaderboard.usersPositions?.wallet}
            />
          ))
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
            <Text textAlign="center">The leaderboard is being prepared. Please check back soon.</Text>
          </Stack>
        )}
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

function TorqueLeaderboardSkeleton() {
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
      </VStack>
      <Section title="Your Position" icon={<MedalIcon />}>
        <TorqueLeaderboardCardSkeleton />
      </Section>
      <Section title="Leaderboard" icon={<LeaderboardIcon />}>
        {Array.from({ length: 10 }).map((_, index) => (
          <TorqueLeaderboardCardSkeleton key={index} />
        ))}
      </Section>
    </VStack>
  )
}
