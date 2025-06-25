import { useState } from 'react'
import { Button, Checkbox, Text, Flex, Modal, ModalOverlay, ModalContent, ModalBody, ModalFooter } from '@chakra-ui/react'
import { DialogProps, ThirdPartyWarningDialogProps } from '@/constants/dialogs'
import CircleWarning from '@/icons/misc/CircleWarning'
import { colors } from '@/theme/cssVariables'

const THIRD_PARTY_WARNING_DISMISSED_KEY = '_r_third_party_warning_dismissed_'

export const ThirdPartyWarningDialog = ({ setIsOpen, url }: DialogProps<ThirdPartyWarningDialogProps>) => {
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false)

  const handleContinue = () => {
    if (dontShowAgain) {
      localStorage.setItem(THIRD_PARTY_WARNING_DISMISSED_KEY, 'true')
    }
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    setIsOpen(false)
  }
  return (
    <Modal isOpen onClose={() => setIsOpen(false)} isCentered={true}>
      <ModalOverlay />
      <ModalContent
        background={colors.backgroundLight}
        border={`1px solid ${colors.buttonSolidText}`}
        boxShadow=" 0px 8px 48px 0px #4F53F31A;"
        p={4}
        borderRadius="20px"
        width="414px"
        maxWidth="414px"
      >
        <ModalBody>
          <Flex direction="column" alignItems="center" justifyContent="center" mt={6}>
            <CircleWarning width="32px" height="32px" />
            <Text fontSize="xl" fontWeight="medium" textAlign="center" lineHeight="26px" mt={4} mb={5}>
              Third-party website warning
            </Text>
            <Text textAlign="center" color={colors.lightPurple} lineHeight="20px" mb={6}>
              You are being redirected to a third-party website outside of Raydium.
            </Text>
            <Text fontWeight="bold" color={colors.semanticWarning}>
              Be extremely cautious of scams!
            </Text>
            <Text textAlign="center" color={colors.lightPurple} lineHeight="20px" mb={8}>
              Never share personal info, download content, connect your wallet or confirm transactions.
            </Text>
            <Flex alignItems="center" mb={4} alignSelf="flex-start">
              <Checkbox isChecked={dontShowAgain} onChange={(e) => setDontShowAgain(e.target.checked)}>
                <Text fontSize="sm" color={colors.lightPurple}>
                  {"Don't show again"}
                </Text>
              </Checkbox>
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter gap={1} flexDirection="column">
          <Button width="100%" height="3rem" lineHeight="24px" onClick={handleContinue}>
            Continue
          </Button>
          <Button width="100%" height="3rem" variant="ghost" lineHeight="24px" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
