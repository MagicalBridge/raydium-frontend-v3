import React, { memo } from 'react'
import { Flex, Progress, useColorMode, SystemStyleObject } from '@chakra-ui/react'

const SEGMENT_WIDTH = 100 / 3

const ThreeStageProgress = ({ percent = 0, sx }: { percent: number; sx?: SystemStyleObject }) => {
  const normalizedPercent = Math.min(100, Math.max(0, percent))
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'

  const calculateSegmentValue = (segmentIndex: number) => {
    const segmentThreshold = (segmentIndex + 1) * SEGMENT_WIDTH
    const segmentStart = segmentIndex * SEGMENT_WIDTH

    if (normalizedPercent >= segmentThreshold) {
      return 100
    } else if (normalizedPercent <= segmentStart) {
      return 0
    } else {
      return ((normalizedPercent - segmentStart) / SEGMENT_WIDTH) * 100
    }
  }

  return (
    <Flex width="100%" sx={sx}>
      <Progress
        value={calculateSegmentValue(0)}
        width={`${SEGMENT_WIDTH}%`}
        height="8px"
        background={isLight ? '#BFD2FF' : '#ABC4FF1F'}
        borderRadius={0}
        borderLeftRadius="4px"
        clipPath="polygon(0% 0%, calc(100% - 3.5px) 0%, 100% 47%,100% 53%, calc(100% - 3.5px) 100%, 0% 100%)"
        sx={{
          '--filled-progress-bg': isLight
            ? calculateSegmentValue(1) > 0
              ? 'linear-gradient(244.41deg, #2C72FC 8.17%, #38CDD9 101.65%)'
              : 'linear-gradient(244.41deg, #7748FC 8.17%, #39D0D8 101.65%)'
            : calculateSegmentValue(1) > 0
            ? 'linear-gradient(244.41deg, #F0BE30 8.17%, #D3D839 101.65%)'
            : 'linear-gradient(244.41deg, #7748FC 8.17%, #39D0D8 101.65%)'
        }}
      />
      <Progress
        value={calculateSegmentValue(1)}
        width={`${SEGMENT_WIDTH}%`}
        height="8px"
        background={isLight ? '#BFD2FF' : '#ABC4FF1F'}
        borderRadius={0}
        borderRightRadius="4px"
        clipPath="polygon(0% 0%, calc(100% - 3.5px) 0%, 100% 50%, calc(100% - 3.5px) 100%, 0% 100%, 3.5px 50%)"
        sx={{
          '--filled-progress-bg': isLight
            ? 'linear-gradient(245.22deg, #3C64FD 7.97%, #824CF7 39.94%, #2C72FC 92.1%)'
            : 'linear-gradient(245.22deg, #FE8B59 7.97%, #F8B72D 39.94%, #F0BE30 92.1%)'
        }}
      />
      <Progress
        value={calculateSegmentValue(2)}
        width={`${SEGMENT_WIDTH}%`}
        height="8px"
        background={isLight ? '#BFD2FF' : '#ABC4FF1F'}
        borderRadius={0}
        borderRightRadius="4px"
        clipPath="polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 5px 50%)"
        sx={{
          '--filled-progress-bg': isLight
            ? 'linear-gradient(245.22deg, #D72FEF 7.97%, #3C64FD 92.1%)'
            : 'linear-gradient(245.22deg, #FF2FC8 7.97%, #FE8B59 92.1%)'
        }}
      />
    </Flex>
  )
}

export default memo(ThreeStageProgress)
