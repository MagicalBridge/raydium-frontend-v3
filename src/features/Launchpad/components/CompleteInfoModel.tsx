import { Modal, ModalOverlay, ModalContent, ModalBody, ModalFooter, Flex, Text, Button } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { colors } from '@/theme/cssVariables'
import CircleWarning from '@/icons/misc/CircleWarning'

interface Props {
  isOpen?: boolean
  onClose?: () => void
}

export default function ({ isOpen = false, onClose = () => {} }: Props) {
  const { t } = useTranslation()
  return (
    <Modal size="md" isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody p="4">
          <Flex flexDirection="column" alignItems="center">
            <CircleWarning width={32} height={32} color={colors.semanticError} />
            <Text mt="2" color={colors.textSecondary}>
              You must complete all required info before your token can be created.
            </Text>
          </Flex>
        </ModalBody>
        <ModalFooter mb="3">
          <Button w="100%" mr={3} onClick={onClose}>
            {t('button.ok')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
