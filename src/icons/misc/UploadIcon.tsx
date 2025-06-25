import { SvgIcon } from '../type'

export default function UploadIcon(props: SvgIcon) {
  const { width = 21, height = 20 } = props

  return (
    <svg width={width} height={height} viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.5">
        <path
          d="M18 12.5V15.8333C18 16.2754 17.8244 16.6993 17.5118 17.0118C17.1993 17.3244 16.7754 17.5 16.3333 17.5H4.66667C4.22464 17.5 3.80072 17.3244 3.48816 17.0118C3.17559 16.6993 3 16.2754 3 15.8333V12.5"
          stroke="#BFD2FF"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.6668 6.66667L10.5002 2.5L6.3335 6.66667"
          stroke="#BFD2FF"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M10.5 2.5V12.5" stroke="#BFD2FF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  )
}
