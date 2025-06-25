import { Box } from '@chakra-ui/react'
import { SvgIcon } from '../type'

export default function RefreshIcon(props: SvgIcon) {
  const { color = '#22D1F8' } = props
  return (
    <Box
      as="svg"
      width="28px"
      height="28px"
      viewBox="0 0 28 28"
      fill="none"
      {...props}
      className="chakra-icon"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1.1665 4.66602V11.666H8.1665" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M4.09484 17.5008C4.8513 19.6479 6.28506 21.491 8.1801 22.7524C10.0751 24.0138 12.3288 24.6252 14.6015 24.4944C16.8742 24.3636 19.0428 23.4977 20.7807 22.0272C22.5185 20.5567 23.7313 18.5613 24.2364 16.3416C24.7416 14.1219 24.5116 11.7981 23.5812 9.72045C22.6509 7.64279 21.0704 5.92376 19.0781 4.82239C17.0858 3.72103 14.7896 3.29698 12.5353 3.61414C10.281 3.9313 8.1909 4.97249 6.57984 6.58084L1.1665 11.6675"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Box>
  )
}
