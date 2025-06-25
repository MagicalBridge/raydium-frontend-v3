import { SvgIcon } from '../type'

export default function TelegrameIcon(props: SvgIcon) {
  const { width = 16, height = 16, color = '#22D1F8', ...restProps } = props

  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" {...restProps} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.8168 4.10147C12.896 3.59006 12.4097 3.1864 11.955 3.38605L2.89826 7.36246C2.57217 7.50563 2.59602 7.99955 2.93422 8.10725L4.80196 8.70203C5.15842 8.81555 5.54442 8.75686 5.8557 8.5418L10.0666 5.63257C10.1936 5.54484 10.332 5.72539 10.2235 5.83724L7.19241 8.96233C6.89838 9.26548 6.95674 9.77916 7.31042 10.001L10.7041 12.1291C11.0847 12.3678 11.5744 12.128 11.6456 11.668L12.8168 4.10147Z"
        fill={color}
      />
    </svg>
  )
}
