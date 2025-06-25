import { SvgIcon } from '../type'

export default function TwitterIcon(props: SvgIcon) {
  const { width = 16, height = 16, color = '#22D1F8', ...restProps } = props

  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" {...restProps} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.88791 7.28399L12.3625 3.33398H11.5391L8.52216 6.76371L6.11253 3.33398H3.33331L6.97714 8.52034L3.33331 12.6625H4.15672L7.34269 9.04061L9.88743 12.6625H12.6666L8.88771 7.28399H8.88791ZM7.76015 8.56604L7.39096 8.04959L4.4534 3.94019H5.7181L8.08874 7.25661L8.45793 7.77305L11.5395 12.0839H10.2748L7.76015 8.56623V8.56604Z"
        fill={color}
      />
    </svg>
  )
}
