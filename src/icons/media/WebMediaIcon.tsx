import { SvgIcon } from '../type'

export default function WebMediaIcon(props: SvgIcon) {
  const { width = 32, height = 32, ...restProps } = props

  return (
    <svg width={width} height={height} viewBox="0 0 32 32" fill="none" {...restProps} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15.5 24.3327C20.1023 24.3327 23.8333 20.6017 23.8333 15.9993C23.8333 11.397 20.1023 7.66602 15.5 7.66602C10.8976 7.66602 7.16663 11.397 7.16663 15.9993C7.16663 20.6017 10.8976 24.3327 15.5 24.3327Z"
        stroke="#22D1F8"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.16663 16H23.8333" stroke="#22D1F8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M15.5 7.66602C17.5844 9.94798 18.7689 12.9094 18.8333 15.9993C18.7689 19.0893 17.5844 22.0507 15.5 24.3327C13.4156 22.0507 12.231 19.0893 12.1666 15.9993C12.231 12.9094 13.4156 9.94798 15.5 7.66602V7.66602Z"
        stroke="#22D1F8"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
