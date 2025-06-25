import { SvgIcon } from '../type'
import { colors } from '@/theme/cssVariables'

export default function UserIcon(props: SvgIcon) {
  const { color = colors.lightPurple } = props

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props} className="chakra-icon" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.6668 14V12.6667C12.6668 11.9594 12.4046 11.2811 11.9379 10.781C11.4711 10.281 10.838 10 10.1779 10H5.82238C5.16229 10 4.52923 10.281 4.06247 10.781C3.59572 11.2811 3.3335 11.9594 3.3335 12.6667V14"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.00016 7.33333C9.47292 7.33333 10.6668 6.13943 10.6668 4.66667C10.6668 3.19391 9.47292 2 8.00016 2C6.5274 2 5.3335 3.19391 5.3335 4.66667C5.3335 6.13943 6.5274 7.33333 8.00016 7.33333Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
