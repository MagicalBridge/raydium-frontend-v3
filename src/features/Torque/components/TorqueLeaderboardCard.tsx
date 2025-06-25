import { colors } from '@/theme/cssVariables'
import { TorqueLeaderboardPosition } from '../types'
import { Text, Flex, HStack, VStack, Badge, Tooltip, Skeleton, SkeletonText } from '@chakra-ui/react'
import { useMemo } from 'react'

interface TorqueLeaderboardCardProps extends TorqueLeaderboardPosition {
  isCurrentUser: boolean
}

const truncateAddress = (address: string) => {
  if (address.length <= 8) return address
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export default function TorqueLeaderboardCard({ rank, wallet, amount, isCurrentUser, reward }: TorqueLeaderboardCardProps) {
  const { rankColor, borderColor } = useMemo(() => {
    let rankColor

    switch (rank) {
      case 1:
        rankColor = '#d4af37'
        break
      case 2:
        rankColor = '#c0c0c0'
        break
      case 3:
        rankColor = '#cd7f32'
        break
      default:
        rankColor = colors.primary
    }

    if (isCurrentUser) {
      return { rankColor, borderColor: rankColor }
    }

    return { rankColor, borderColor: 'transparent' }
  }, [isCurrentUser, rank])

  return (
    <HStack w="full" spacing={4} p={3} borderRadius="md" bg={colors.backgroundDark} border={'solid 1px'} borderColor={borderColor}>
      <Flex w={12} h={12} sx={{ aspectRatio: '1/1' }} justify="center" align="center" bg={colors.backgroundMedium} borderRadius="md">
        <Text fontSize="sm" color={rankColor} fontWeight="bold">
          #{rank}
        </Text>
      </Flex>
      <VStack w="full" align="flex-start">
        <HStack justifyContent={'space-between'} w="full">
          <Text fontSize="sm" color={colors.textPrimary} fontWeight="bold">
            {truncateAddress(wallet)}
          </Text>

          <Tooltip label="The amount of rewards you'd get if you were in this position.">
            <Badge variant="crooked">{reward ?? '???'}</Badge>
          </Tooltip>
        </HStack>
        <HStack>
          <Text fontSize="xs" w="full" color={colors.textTertiary}>
            {amount} Points
          </Text>
        </HStack>
      </VStack>
    </HStack>
  )
}

export function TorqueLeaderboardCardSkeleton() {
  return (
    <HStack w="full" spacing={4} p={3} borderRadius="md" bg={colors.backgroundDark}>
      <Skeleton w={12} h={12} sx={{ aspectRatio: '1/1' }} borderRadius="md" />
      <VStack w="full" align="flex-start">
        <HStack justifyContent={'space-between'} w="full">
          <Skeleton w="55%" h={5} />
          <Skeleton h={5} w={10} />
        </HStack>
        <SkeletonText w="full" noOfLines={2} />
      </VStack>
    </HStack>
  )
}
