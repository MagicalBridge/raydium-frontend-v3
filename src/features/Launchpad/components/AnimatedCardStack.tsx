import { useEffect, useRef, useMemo } from 'react'
import { Box, Flex, Skeleton, useColorMode } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { MintInfo } from '@/features/Launchpad/type'
import { colors } from '@/theme/cssVariables/colors'

const MotionBox = motion(Box)

export const AnimatedCardStack = ({
  items,
  isLoading = false,
  isRightAligned,
  renderItem
}: {
  items: (MintInfo | null)[]
  isLoading: boolean
  isRightAligned?: boolean
  renderItem: (item: MintInfo, index: number) => React.ReactNode
}) => {
  const OFFSET_X = 30
  const OFFSET_Y = -15
  const BASE_WIDTH = 300
  const WIDTH_INCREMENT = 50
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'

  const getCardAnimationProps = useMemo(
    () => (index: number, isNew: boolean) => {
      if (isNew) {
        return {
          initial: {
            opacity: 0,
            scale: 1.4,
            x: 0,
            y: 0
          },
          animate: {
            opacity: 1,
            scale: 1,
            x: (isRightAligned ? -1 : 1) * index * OFFSET_X,
            y: index * OFFSET_Y
          }
        }
      }

      return {
        initial: undefined,
        animate: {
          opacity: index === 0 ? 1 : index === 1 ? 0.8 : index === 2 ? 0.6 : 0,
          scale: 1,
          x: (isRightAligned ? -1 : 1) * index * OFFSET_X,
          y: index * OFFSET_Y
        }
      }
    },
    [isRightAligned]
  )

  const existingCards = useRef(new Set<string>())

  useEffect(() => {
    return () => {
      existingCards.current.clear()
    }
  }, [])

  return isLoading ? (
    <Flex
      width={[0, '12.5rem', '21.875rem']}
      height="6.75rem"
      direction="column"
      borderRadius="8px"
      cursor="wait"
      sx={{
        contentVisibility: 'auto',
        containIntrinsicWidth: 'auto',
        containIntrinsicHeight: `auto 6.75rem`,
        minHeight: `6.75rem`
      }}
    >
      <Skeleton height="3.75rem" width="100%" borderRadius="8px" />
      <Skeleton height="1.25rem" width="80%" mx="auto" borderRadius="8px" />
      <Skeleton height="1.25rem" width="60%" mx="auto" borderRadius="8px" />
    </Flex>
  ) : (
    <Box width={[0, '12.5rem', '21.875rem']} height="6.75rem" position="relative" sx={{ perspective: '100px' }}>
      <AnimatePresence
        mode="popLayout"
        onExitComplete={() => {
          existingCards.current = new Set(Array.from(existingCards.current).filter((mint) => items.some((item) => item?.mint === mint)))
        }}
      >
        {items.map(
          (item, index) =>
            item && (
              <MotionBox
                key={item.mint}
                position="absolute"
                {...(isRightAligned ? { right: 0 } : {})}
                top={`${index * 40}px`}
                zIndex={items.length - index}
                {...getCardAnimationProps(index, !existingCards.current.has(item.mint))}
                exit={{
                  opacity: 0,
                  scale: 1,
                  x: (isRightAligned ? -1 : 1) * 4 * OFFSET_X,
                  y: 4 * OFFSET_Y
                }}
                transition={{
                  duration: 2,
                  ease: [0.4, 0, 0.2, 1],
                  layout: {
                    duration: 1,
                    ease: [0.4, 0, 0.2, 1]
                  }
                }}
                willChange="transform, opacity"
                layout
                onLayoutAnimationComplete={() => {
                  existingCards.current.add(item.mint)
                }}
              >
                <Flex
                  borderRadius="8px"
                  background={colors.cardStackBg}
                  p={2}
                  justifyContent="space-between"
                  alignItems="center"
                  width={[
                    0,
                    BASE_WIDTH - 150 + (items.length - 1 - index) * WIDTH_INCREMENT,
                    BASE_WIDTH + (items.length - 1 - index) * WIDTH_INCREMENT
                  ]}
                  // width={index === 0 ? '350px' : index === 1 ? '315px' : '255px'}
                  opacity={1 - 0.2 * index}
                  border={`0.9px solid ${index === 0 || isLight ? 'transparent' : '#ABC4FF1A'}`}
                  _before={
                    index === 0 || isLight
                      ? {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          borderRadius: '8px',
                          padding: '1px',
                          background: 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)',
                          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          maskComposite: 'exclude',
                          pointerEvents: 'none'
                        }
                      : {}
                  }
                >
                  {renderItem(item, index)}
                </Flex>
              </MotionBox>
            )
        )}
      </AnimatePresence>
    </Box>
  )
}
