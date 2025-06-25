import { SvgIcon } from '../type'

export default function SortByIcon(props: SvgIcon) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props} className="chakra-icon" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 5H15" stroke="#BFD2FF" strokeLinecap="round" />
      <path d="M7 8H13" stroke="#BFD2FF" strokeLinecap="round" />
      <path d="M7 11H11" stroke="#BFD2FF" strokeLinecap="round" />
      <path d="M4 2V13.5L1.5 11.5" stroke="#BFD2FF" strokeLinecap="round" />
    </svg>
  )
}
