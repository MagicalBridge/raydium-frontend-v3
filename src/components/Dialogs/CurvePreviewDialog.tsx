import { Box, Drawer, DrawerBody, DrawerContent, DrawerOverlay, Link, Grid, Text, Flex } from '@chakra-ui/react'
import { Info } from 'react-feather'
import { DialogProps, CurvePreviewDialogProps } from '@/constants/dialogs'
import { colors } from '@/theme/cssVariables/colors'
import CurvePreviewIcon from '@/icons/misc/CurvePreviewIcon'
import { CurveAreaChart } from '@/features/Launchpad/components/Charts/CurveAreaChart'

export const CurvePreviewDialog = ({ setIsOpen, data }: DialogProps<CurvePreviewDialogProps>) => {
  return (
    <Drawer isOpen onClose={() => setIsOpen(false)} placement="bottom">
      <DrawerOverlay />
      <DrawerContent borderBottomRadius={0}>
        <DrawerBody px={3} py={0} borderTopRadius="24px" border="1px solid #BFD2FF80">
          <Box bg={colors.backgroundLight} pt={4} pb={5}>
            <Box width={16} height={1} borderRadius="4px" background="rgba(191, 210, 255, 0.5)" margin="auto"></Box>
            <Flex justifySelf="center" alignItems="center" gap="6px" mt={4} mb={3}>
              <Text fontSize="sm" fontWeight="medium" color={colors.lightPurple}>
                Curve Preview
              </Text>
              <CurvePreviewIcon />
            </Flex>
            <CurveAreaChart data={data} isLoading={false} />
            <Text color={colors.lightPurple} fontSize="'2xs'" opacity={0.5} textAlign="center" mt={3} mb={4}>
              Token Supply
            </Text>
            <Grid templateColumns="repeat(2, 150px)" justifyContent="center" columnGap={7} rowGap={1} fontSize="2xs">
              <Flex justifyContent="space-between">
                <Flex alignItems="center">
                  <Box width="8px" height="8px" borderRadius="50%" bg="white" mr={2} />
                  <Text color={colors.lightPurple}>Starting MC</Text>
                </Flex>
                <Text color={colors.lightPurple}>$100.00</Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Flex alignItems="center">
                  <Box width="8px" height="8px" borderRadius="50%" bg="#22D1F8" mr={2} />
                  <Text color={colors.lightPurple}>Migration MC</Text>
                </Flex>
                <Text color={colors.lightPurple}>$100,000.00</Text>
              </Flex>
            </Grid>
            <Box mx={6} mt={4}>
              <Flex alignItems="center" mb={2}>
                <Box mr={2}>
                  <Info size={16} color={colors.lightPurple} />
                </Box>
                <Text color={colors.lightPurple} fontSize="sm" fontWeight="medium">
                  Please Note
                </Text>
              </Flex>
              <Text color="#C4D6FF80" fontSize="sm">
                This tool is for advanced users. Before changing launch parameters, make sure to go through the{' '}
                <Link color="#22D1F8" href="#" textDecoration="underline">
                  detailed guide
                </Link>
                .
              </Text>
            </Box>
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
