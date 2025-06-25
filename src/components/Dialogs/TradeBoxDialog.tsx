import { Drawer, DrawerBody, DrawerContent, DrawerOverlay, Button, Flex } from '@chakra-ui/react'
import { DialogProps, TradeBoxDialogProps } from '@/constants/dialogs'
import TradeBox from '@/features/Launchpad/components/TradeBox'

export const TradeBoxDialog = ({
  setIsOpen,
  poolInfo,
  mintInfo,
  mintBInfo,
  configInfo,
  onChain,
  isMigrating,
  isLanded
}: DialogProps<TradeBoxDialogProps>) => {
  return (
    <Drawer isOpen onClose={() => setIsOpen(false)} placement="bottom">
      <DrawerOverlay />
      <DrawerContent borderBottomRadius={0}>
        <DrawerBody px={3} pt={3} pb={0}>
          <Flex p={0} direction="column">
            <TradeBox
              poolInfo={poolInfo}
              mintInfo={mintInfo}
              mintBInfo={mintBInfo}
              configInfo={configInfo}
              onChain={!!onChain}
              isMigrating={isMigrating}
              isLanded={isLanded}
            />
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
