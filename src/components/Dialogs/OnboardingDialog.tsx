import {
  Checkbox,
  Stepper,
  Step,
  StepIndicator,
  StepTitle,
  StepDescription,
  StepSeparator,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Grid,
  Text,
  Flex,
  useSteps,
  useColorMode
} from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'
import { useAppStore } from '@/store'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useEvent } from '@/hooks/useEvent'
import useWalletSign from '@/hooks/launchpad/useWalletSign'
import { useEffect, useState, useRef } from 'react'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { Subject } from 'rxjs'

export const onboardingDialogSubject = new Subject<{ open: boolean; successCbk?: () => void }>()

export const OnboardingDialog = () => {
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const connected = useAppStore((s) => s.connected)
  const [isOpen, setIsOpen] = useState(false)
  const { setVisible } = useWalletModal()
  const { useLedger, signVerifyMessage } = useWalletSign()
  const [isLedger, setIsLedger] = useState(false)
  const successCbkRef = useRef<(() => void) | undefined>()

  const steps = [
    { title: 'Connect Wallet', description: 'Connect Wallet to provide your address' },
    { title: 'Sign In', description: 'Confirm you are the owner of this wallet' }
  ]
  const { activeStep, getStatus, setActiveStep } = useSteps({
    index: connected ? 1 : 0,
    count: steps.length
  })

  useEffect(() => {
    const sub = onboardingDialogSubject.asObservable().subscribe((data) => {
      setIsOpen(data.open)
      successCbkRef.current = data.successCbk
    })

    return () => sub.unsubscribe()
  }, [])

  useEffect(() => {
    if (connected && activeStep < 1) {
      setActiveStep(1)
    }
  }, [connected, activeStep])

  useEffect(() => {
    setIsLedger(useLedger)
  }, [useLedger])

  const handleClick = useEvent(async () => {
    if (activeStep === 0) {
      setVisible(true)
      return
    }
    const result = await signVerifyMessage({ isLedger })
    if (result) {
      setActiveStep(2)
      toastSubject.next({ status: 'success', title: 'Sign In successfully' })
      setIsOpen(false)
      successCbkRef.current?.()
    }
  })

  return (
    <Modal motionPreset="none" isOpen={isOpen} onClose={() => setIsOpen(false)} isCentered={true}>
      <ModalOverlay />
      <ModalContent
        background={colors.backgroundLight}
        p={4}
        borderRadius="20px"
        width="500px"
        maxWidth="500px"
        sx={
          isLight
            ? {}
            : {
                border: '1px solid #0B1022',
                boxShadow: ' 0px 8px 48px 0px #4F53F31A'
              }
        }
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="medium">
            Connect wallet
          </Text>
          <ModalCloseButton position="static" />
        </Flex>
        <ModalBody mt={6}>
          <Text fontSize="sm" color={colors.lightPurple}>
            You will receive a signature request to confirm you are the owner of this wallet, and enable token minting, comment, etc.
          </Text>
          <Grid rowGap={4} my={7}>
            <Stepper
              index={activeStep}
              orientation="vertical"
              position="relative"
              height="10rem"
              background="#ABC4FF1F"
              borderRadius="12px"
              px={6}
              py={5}
              gap={0}
              sx={{
                '--stepper-indicator-size': '0.5rem',
                '.chakra-step__title': {
                  fontSize: 'sm'
                },
                '.chakra-step__description': {
                  color: colors.lightPurple
                },
                '.chakra-step__separator': {
                  background: 'transparent !important',
                  borderLeftStyle: 'dashed',
                  borderLeftWidth: '1px',
                  borderColor: colors.lightPurple,
                  opacity: 0.5,
                  maxHeight: '100% !important',
                  top: 'calc(var(--stepper-indicator-size) + 6px)'
                }
              }}
            >
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepIndicator
                    marginTop="6px"
                    borderWidth="0 !important"
                    background={getStatus(index) === 'complete' ? '#22D1F8' : '#7585aa'}
                  ></StepIndicator>
                  <Flex direction="column" gap={2} flexShrink="0">
                    <StepTitle>{step.title}</StepTitle>
                    <StepDescription>{step.description}</StepDescription>
                  </Flex>
                  <StepSeparator />
                </Step>
              ))}
            </Stepper>
            <Checkbox isChecked={isLedger} onChange={(e) => setIsLedger(e.target.checked)}>
              <Text fontSize="sm" color={colors.lightPurple}>
                Use ledger
              </Text>
            </Checkbox>
          </Grid>
        </ModalBody>
        <ModalFooter mt={4} gap={1} flexDirection="column">
          <Button width="100%" height="3rem" lineHeight="24px" onClick={handleClick}>
            {activeStep < 1 ? 'Connect Wallet' : 'Sign In'}
          </Button>
          <Button width="100%" height="3rem" variant="ghost" lineHeight="24px" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
