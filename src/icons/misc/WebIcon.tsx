import { SvgIcon } from '../type'

export default function WebIcon(props: SvgIcon) {
  const { width = 16, height = 16, color = '#22D1F8', ...restProps } = props

  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" {...restProps} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.6667 13.5564C10.7349 13.5564 13.2223 11.0691 13.2223 8.00087C13.2223 4.93262 10.7349 2.44531 7.6667 2.44531C4.59845 2.44531 2.11115 4.93262 2.11115 8.00087C2.11115 11.0691 4.59845 13.5564 7.6667 13.5564Z"
        stroke={color}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2.11115 8H13.2223" stroke={color} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M7.66668 2.44531C9.05628 3.96662 9.84599 5.94089 9.8889 8.00087C9.84599 10.0608 9.05628 12.0351 7.66668 13.5564C6.27708 12.0351 5.48737 10.0608 5.44446 8.00087C5.48737 5.94089 6.27708 3.96662 7.66668 2.44531V2.44531Z"
        stroke={color}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
