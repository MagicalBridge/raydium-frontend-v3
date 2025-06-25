import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { EmblaOptionsType } from 'embla-carousel'

export const TokenCarousel = ({
  gap = 12,
  children,
  emblaOptions
}: {
  gap?: number
  children: React.ReactNode
  emblaOptions?: EmblaOptionsType
}) => {
  const defaultOptions: EmblaOptionsType = {
    align: 'start',
    containScroll: 'keepSnaps',
    dragFree: false,
    loop: false,
    inViewThreshold: 0.5,
    skipSnaps: false,
    slidesToScroll: 'auto',
    direction: 'ltr'
  }

  const [emblaRef] = useEmblaCarousel({ ...defaultOptions, ...emblaOptions }, [WheelGesturesPlugin({ forceWheelAxis: 'x' })])

  return (
    <Box as="section" width="100%">
      <Box ref={emblaRef} className="embla" overflow="hidden">
        <Flex className="embla__container" ml={`-${gap / 2}px`}>
          {React.Children.map(children, (child, index) => (
            <Box className="embla__slide" key={index} flex="0 0 auto" minWidth={0} pl={`${gap / 2}px`} pr={`${gap / 2}px`}>
              {child}
            </Box>
          ))}
        </Flex>
      </Box>
    </Box>
  )
}
