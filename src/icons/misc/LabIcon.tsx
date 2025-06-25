import { SvgIcon } from '../type'
type LabIconProps = SvgIcon & {
  selected?: boolean
}

export default function LabIcon(props: LabIconProps) {
  const { selected = false } = props
  const fillBorder = selected ? '#22D1F8' : '#0B1022'
  const fillInner = selected ? '#8C6EEF' : '#0B1022'

  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id="path-1-inside-1_39126_28208" fill="white">
        <rect x="6.75" y="3" width="4" height="1.4" rx="0.3" />
      </mask>
      <rect x="6.75" y="3" width="4" height="1.4" rx="0.3" stroke={fillBorder} strokeWidth="0.8" mask="url(#path-1-inside-1_39126_28208)" />
      <path
        d="M7.25 7.55176V4.125H10.375V7.58824C10.375 7.85776 10.4476 8.1223 10.5852 8.35405L13.7797 13.7342C14.3734 14.7341 13.6528 16 12.4899 16H4.77853C3.58541 16 2.86984 14.6745 3.52446 13.677L7.00407 8.37475C7.16452 8.13026 7.25 7.8442 7.25 7.55176Z"
        stroke={fillBorder}
        strokeWidth="0.4"
      />
      <circle cx="8.6" cy="5.6" r="0.6" fill={fillInner} />
      <circle cx="11.85" cy="1.85" r="0.85" fill={fillInner} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.4753 15.3375H4.84995C4.26155 15.3375 3.9023 14.6908 4.21316 14.1913L6.57395 10.3971C6.82257 9.99756 7.31615 9.82541 7.75934 9.98369L8.09559 10.1038C8.48283 10.2421 8.91482 10.1067 9.15382 9.77207C9.54669 9.22205 10.3787 9.26917 10.7069 9.86003L13.1309 14.2232C13.4087 14.7231 13.0472 15.3375 12.4753 15.3375ZM8.19995 12.4381C8.19995 12.7695 7.93132 13.0381 7.59995 13.0381C7.26858 13.0381 6.99995 12.7695 6.99995 12.4381C6.99995 12.1068 7.26858 11.8381 7.59995 11.8381C7.93132 11.8381 8.19995 12.1068 8.19995 12.4381ZM10.4 14.6362C10.897 14.6362 11.3 14.2332 11.3 13.7362C11.3 13.2391 10.897 12.8362 10.4 12.8362C9.90289 12.8362 9.49995 13.2391 9.49995 13.7362C9.49995 14.2332 9.90289 14.6362 10.4 14.6362Z"
        fill={fillInner}
      />
      <path d="M9.5 5V7" stroke={fillBorder} strokeWidth="0.3" strokeLinecap="round" />
      <path d="M9.5 7.75C9.5 7.91667 9.55 8.325 9.75 8.625" stroke={fillBorder} strokeWidth="0.3" strokeLinecap="round" />
    </svg>
  )
}
