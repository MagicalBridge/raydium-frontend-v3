import { cloneElement, Fragment, ReactNode } from 'react'
import {
  Box,
  Button,
  Grid,
  MenuDivider,
  SystemStyleObject,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuGroup,
  MenuItem,
  PlacementWithLogical
} from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import ChevronUpIcon from '@/icons/misc/ChevronUpIcon'

type MenuConfig<
  MenuItemValue extends string | number,
  MenuGroupValue extends string | number,
  MenuItemTypes extends string | number = string | number
> = MenuGroup<MenuItemValue, MenuGroupValue, MenuItemTypes>[]

type MenuGroup<
  MenuItemValue extends string | number,
  MenuGroupValue extends string | number,
  MenuItemTypes extends string | number = string | number
> = {
  group: MenuGroupValue
  groupLabel?: ReactNode
  items: MenuItem<MenuItemValue, MenuItemTypes>[]
}

export type MenuItem<MenuItemValue, MenuItemTypes = string> = {
  type?: MenuItemTypes
  value: MenuItemValue

  slotBefore?: ReactNode
  label: ReactNode
  labelRight?: ReactNode
  slotAfter?: ReactNode
  slotCustomContent?: ReactNode

  onSelect?: (key: MenuItemValue) => void
  onClick?: () => void

  disabled?: boolean
}

type ElementProps<MenuItemValue extends string | number, MenuGroupValue extends string | number> = {
  disabled?: boolean
  items: MenuConfig<MenuItemValue, MenuGroupValue>
  value?: MenuItemValue
  onValueChange?: (value: MenuItemValue) => void
  children?: ReactNode
  slotTrigger?: JSX.Element
  placement?: PlacementWithLogical
  offset?: [number, number]
  matchWidth?: boolean
}

export const DropdownSelectMenu = <MenuItemValue extends string | number, MenuGroupValue extends string | number>({
  items,
  value,
  onValueChange,
  slotTrigger,
  placement,
  offset,
  matchWidth = true,
  children = (() => {
    let currentItem: MenuItem<MenuItemValue> | undefined

    for (const group of items) {
      const foundItem = group.items.find((item) => item.value === value)
      if (foundItem) {
        currentItem = foundItem as MenuItem<MenuItemValue>
        break
      }
    }

    return (
      <>
        {currentItem?.slotBefore}
        <Text as="span" display="inline-flex" alignItems="center" gap="0.5rem" minWidth="max-content" flex={1}>
          {currentItem?.label ?? value}
        </Text>
      </>
    )
  })(),
  triggerSx,
  popoverSx,

  disabled
}: ElementProps<MenuItemValue, MenuGroupValue> & {
  triggerSx?: SystemStyleObject
  popoverSx?: SystemStyleObject
}) => {
  return (
    <Menu isLazy placement={placement} offset={offset} matchWidth={matchWidth}>
      {({ isOpen }) => (
        <>
          <MenuButton
            as={Button}
            disabled={disabled}
            aria-label="Options"
            rightIcon={
              isOpen ? (
                <Box>
                  <ChevronUpIcon width="16px" height="16px" />
                </Box>
              ) : (
                <Box>
                  <ChevronDownIcon width="16px" height="16px" />
                </Box>
              )
            }
            _active={{
              opacity: 1
            }}
            sx={triggerSx}
          >
            {slotTrigger ? cloneElement(slotTrigger, { children }) : children}
          </MenuButton>
          <MenuList minWidth={0} py={0} sx={popoverSx}>
            {items.map((group, groupIndex) => (
              <Fragment key={group.group}>
                <MenuGroup
                  title={typeof group.groupLabel === 'string' ? group.groupLabel : undefined}
                  color={colors.lightPurple}
                  fontWeight="normal"
                  mx={3}
                  my={0}
                >
                  {typeof group.groupLabel !== 'string' && group.groupLabel}
                  {group.items.map((item) => (
                    <Fragment key={item.value}>
                      <MenuItem
                        value={item.value}
                        disabled={item.disabled}
                        onClick={onValueChange && !item.disabled ? () => onValueChange(item.value) : () => item.onSelect?.(item.value)}
                        justifyContent="center"
                      >
                        {item.slotBefore}
                        {item.slotCustomContent ?? (
                          <Grid gridAutoFlow="row" minWidth={0} flex={1}>
                            <Text as="span" display="inline-flex" alignItems="center" gap="0.5rem" minWidth="max-content">
                              {typeof item.label === 'string' ? `${item.label}` : item.label}
                            </Text>
                          </Grid>
                        )}
                        {item.slotAfter}
                      </MenuItem>
                    </Fragment>
                  ))}
                </MenuGroup>
                {groupIndex < items.length - 1 && <MenuDivider />}
              </Fragment>
            ))}
          </MenuList>
        </>
      )}
    </Menu>
  )
}
