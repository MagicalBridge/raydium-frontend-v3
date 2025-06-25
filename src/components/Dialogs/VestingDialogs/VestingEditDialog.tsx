import { useState, useCallback, useEffect } from 'react'
import { DialogProps, VestingEditDialogProps } from '@/constants/dialogs'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Tooltip,
  Flex,
  Grid,
  Input,
  InputProps
} from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'
import { HelpCircle, PlusCircle, MinusCircle } from 'react-feather'
import { shortenAddress, isValidAddress } from '@/utils/token'

type WalletEntry = {
  id: string
  address: string
  amount: string
}

export const VestingEditDialog = ({ setIsOpen, remainingAmount, save }: DialogProps<VestingEditDialogProps>) => {
  // TODO: HelpCircle tooltip text

  const [walletEntries, setWalletEntries] = useState<WalletEntry[]>([{ id: crypto.randomUUID(), address: '', amount: '' }])

  const addWalletEntry = useCallback(() => {
    setWalletEntries((prev) => [...prev, { id: crypto.randomUUID(), address: '', amount: '' }])
  }, [])

  const removeWalletEntry = useCallback((id: string) => {
    setWalletEntries((prev) => prev.filter((entry) => entry.id !== id))
  }, [])

  const updateWalletEntry = useCallback((id: string, field: keyof Omit<WalletEntry, 'id'>, value: string) => {
    setWalletEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }, [])

  const handleSave = useCallback(() => {
    const validData = walletEntries.filter((entry) => entry.address.trim() !== '' && entry.amount.trim() !== '')
    console.log(validData, 'validData')
    save()
  }, [walletEntries, save])

  return (
    <Modal isOpen onClose={() => setIsOpen(false)} isCentered={true}>
      <ModalOverlay />
      <ModalContent
        background={colors.backgroundLight}
        border={`1px solid ${colors.buttonSolidText}`}
        boxShadow=" 0px 8px 48px 0px #4F53F31A;"
        p={4}
        borderRadius="20px"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="medium">
            Edit vesting wallet address
          </Text>
          <ModalCloseButton position="static" />
        </Flex>
        <ModalBody>
          <Text fontSize="sm" color={colors.lightPurple} my={6}>
            Set a wallet address to receive vesting tokens. This can be modified at anytime.
          </Text>
          <Flex alignItems="center" gap={1} mb={3}>
            <Text color={colors.lightPurple} fontWeight="medium">
              Wallet address
            </Text>
            <Tooltip hasArrow placement="top" label={''}>
              <HelpCircle size={12} color={colors.lightPurple} />
            </Tooltip>
          </Flex>
          {walletEntries.map((entry, index) => (
            <Grid key={entry.id} gridTemplateColumns="minmax(0, 1fr) minmax(0, 1fr)" gap={3} mb={3}>
              <CryptoAddressInput
                name={`address-${entry.id}`}
                value={entry.address}
                onChange={(value) => updateWalletEntry(entry.id, 'address', value)}
                width="100%"
                height="3.75rem"
                background={colors.backgroundDark}
                borderRadius="12px"
                fontSize="xl"
                color={colors.lightPurple}
                placeholder={`address ${index + 1}`}
                aria-label={`Wallet address ${index + 1}`}
              />
              <Flex alignItems="center" gap={3}>
                <Input
                  name={`amount-${entry.id}`}
                  placeholder="amount"
                  value={entry.amount}
                  onChange={(e) => updateWalletEntry(entry.id, 'amount', e.target.value)}
                  width="100%"
                  height="3.75rem"
                  background={colors.backgroundDark}
                  borderRadius="12px"
                  fontSize="xl"
                  color={colors.lightPurple}
                  aria-label={`Amount for wallet ${index + 1}`}
                />
                {index === 0 ? (
                  <PlusCircle
                    color={colors.textLink}
                    width="24px"
                    height="24px"
                    cursor="pointer"
                    onClick={addWalletEntry}
                    aria-label="Add wallet address"
                    role="button"
                  />
                ) : (
                  <MinusCircle
                    color={colors.textLink}
                    width="24px"
                    height="24px"
                    cursor="pointer"
                    onClick={() => removeWalletEntry(entry.id)}
                    aria-label="Remove wallet address"
                    role="button"
                  />
                )}
              </Flex>
            </Grid>
          ))}
          <Text color={colors.lightPurple} fontSize="sm" mb={10}>
            Remaining amount: ${remainingAmount}
          </Text>
        </ModalBody>
        <ModalFooter gap={1} flexDirection="column">
          <Button width="100%" height="3rem" lineHeight="24px" onClick={handleSave}>
            Save
          </Button>
          <Button width="100%" height="3rem" variant="ghost" lineHeight="24px" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

interface CryptoAddressInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void
}

const CryptoAddressInput = ({ value, onChange, ...props }: CryptoAddressInputProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    setDisplayValue(isFocused || !value || !isValidAddress(value) ? value : shortenAddress(value))
  }, [value, isFocused])

  return (
    <Tooltip portalProps={{ appendToParentPortal: true }} hasArrow placement="top" label={value}>
      <Input
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
    </Tooltip>
  )
}
