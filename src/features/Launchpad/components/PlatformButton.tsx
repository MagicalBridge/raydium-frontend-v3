import { colors } from '@/theme/cssVariables'
import { Menu, MenuButton, MenuList, MenuItem, Button, Image, Flex } from '@chakra-ui/react'
import usePlatformList from '@/hooks/launchpad/usePlatformList'
import { useEffect, useMemo, useState } from 'react'
import useResponsive from '@/hooks/useResponsive'

export default function PlatformButton({ defaultValue, onChange }: { defaultValue?: string; onChange?: (val?: string) => void }) {
  const { isDesktopSmall, isDesktopMedium, isDesktopLarge } = useResponsive()
  const [selected, setSelected] = useState(defaultValue || 'PlatformWhiteList')
  const { data } = usePlatformList({})

  const selectedPlatform = useMemo(() => data.find((p) => p.pubKey === selected), [data, selected])

  useEffect(() => {
    onChange?.(selected)
  }, [selected, onChange])

  useEffect(() => {
    if (!data.length || !defaultValue) return
    if (!data.some((p) => p.pubKey === defaultValue) && defaultValue !== 'PlatformWhiteList') setSelected('PlatformWhiteList')
  }, [defaultValue, data])

  return (
    <Menu>
      <MenuButton
        ml="-1"
        display="flex"
        minWidth={['40px', 'fit-content']}
        height={['40px', '38px']}
        minHeight={['40px', '38px']}
        justifyContent="center"
        alignItems="center"
        gap="1"
        px={[2, 3, 3]}
        py={2}
        borderRadius="8px"
        transition="colors"
        whiteSpace="nowrap"
        fontSize="sm"
        bg={'#ABC4FF1F'}
        color={colors.lightPurple}
        _hover={{
          bg: '#374151'
        }}
        _active={{
          bg: colors.buttonPrimary,
          color: colors.buttonSolidText
        }}
        as={Button}
      >
        {selectedPlatform ? (
          <Flex>
            <Image boxSize="18px" borderRadius="full" src={selectedPlatform.img} alt={selectedPlatform.name} mr="2" />
            <span>{selectedPlatform.name}</span>
          </Flex>
        ) : isDesktopSmall || isDesktopMedium || isDesktopLarge ? (
          'Platforms 🌎'
        ) : (
          '🌎'
        )}
      </MenuButton>
      <MenuList>
        <MenuItem px="4" onClick={() => setSelected('PlatformWhiteList')}>
          🌎 &nbsp;&nbsp;All Platforms
        </MenuItem>
        {data.map((platform) => (
          <MenuItem px="4" key={platform.pubKey} onClick={() => setSelected(platform.pubKey)}>
            <Image boxSize="18px" borderRadius="full" src={platform.img} alt={platform.name} mr="2" />
            <span>{platform.name}</span>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}
