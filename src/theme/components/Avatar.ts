import { colors } from '../cssVariables'

export const Avatar = {
  defaultProps: {
    variant: 'sm',
    colorScheme: 'blue' // default is gray
  },
  baseStyle: {
    container: {
      bg: colors.backgroundDark,
      color: colors.text02
    }
  }
}
