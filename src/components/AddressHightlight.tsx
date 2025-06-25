import { useState, createContext, useContext, ReactNode } from 'react'
import { Text, SystemStyleObject } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'
import { encodeStr } from '@/utils/common'

const AddressContext = createContext<{
  highlightAddress: string
  setHighlightAddress: (address: string) => void
}>({
  highlightAddress: '',
  setHighlightAddress: (address) => {}
})

export const AddressProvider = ({ children }: { children: ReactNode }) => {
  const [highlightAddress, setHighlightAddress] = useState('')

  return (
    <AddressContext.Provider
      value={{
        highlightAddress,
        setHighlightAddress
      }}
    >
      {children}
    </AddressContext.Provider>
  )
}

export const AddressHightlight = ({ address, sx }: { address: string; sx?: SystemStyleObject }) => {
  const { highlightAddress, setHighlightAddress } = useContext(AddressContext)

  const isHighlighted = highlightAddress === address

  const highlightStyles = isHighlighted
    ? {
        background: colors.buttonSecondary,
        border: `1px dashed ${colors.cardBorder01}`,
        borderRadius: 'md',
        px: 1,
        mx: -1
      }
    : {
        border: '1px solid transparent'
      }

  return (
    <Text sx={{ ...highlightStyles, ...sx }} onMouseEnter={() => setHighlightAddress(address)} onMouseLeave={() => setHighlightAddress('')}>
      {encodeStr(address, 5, 3)}
    </Text>
  )
}
