import { colors } from '@/theme/cssVariables'
import { SvgIcon } from '../type'
import { ColorMode } from '@chakra-ui/react'

/** used in mobile nav bottom bar */
export default function LaunchpadPageThumbnailIcon(props: SvgIcon & { isActive?: boolean; colorMode?: ColorMode }) {
  const { colorMode, isActive, color = isActive && colorMode === 'light' ? colors.secondary : colors.textSecondary, ...restProps } = props

  return isActive ? (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="chakra-icon" {...restProps} xmlns="http://www.w3.org/2000/svg">
      <circle opacity={colorMode === 'light' ? '0.4' : '0.8'} cx="12" cy="11" r="4" fill="#8C6EEF" />
      <path
        d="M7.69126 15.2246L5.4668 12.9497C6.35658 8.70327 8.30916 6.12559 9.17423 5.3673C9.17423 5.3673 12.8817 1.57563 17.3306 2.71275C18.0721 6.88386 16.2183 9.15877 15.1061 10.2957C12.9464 12.5034 9.54497 14.7191 7.69126 15.2246Z"
        stroke="#ECF5FF"
        strokeWidth="1.4"
      />
      <path d="M4.01898 14.5235L2.66395 16.1557" stroke="#ECF5FF" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M13.9926 11.4336C14.2398 12.1919 14.6599 13.936 14.3633 14.8459C14.0667 15.7559 11.7681 16.9944 10.6559 17.4999L10.2852 14.0876"
        stroke="#ECF5FF"
        strokeWidth="1.4"
      />
      <path
        d="M8.06115 6.12524C7.44324 5.99886 6.05913 5.74609 5.46595 5.74609C4.87276 5.74609 3.24149 8.5265 2.5 9.91671L6.20743 10.2959"
        stroke="#ECF5FF"
        strokeWidth="1.4"
      />
      <mask id="path-6-inside-1_38312_11295" fill="white">
        <ellipse cx="13.9934" cy="6.12548" rx="0.741486" ry="0.758294" />
      </mask>
      <ellipse cx="13.9934" cy="6.12548" rx="0.741486" ry="0.758294" fill="#ECF5FF" />
      <path
        d="M13.3349 6.12548C13.3349 5.80082 13.6003 5.48378 13.9934 5.48378V8.28378C15.2056 8.28378 16.1349 7.28773 16.1349 6.12548H13.3349ZM13.9934 5.48378C14.3865 5.48378 14.652 5.80082 14.652 6.12548H11.852C11.852 7.28773 12.7813 8.28378 13.9934 8.28378V5.48378ZM14.652 6.12548C14.652 6.45014 14.3865 6.76719 13.9934 6.76719V3.96719C12.7813 3.96719 11.852 4.96324 11.852 6.12548H14.652ZM13.9934 6.76719C13.6003 6.76719 13.3349 6.45014 13.3349 6.12548H16.1349C16.1349 4.96324 15.2056 3.96719 13.9934 3.96719V6.76719Z"
        fill="#ECF5FF"
        mask="url(#path-6-inside-1_38312_11295)"
      />
      <path d="M5.99073 16.9991L4.19235 19.1821" stroke="#ECF5FF" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="chakra-icon" {...restProps} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.69126 15.2246L5.4668 12.9497C6.35658 8.70327 8.30916 6.12559 9.17423 5.3673C9.17423 5.3673 12.8817 1.57563 17.3306 2.71275C18.0721 6.88386 16.2183 9.15877 15.1061 10.2957C12.9464 12.5034 9.54497 14.7191 7.69126 15.2246Z"
        stroke="#BFD2FF"
      />
      <path d="M4.01898 14.5235L2.66395 16.1557" stroke="#BFD2FF" strokeLinecap="round" />
      <path
        d="M13.9926 11.4336C14.2398 12.1919 14.6599 13.936 14.3633 14.8459C14.0667 15.7559 11.7681 16.9944 10.6559 17.4999L10.2852 14.0876"
        stroke="#BFD2FF"
      />
      <path
        d="M8.06115 6.12524C7.44324 5.99886 6.05913 5.74609 5.46595 5.74609C4.87276 5.74609 3.24149 8.5265 2.5 9.91671L6.20743 10.2959"
        stroke="#BFD2FF"
      />
      <ellipse cx="13.9934" cy="6.12548" rx="0.741486" ry="0.758294" fill="#BFD2FF" />
      <path d="M5.99073 16.9991L4.19235 19.1821" stroke="#BFD2FF" strokeLinecap="round" />
    </svg>
  )
}
