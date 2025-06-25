import { DrawerContent, DrawerOverlay, Text, Drawer, DrawerCloseButton, DrawerHeader, DrawerBody, VStack, HStack } from '@chakra-ui/react'
import { useState } from 'react'
import Tabs from '@/components/Tabs'
import TorqueClaimRewards from './TorqueClaimRewards'
import GiftIcon from '@/icons/misc/Gift'
import { TorqueCampaign } from '../types'
import TorqueLeaderboard from './TorqueLeaderboard'
import LeaderboardIcon from '@/icons/misc/Leaderboard'
import { useTorqueLeaderboard } from '../hooks/useTorqueLeaderboard'
import TicketIcon from '@/icons/misc/TicketIcon'
import TorqueRaffle from './TorqueRaffle'
import { useTorqueRaffle } from '../hooks/useTorqueRaffle'

interface Props {
  isOpen: boolean
  onClose: () => void
  handleClaimOffer: (offerId: string) => void
  campaignsLoading: boolean
  campaignsError: string | null
  campaigns: TorqueCampaign[]
}

const TABS = ['Raffle', 'Leaderboard', 'Claim'] as const
type TabEnum = typeof TABS[number]

export default function TorqueDrawer({ isOpen, onClose, handleClaimOffer, campaignsLoading, campaignsError, campaigns }: Props) {
  const [selectedTab, setSelectedTab] = useState<TabEnum>('Raffle')
  const {
    leaderboard,
    loading: leaderboardLoading,
    error: leaderboardError,
    lastUpdated,
    refetching: leaderboardRefetching
  } = useTorqueLeaderboard()
  const { raffle, loading: raffleLoading, error: raffleError, refetching: raffleRefetching } = useTorqueRaffle()

  return (
    <Wrapper isOpen={isOpen} onClose={onClose} setSelectedTab={setSelectedTab} selectedTab={selectedTab}>
      {selectedTab === 'Leaderboard' && (
        <TorqueLeaderboard
          leaderboard={leaderboard}
          loading={leaderboardLoading}
          error={leaderboardError}
          lastUpdated={lastUpdated}
          refetching={leaderboardRefetching}
        />
      )}
      {selectedTab === 'Claim' && (
        <TorqueClaimRewards claimOffer={handleClaimOffer} campaigns={campaigns} loading={campaignsLoading} error={campaignsError} />
      )}
      {selectedTab === 'Raffle' && (
        <TorqueRaffle raffle={raffle} loading={raffleLoading} error={raffleError} refetching={raffleRefetching} />
      )}
    </Wrapper>
  )
}

function Wrapper({
  children,
  isOpen,
  onClose,
  setSelectedTab,
  selectedTab
}: {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  setSelectedTab: (tab: TabEnum) => void
  selectedTab: TabEnum
}) {
  return (
    <Drawer variant="flatScreenEdgePanel" size="sm" isOpen={isOpen} onClose={onClose} trapFocus={false}>
      <DrawerOverlay />
      <DrawerContent pt={1}>
        {/* Drawer header */}
        <DrawerCloseButton top={['16px', '20px']} />
        <DrawerHeader>Rewards</DrawerHeader>

        {/* Drawer body */}
        <DrawerBody pt={[2, 2, 3, 3]}>
          <VStack gap={6} p={0} w="full" align="flex-start">
            <Tabs
              items={TABS}
              onChange={(value) => setSelectedTab(value as TabEnum)}
              variant="square"
              value={selectedTab}
              renderItem={(item) => (
                <HStack gap={1}>
                  {item === 'Claim' && <GiftIcon />}
                  {item === 'Leaderboard' && <LeaderboardIcon />}
                  {item === 'Raffle' && <TicketIcon />}
                  <Text>{item}</Text>
                </HStack>
              )}
            />
            {children}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
