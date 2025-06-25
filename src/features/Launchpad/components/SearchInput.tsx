import { useCallback, useEffect, ChangeEvent, forwardRef, Ref } from 'react'
import { Input, InputGroup, InputLeftElement, useColorMode } from '@chakra-ui/react'
import SearchIcon from '@/icons/misc/SearchIcon'
import { MintInfo } from '../type'
import useSearchMint from '@/hooks/launchpad/useSearchMint'
import { useStateWithUrl } from '@/hooks/useStateWithUrl'

export interface OnSearchChangeData {
  searchTerm?: string
  data: MintInfo[]
  hasMore: boolean
  onLoadMore: () => void
  isLoading: boolean
}
interface Props {
  includeNsfw?: boolean
  onSearchResultChange?: (props: OnSearchChangeData) => void
}

export const SearchInput = forwardRef(({ includeNsfw, onSearchResultChange }: Props, ref: Ref<HTMLInputElement>) => {
  const [searchTerm, setSearchTerm] = useStateWithUrl<string>('', 'search', {
    fromUrl: (v) => v,
    toUrl: (v) => String(v)
  })

  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'

  const { data, hasNextPage, onLoadMore, isLoading } = useSearchMint({
    search: searchTerm,
    includeNsfw
  })

  useEffect(() => {
    onSearchResultChange?.({ searchTerm, data, hasMore: hasNextPage, onLoadMore, isLoading })
  }, [onSearchResultChange, searchTerm, data, hasNextPage, onLoadMore, isLoading])

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (!value || value === '') {
        setSearchTerm('')
      }
      setSearchTerm(value)
    },
    [setSearchTerm]
  )

  return (
    <InputGroup width="100%" maxWidth={['100%', '11.5625rem', '16.25rem']}>
      <InputLeftElement pointerEvents="none" height={['34px', '2.5rem']}>
        <SearchIcon color={isLight ? '#474ABB' : '#C4D6FF80'} />
      </InputLeftElement>
      <Input
        width="100%"
        height={['34px', '2.5rem']}
        type="search"
        value={searchTerm}
        ref={ref}
        name="search-token"
        id="search-token"
        onChange={handleInputChange}
        placeholder="search all"
        autoComplete="search-token"
        aria-label="Search all"
        background="#ABC4FF1F"
        borderRadius="26px"
        color={isLight ? '#474ABB' : '#C4D6FF80'}
        fontSize="sm"
        fontWeight="medium"
        enterKeyHint="search"
        _hover={{
          background: '#ABC4FF1F'
        }}
        sx={{
          '&::-webkit-search-cancel-button': {
            WebkitAppearance: 'none',
            appearance: 'none',
            height: '8px',
            width: '8px',
            background: `
                linear-gradient(45deg, transparent 0%, transparent 43%, #C4D6FF80 45%, #C4D6FF80 55%, transparent 57%, transparent 100%),
                linear-gradient(135deg, transparent 0%, transparent 43%, #C4D6FF80 45%, #C4D6FF80 55%, transparent 57%, transparent 100%)
              `,
            cursor: 'pointer'
          }
        }}
      />
    </InputGroup>
  )
})
