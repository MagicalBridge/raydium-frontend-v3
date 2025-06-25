import React, { memo, Suspense, ReactNode } from 'react'
import { Box, Button, Flex, Skeleton } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'

interface Meta {
  word: string
  word_with_strength: ReactNode
}

interface MetasContentProps {
  onMetaSelected: (word: string) => void
  activeMeta: string | null
  metas: Meta[] | null
}

export const MetasList = memo(({ onMetaSelected, activeMeta, metas }: MetasContentProps) => {
  return (
    <Suspense
      fallback={
        <Flex alignItems="center">
          <Flex gap="2">
            {Array(5)
              .fill(undefined)
              .map((_, index) => (
                <Skeleton key={index} width={20} height="38px" borderRadius="8px" bg="#ABC4FF1F" />
              ))}
          </Flex>
        </Flex>
      }
    >
      <MetasContent onMetaSelected={onMetaSelected} activeMeta={activeMeta} metas={metas} />
    </Suspense>
  )
})

const MetasContent = memo(({ onMetaSelected, activeMeta, metas }: MetasContentProps) => {
  return (
    <Flex alignItems="center">
      <Box
        overflowX="auto"
        flex="1"
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none'
        }}
      >
        <Flex gap={3} width="fit-content">
          {metas && metas.map
            ? metas.map((meta) => {
                const isActive = activeMeta === meta.word
                return (
                  <Button
                    key={meta.word}
                    minWidth={['40px', 'auto']}
                    onClick={() => onMetaSelected(isActive ? '' : meta.word)}
                    display="flex"
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
                    bg={isActive ? colors.buttonPrimary : '#ABC4FF1F'}
                    color={isActive ? colors.buttonSolidText : colors.lightPurple}
                    _hover={{
                      bg: isActive ? colors.buttonPrimary : '#374151'
                    }}
                    transitionProperty="color,background-color,border-color,text-decoration-color,fill,stroke"
                    transitionTimingFunction="cubic-bezier(.4,0,.2,1)"
                    transitionDuration=".15s"
                  >
                    {meta.word_with_strength}
                  </Button>
                )
              })
            : null}
        </Flex>
      </Box>
    </Flex>
  )
})
