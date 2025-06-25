import { useState, useMemo, useEffect, memo, ReactNode, useCallback } from 'react'
import {
  Avatar,
  Box,
  Divider,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputRightAddon,
  Flex,
  Button,
  Switch,
  Text,
  Textarea,
  Tooltip,
  Link,
  NumberInput,
  NumberInputField,
  SystemStyleObject,
  useColorMode
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import ChevronUpIcon from '@/icons/misc/ChevronUpIcon'
import RocketIcon from '@/icons/misc/RocketIcon'
import LabIcon from '@/icons/misc/LabIcon'
import EditIcon from '@/icons/misc/EditIcon'
import EraserIcon from '@/icons/misc/EraserIcon'
import CurvePreviewIcon from '@/icons/misc/CurvePreviewIcon'
import { colors } from '@/theme/cssVariables/colors'
import ImageUploader from '@/components/ImageUploader'
import { useDialogsStore } from '@/store'
import { DialogTypes } from '@/constants/dialogs'
import { Formik } from 'formik'
import * as yup from 'yup'
import { HelpCircle, Info, X } from 'react-feather'
import useWalletSign from '@/hooks/launchpad/useWalletSign'
import NextLink from 'next/link'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { useReferrerQuery } from './utils'
import { DropdownSelectMenu } from '@/components/DropdownSelectMenu'
import useConfigs, { ConfigApiData } from '@/hooks/launchpad/useConfigs'
import { usePlatformInfo } from '@/hooks/launchpad/usePlatformInfo'
import { LaunchpadPoolInitParam, FEE_RATE_DENOMINATOR_VALUE, Curve } from '@raydium-io/raydium-sdk-v2'
import { encodeStr } from '@/utils/common'
import Tabs from '@/components/Tabs'
import { CurveAreaChart } from './components/Charts/CurveAreaChart'
import { wSolToSolString } from '@/utils/token'
import Decimal from 'decimal.js'
import { detectedSeparator, formatCurrency } from '@/utils/numberish/formatter'
import { DAY_SECONDS, MONTH_SECONDS, WEEK_SECONDS, YEAR_SECONDS } from '@/utils/date'
import { ToLaunchPadConfig } from '@/hooks/launchpad/utils'
import { useObjectUrl } from '@/hooks/useObjectUrl'
import { BN } from 'bn.js'
import CompleteInfoModel from './components/CompleteInfoModel'
import { useDisclosure } from '@/hooks/useDelayDisclosure'
import useResponsive from '@/hooks/useResponsive'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { LocalStorageKey } from '@/constants/localStorage'

const supplyList = ['100000000', '1000000000', '10000000000']
interface CreateMintFormValue {
  name: string
  description?: string
  file?: File
  ticker: string
  telegram?: string
  website?: string
  twitter?: string
}

interface CreateMintAdvancedFormValue {
  name: string
  supply: string
  lockedPercent: string
  tokenSoldPercent: string
  solRaised: string
  vestingDuration?: number
  cliff?: number
  description?: string
  file?: File
  ticker: string
  telegram?: string
  website?: string
  twitter?: string
}

enum Tab {
  JustSendIt = 'JustSendIt',
  LaunchLab = 'LaunchLab'
}

type TabItem<T = Tab> = {
  content: ReactNode
  label: ReactNode
  value: T
  slotToolbar?: ReactNode
}

enum CreateTokenSteps {
  Basic = 'Basic',
  Advanced = 'Advanced'
}

export default function TokenCreate() {
  const { t } = useTranslation()
  const [value, setValue] = useState(Tab.JustSendIt)
  const referrerQuery = useReferrerQuery('?')
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const [isLaunchTokenBannerShown, setIsLaunchTokenBannerShown] = useLocalStorage({
    key: LocalStorageKey.IsLaunchTokenBannerShown,
    defaultValue: true
  })

  const panelItems = useMemo(() => {
    return [
      {
        content: <JustSendIt />,
        label: (
          <Flex alignItems="center" gap={1}>
            <Text>JustSendIt</Text>
            <RocketIcon selected={value === Tab.JustSendIt} />
          </Flex>
        ),
        value: Tab.JustSendIt
      },
      {
        content: <LaunchLabForm />,
        label: (
          <Flex alignItems="center" gap={1}>
            <Text>Advanced</Text>
            <LabIcon selected={value === Tab.JustSendIt} />
          </Flex>
        ),
        value: Tab.LaunchLab
      }
    ]
  }, [value])

  return (
    <Grid
      gridTemplate={[
        `
        "back" auto
        "panel" 1fr / 1fr
      `
      ]}
      columnGap={4}
      rowGap={2}
      mt={2}
    >
      <GridItem area="back">
        {isLaunchTokenBannerShown && (
          <Box marginX={['-20px', 0, `min((100vw - 1600px) / -2, -7%)`]} mb={3}>
            <Flex borderRadius="8px" background="#8C6EEF33" width="100%" px={3} py={2} justifyContent="space-between">
              <Box></Box>
              <Flex alignItems="center" lineHeight="18px">
                💰
                <Text
                  fontSize="sm"
                  bgGradient={
                    isLight
                      ? 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)'
                      : 'linear-gradient(245.22deg, #FF2FC8 7.97%, #FFB12B 49.17%, #D3D839 92.1%)'
                  }
                  bgClip="text"
                >
                  Launch tokens, earn rewards! Check ‘Rewards’ tab and X account for updates!
                </Text>
              </Flex>
              <X width="22px" height="22px" color="#4F53F3" cursor="pointer" onClick={() => setIsLaunchTokenBannerShown(false)} />
            </Flex>
          </Box>
        )}
        <Flex alignItems="center" gap={1} opacity={0.5}>
          <Link as={NextLink} href={`/launchpad${referrerQuery}`} display="contents" shallow color={colors.lightPurple}>
            <ChevronLeftIcon />
            <Text fontWeight="500" fontSize="xl">
              {t('common.back')}
            </Text>
          </Link>
        </Flex>
      </GridItem>
      <GridItem area="panel">
        <Text color={colors.lightPurple} fontSize="xl" fontWeight="medium" textAlign="center" mb={7}>
          {t('launchpad.create_token')}
        </Text>
        {/* <Flex background="#22D1F833" alignItems="center" px={4} py="10px" gap={2} borderRadius="8px" mt={6}>
      <Box>
        <Info width="18px" height="18px" color={colors.textLaunchpadLink} />
      </Box>
      <Text fontSize="sm" color={colors.textLaunchpadLink} lineHeight="18px">
        You will receive{' '}
        <Text as="span" fontWeight="bold">
          1 SOL
        </Text>{' '}
        when your coin completes its bonding curve
      </Text>
    </Flex> */}
        <TabContent
          value={value}
          onValueChange={setValue}
          items={panelItems}
          sx={{
            '.chakra-tabs__tab-indicator': {
              background: value === Tab.JustSendIt ? '#22D1F8' : 'linear-gradient(245.22deg, #FF2FC8 7.97%, #FFB12B 49.17%, #D3D839 92.1%)'
            }
          }}
        />
      </GridItem>
    </Grid>
  )
}

const JustSendIt = () => {
  const { t } = useTranslation()
  const openDialog = useDialogsStore((s) => s.openDialog)
  const { checkToken, getTokenFromStorage } = useWalletSign()
  const isSignIn = !!getTokenFromStorage()
  const { configList } = useConfigs({})
  const configInfo = configList[0]

  const [isFocused] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isPostMigrationFeeShare, setIsPostMigrationFeeShare] = useState(true)
  const [migrateType, setMigrateType] = useState<'amm' | 'cpmm'>('cpmm')

  const platformInfo = usePlatformInfo({ platformId: LaunchpadPoolInitParam.platformId })

  const schema = useMemo(
    () =>
      yup.object({
        name: yup.string().required('Enter token name'),
        description: yup.string().max(2000, 'max 2000 characters'),
        ticker: yup.string().required('Enter ticker'),
        file: yup.mixed().required('Upload an image'),
        telegram: yup.string().test('is-website-valid', 'invalid telegram url', function (val) {
          if (!val) return true
          return val.indexOf('t.me') > -1
        }),
        twitter: yup.string().test('is-website-valid', 'invalid telegram url', function (val) {
          if (!val) return true
          return val.indexOf('x.com') > -1 || val.indexOf('twitter.com') > -1
        })
      }),
    []
  )

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleCreateMint = async (values: CreateMintFormValue) => {
    // console.log('post create', values)
    if (!configInfo) {
      toastSubject.next({
        status: 'warning',
        title: 'Launch config not found',
        description: `please select launch config`
      })
      return
    }
    const r = await checkToken({
      checkTime: true,
      successCbk: () => {
        openDialog(
          DialogTypes.InitialBuy({
            ...values,
            configInfo,
            file: values.file!,
            migrateType
          })
        )
      }
    })
    if (!r) return
    openDialog(
      DialogTypes.InitialBuy({
        ...values,
        configInfo,
        file: values.file!,
        migrateType
      })
    )
  }

  return (
    <Box
      background={colors.backgroundLight}
      mt={3}
      px={[3, 6]}
      py={4}
      borderRadius="20px"
      border={`1px solid ${colors.buttonSolidText}`}
      boxShadow="0px 8px 48px 0px #4F53F31A"
      mx="auto"
      width={['100%', '420px', '500px']}
    >
      <Formik<CreateMintFormValue>
        initialValues={{ name: '', ticker: '' }}
        validationSchema={schema}
        onSubmit={(values) => {
          handleCreateMint(values)
        }}
      >
        {({ values, errors, touched, submitCount, handleChange, handleBlur, handleSubmit, setFieldValue, setFieldTouched }) => (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(e)
              setFieldTouched('description', true)
            }}
          >
            <Flex direction="column" gap={4}>
              <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                <Flex direction="column" gap={3}>
                  <Text color={colors.lightPurple} fontWeight="medium">
                    {t('launchpad.name')}
                  </Text>
                  <Input
                    name="name"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.name}
                    background={colors.backgroundDark}
                    _hover={{
                      background: colors.backgroundDark
                    }}
                    _focus={{
                      background: colors.backgroundDark
                    }}
                    maxLength={32}
                    placeholder="Solana"
                    color={colors.lightPurple}
                    fontSize="xl"
                    fontWeight="medium"
                    width="100%"
                  />
                  {touched.name && errors.name ? <Text variant="error">{errors.name}</Text> : null}
                </Flex>
                <Flex direction="column" gap={3}>
                  <Text color={colors.lightPurple} fontWeight="medium">
                    {t('launchpad.ticker')}
                  </Text>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    borderRadius="12px"
                    background={colors.backgroundDark}
                    height="2.5rem"
                    overflow="hidden"
                    gap={2}
                    px={4}
                    border={`1px solid ${isFocused ? colors.textSecondary : 'transparent'}`}
                    transition="border 0.2s ease"
                  >
                    {/* <Text fontWeight="medium" fontSize="xl" lineHeight="26px" userSelect="none" whiteSpace="nowrap">
                      $
                    </Text> */}
                    <Input
                      name="ticker"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.ticker}
                      maxLength={10}
                      _hover={{
                        background: colors.backgroundDark
                      }}
                      _focus={{
                        background: colors.backgroundDark
                      }}
                      placeholder="SOL"
                      fontSize="xl"
                      fontWeight="medium"
                      sx={{
                        px: 1,
                        background: colors.backgroundDark,
                        color: colors.lightPurple,
                        fontWeight: '500',
                        fontSize: '20px',
                        lineHeight: '26px',
                        flex: 1,
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        minWidth: 0,
                        border: 'none'
                      }}
                    />
                  </Flex>
                  {touched.ticker && errors.ticker ? <Text variant="error">{errors.ticker}</Text> : null}
                </Flex>
              </Grid>
              <Box>
                <Text mb={3} color={colors.lightPurple} fontWeight="medium">
                  {t('launchpad.description')}
                </Text>
                <Textarea
                  name="description"
                  height="7rem"
                  background={colors.backgroundDark}
                  border="1px solid #ABC4FF1A"
                  borderRadius="12px"
                  resize="none"
                  maxLength={2000}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.description}
                  placeholder=""
                  size="sm"
                />
                {touched.description && errors.description ? (
                  <Text variant="error" mt="1">
                    {errors.description}
                  </Text>
                ) : null}
              </Box>
              <Box>
                <Flex alignItems="center" gap={1} mb={3}>
                  <Text color={colors.lightPurple} fontWeight="medium">
                    {t('launchpad.image_or_gif')}
                  </Text>
                  <Tooltip hasArrow placement="top" label={'A square image of at least 128x128 is suggested. File size cannot exceed 5mb.'}>
                    <HelpCircle size={12} color={colors.lightPurple} />
                  </Tooltip>
                </Flex>
                <ImageUploader
                  onImageUpload={(file) => {
                    setFieldValue('file', file)
                    setUploadError(null)
                  }}
                  onError={(error) => {
                    if (error) {
                      setUploadError(error)
                    } else {
                      setUploadError(null)
                    }
                  }}
                  acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif']}
                  maxFileSizeInMB={5}
                />
                {uploadError ? (
                  <Text mt="1" variant="error">
                    {uploadError}
                  </Text>
                ) : submitCount > 0 && errors.file ? (
                  <Text mt="1" variant="error">
                    {errors.file}
                  </Text>
                ) : null}
              </Box>
              <Flex
                justifyContent="space-between"
                p={2}
                alignItems="center"
                borderRadius="8px"
                background="#ABC4FF12"
                border="1px solid #BFD2FF1A"
              >
                <Flex alignItems="center" gap={1} lineHeight="20px">
                  <Text color={colors.lightPurple} fontWeight="medium">
                    Creator LP fee share
                  </Text>
                  <Tooltip
                    hasArrow
                    placement="top"
                    label={`After the token graduates, token creators can claim ${
                      platformInfo ? (Number(platformInfo.creatorScale) / 1000000) * 100 : 10
                    }% of LP fees from AMM pool trades.`}
                  >
                    <HelpCircle size={12} color={colors.lightPurple} />
                  </Tooltip>
                </Flex>
                <Switch
                  isChecked={isPostMigrationFeeShare}
                  onChange={() => {
                    setIsPostMigrationFeeShare(!isPostMigrationFeeShare)
                    setMigrateType(isPostMigrationFeeShare ? 'amm' : 'cpmm')
                  }}
                  _checked={{
                    '.chakra-switch__track': {
                      bg: '#8C6EEF'
                    },
                    '.chakra-switch__thumb': {
                      bg: colors.lightPurple
                    }
                  }}
                />
              </Flex>
              <Button
                variant="ghost"
                _hover={{
                  background: 'transparent'
                }}
                px={0}
                justifyContent="flex-start"
                height="18px"
                rightIcon={isExpanded ? <ChevronUpIcon width={16} height={16} /> : <ChevronDownIcon width={16} height={16} />}
                onClick={toggleExpand}
              >
                {t('launchpad.socials_more_options')}
              </Button>
              {isExpanded && (
                <Flex direction="column" gap={4}>
                  <Box>
                    <Text color={colors.lightPurple} fontWeight="medium" mb={3}>
                      {t('launchpad.telegram_link')}
                    </Text>
                    <Input
                      name="telegram"
                      value={values.telegram}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      type="url"
                      background={colors.backgroundDark}
                      _hover={{
                        background: colors.backgroundDark
                      }}
                      _focus={{
                        background: colors.backgroundDark
                      }}
                      placeholder="Optional"
                      color={colors.lightPurple}
                      fontSize="xl"
                      fontWeight="medium"
                      width="100%"
                    />
                    {errors.telegram ? (
                      <Text mt="1" variant="error">
                        {' '}
                        {errors.telegram}
                      </Text>
                    ) : null}
                  </Box>
                  <Box>
                    <Text color={colors.lightPurple} fontWeight="medium" mb={3}>
                      {t('launchpad.website_link')}
                    </Text>
                    <Input
                      name="website"
                      value={values.website}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      type="url"
                      background={colors.backgroundDark}
                      _hover={{
                        background: colors.backgroundDark
                      }}
                      _focus={{
                        background: colors.backgroundDark
                      }}
                      placeholder="Optional"
                      color={colors.lightPurple}
                      fontSize="xl"
                      fontWeight="medium"
                      width="100%"
                    />
                  </Box>
                  <Box>
                    <Text color={colors.lightPurple} fontWeight="medium" mb={3}>
                      {t('launchpad.x_link')}
                    </Text>
                    <Input
                      name="twitter"
                      value={values.twitter}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      type="url"
                      background={colors.backgroundDark}
                      _hover={{
                        background: colors.backgroundDark
                      }}
                      _focus={{
                        background: colors.backgroundDark
                      }}
                      placeholder="Optional"
                      color={colors.lightPurple}
                      fontSize="xl"
                      fontWeight="medium"
                      width="100%"
                    />
                  </Box>
                </Flex>
              )}
              <Text color={colors.semanticWarning} fontSize="sm" fontWeight="medium">
                {t('launchpad.token_creation_note')}
              </Text>
              <Button size="lg" type="submit" isDisabled={isSignIn && !configInfo}>
                {isSignIn ? t('launchpad.create_token') : t('launchpad.sign_in_create_token')}
              </Button>
            </Flex>
          </form>
        )}
      </Formik>
    </Box>
  )
}

const initPoolData = {
  name: '',
  ticker: '',
  supply: supplyList[1],
  lockedPercent: '',
  tokenSoldPercent: '80',
  solRaised: new Decimal(LaunchpadPoolInitParam.totalFundRaisingB.toString()).div(10 ** 9).toString(),
  vestingDuration: 0
}

const LaunchLabForm = () => {
  const { t } = useTranslation()
  const openDialog = useDialogsStore((s) => s.openDialog)
  const { checkToken, getTokenFromStorage } = useWalletSign()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isMobile } = useResponsive()

  const isSignIn = !!getTokenFromStorage()
  const { configList, configMap } = useConfigs({})
  const [isFocused] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [configInfo, setConfigInfo] = useState<ConfigApiData | undefined>()
  const [vestingUnit, setVestingUnit] = useState(MONTH_SECONDS)
  const [cliffUnit, setCliffUnit] = useState(MONTH_SECONDS)
  const [migrateType, setMigrateType] = useState<'amm' | 'cpmm'>('cpmm')
  const [lockError, setLockError] = useState<string | undefined>(undefined)
  const [supplyError, setSupplyError] = useState<string | undefined>(undefined)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [currentStep, setCurrentStep] = useState<CreateTokenSteps>(CreateTokenSteps.Basic)
  const [isCliffEnabled, setIsCliffEnabled] = useState(false)
  const [isPostMigrationFeeShare, setIsPostMigrationFeeShare] = useState(true)
  const [poolData, setPoolData] = useState<CreateMintAdvancedFormValue>(initPoolData)
  const [data, setData] = useState<any[]>([])
  const decimalA = 6

  const platformInfo = usePlatformInfo({ platformId: LaunchpadPoolInitParam.platformId })

  useEffect(() => {
    setConfigInfo((val) => val ?? configList[0])
  }, [configList])

  const schema = useMemo(() => {
    return yup.object({
      name: yup.string().required('Enter token name'),
      description: yup.string().max(2000, 'max 2000 characters'),
      ticker: yup.string().required('Enter ticker'),
      file: yup.mixed().required('Upload an image'),
      telegram: yup.string().test('is-website-valid', 'invalid telegram url', function (val) {
        if (!val) return true
        return val.indexOf('t.me') > -1
      }),
      twitter: yup.string().test('is-website-valid', 'invalid telegram url', function (val) {
        if (!val) return true
        return val.indexOf('x.com') > -1 || val.indexOf('twitter.com') > -1
      }),
      lockedPercent: yup
        .string()
        .transform((value) => (isNaN(value) ? 0 : value))
        .max(30, 'Tokens locked cannot exceed 30%'),
      tokenSoldPercent: yup
        .number()
        .transform((value) => (isNaN(value) ? 0 : value))
        .required('Enter the % of token supply to be sold')
        .min(1, 'Tokens Sold can not be zero')
        .test('within-range', 'Select a value between 51% and 80%', (value) => value !== undefined && value >= 51 && value <= 80)
        .test('is-sold-valid', `Token sold amount too low`, function (val) {
          if (!val || !configInfo) return false

          try {
            const totalLockedAmount = new BN(
              new Decimal(this.parent.lockedPercent || 0)
                .div(100)
                .mul(new Decimal(this.parent.supply).mul(10 ** decimalA))
                .toFixed(0)
            )

            const totalSell = new BN(
              new Decimal(val)
                .div(100)
                .mul(this.parent.supply)
                .mul(10 ** decimalA)
                .toFixed(0)
            )
            const curveType = configInfo.key.curveType ?? 0
            const initCurve = Curve.getCurve(curveType)
            const { c } = initCurve.getInitParam({
              supply: new BN(new Decimal(this.parent.supply || 0).mul(10 ** decimalA).toFixed(0)),
              totalFundRaising: new BN(new Decimal(this.parent.solRaised || 0).mul(10 ** (configInfo?.mintInfoB.decimals ?? 9)).toFixed(0)),
              totalLockedAmount,
              totalSell: curveType === 0 ? totalSell : new BN(0),
              migrateFee: new BN(configInfo.key.migrateFee)
            })
            const minSellA = new BN(new Decimal(this.parent.supply).mul(10 ** decimalA).toFixed(0))
              .mul(new BN(configInfo.key.minSellRateA))
              .div(FEE_RATE_DENOMINATOR_VALUE)
            return c.gte(minSellA)
          } catch {
            return false
          }
        }),
      solRaised: yup
        .number()
        .transform((value) => (isNaN(value) ? 0 : value))
        .required('Enter the amount of SOL to be raised')
        .min(30, 'Amount of SOL must be min of 30 SOL.')
    })
  }, [configInfo?.key.pubKey])

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleParseVal = useCallback(
    (propsDecimals?: number) => (propVal: string) => {
      const decimals = propsDecimals ?? 6
      const val = propVal.match(new RegExp(`[0-9${detectedSeparator}]`, 'gi'))?.join('') || ''
      if (!val) return ''
      const splitArr = val.split(detectedSeparator)
      if (splitArr.length > 2) return [splitArr[0], splitArr[1]].join('.')
      if (decimals === 0 && splitArr.length > 1) return splitArr[0]
      if (splitArr[1] && splitArr[1].length > decimals) {
        return [splitArr[0], splitArr[1].substring(0, decimals)].join('.')
      }
      return val === detectedSeparator ? '0.' : val.replace(detectedSeparator, '.')
    },
    []
  )

  const handleCreateMint = async (values: CreateMintAdvancedFormValue) => {
    // console.log('post create', values)
    if (!configInfo) {
      toastSubject.next({
        status: 'warning',
        title: 'Launch config not found',
        description: `please select launch config`
      })
      return
    }

    const supply = new BN(new Decimal(values.supply).mul(10 ** decimalA).toFixed(0))
    const totalSellA = new BN(
      new Decimal(values.tokenSoldPercent)
        .div(100)
        .mul(values.supply)
        .mul(10 ** decimalA)
        .toFixed(0)
    )
    const totalLockedAmount = new BN(
      new Decimal(values.lockedPercent || 0)
        .div(100)
        .mul(new Decimal(values.supply || 0).mul(10 ** decimalA))
        .toFixed(0)
    )
    const hasLocked = new Decimal(values.lockedPercent || 0).gt(0)
    const totalFundRaisingB = new BN(new Decimal(values.solRaised).mul(10 ** configInfo.mintInfoB.decimals).toFixed(0))
    const cliffPeriod = hasLocked && values.cliff ? new BN(new Decimal(values.cliff || 0).mul(cliffUnit).toFixed(0)) : undefined
    const unlockPeriod =
      hasLocked && values.vestingDuration ? new BN(new Decimal(values.vestingDuration || 0).mul(vestingUnit).toFixed(0)) : undefined

    const r = await checkToken({
      checkTime: true,
      successCbk: () => {
        openDialog(
          DialogTypes.InitialBuy({
            ...values,
            configInfo,
            file: values.file!,
            supply,
            totalSellA,
            totalFundRaisingB,
            totalLockedAmount,
            cliffPeriod,
            unlockPeriod,
            migrateType,
            tag: Date.now()
          })
        )
      }
    })
    if (!r) return
    openDialog(
      DialogTypes.InitialBuy({
        ...values,
        configInfo,
        file: values.file!,
        supply,
        totalSellA,
        totalFundRaisingB,
        totalLockedAmount,
        cliffPeriod,
        unlockPeriod,
        migrateType,
        tag: Date.now()
      })
    )
  }

  useEffect(() => {
    async function getTempInfo() {
      if (!configInfo || !poolData.supply || !poolData.tokenSoldPercent || !poolData.solRaised) {
        setData([])
        return
      }

      try {
        const supply = new BN(new Decimal(poolData.supply).mul(10 ** decimalA).toFixed(0))
        const totalSell = new BN(new Decimal(poolData.tokenSoldPercent).div(100).mul(supply.toString()).toFixed(0))
        const totalLockedAmount = new BN(new Decimal(poolData.lockedPercent || 0).div(100).mul(supply.toString()).toFixed(0))
        const totalFundRaising = new BN(new Decimal(poolData.solRaised).mul(10 ** configInfo.mintInfoB.decimals).toFixed(0))

        const initCurve = Curve.getCurve(configInfo.key.curveType)
        const { c } = initCurve.getInitParam({
          supply,
          totalFundRaising,
          totalLockedAmount,
          totalSell: configInfo.key.curveType === 0 ? totalSell : new BN(0),
          migrateFee: new BN(configInfo.key.migrateFee)
        })

        try {
          Curve.checkParam({
            supply,
            totalFundRaising,
            totalSell: c,
            totalLockedAmount,
            decimals: decimalA,
            config: ToLaunchPadConfig(configInfo.key),
            migrateType
          })
          console.log('check init params success')
          setLockError(undefined)
          setSupplyError(undefined)
        } catch (e: any) {
          const supplyMinusSellLocked = supply.sub(totalSell).sub(totalLockedAmount)
          if (supplyMinusSellLocked.lte(new BN(0))) setLockError('Supply minus locked amount lower than 0')
          else if (e.message === 'migrate lt min migrate amount') setLockError('Tokens Locked + Tokens Sold cannot exceed 80%')
          else if (e.message === 'supply/totalSell/totalLockedAmount diff too high')
            setSupplyError('Difference between Supply and Token Sold too big, try lower supply or higher token sold')
          console.error(`check create mint params failed, ${e.message}`)
        }

        const points = Curve.getPoolCurvePointByInit({
          curveType: configInfo.key.curveType,
          supply,
          totalSell,
          totalLockedAmount,
          totalFundRaising,
          migrateFee: new BN(configInfo.key.migrateFee),
          decimalA,
          decimalB: configInfo.mintInfoB.decimals,
          pointCount: 40
        })

        setData(
          points.map((p) => ({
            x: p.totalSellSupply,
            price: p.price.toDecimalPlaces(10).toNumber(),
            percent: p.price.div(points[0].price).mul(100).toNumber()
          }))
        )
      } catch (e: any) {
        console.error(e.message)
      }
    }
    getTempInfo()
  }, [configInfo?.key.pubKey, poolData, vestingUnit, cliffUnit, platformInfo?.name, migrateType])

  return (
    <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(2, 500px)']} justifyContent="center" width="100%" gap={7} mt={3}>
      <Formik<CreateMintAdvancedFormValue>
        initialValues={poolData}
        validationSchema={schema}
        onSubmit={(values) => {
          handleCreateMint(values)
        }}
      >
        {({ values, errors, touched, submitCount, validateForm, handleChange, handleBlur, handleSubmit, setFieldValue, setTouched }) => (
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const err = await validateForm()
              if (Object.values(err).length) {
                setTouched({
                  name: true,
                  ticker: true,
                  file: true,
                  description: true
                })
                onOpen()
                return
              }
              handleSubmit(e)
            }}
          >
            <Flex direction="column" width="100%" mb={['80px', 0]}>
              {currentStep === CreateTokenSteps.Basic ? null : (
                <Flex
                  background={colors.backgroundLight}
                  px={[3, 6]}
                  py={4}
                  borderRadius="20px"
                  border={`1px solid ${colors.buttonSolidText}`}
                  boxShadow="0px 8px 48px 0px #4F53F31A"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Text fontWeight="medium" fontSize="lg">
                      Basic info
                    </Text>
                    {!values.name || !values.ticker || !values.file ? (
                      <Text fontSize="md" variant="error">
                        Please complete basic token info
                      </Text>
                    ) : null}
                  </Box>
                  <Flex gap={1}>
                    {values.file ? (
                      <FileAvatar file={values.file} name={values.name} />
                    ) : (
                      <Avatar width={7} height={7} bg={colors.dividerBg} icon={<></>} />
                    )}
                    <Text color={colors.lightPurple} fontSize="lg" fontWeight="medium" ml={1}>
                      {values.ticker ? `$${values.ticker}` : '-'}
                    </Text>
                    <Text color={colors.lightPurple} fontSize="lg" fontWeight="medium" mr={1} opacity={0.6}>
                      {values.name ? `(${values.name})` : '( - )'}
                    </Text>
                    <EditIcon cursor="pointer" onClick={() => setCurrentStep(CreateTokenSteps.Basic)} />
                  </Flex>
                </Flex>
              )}
              <Box
                background={colors.backgroundLight}
                px={[3, 6]}
                py={4}
                borderRadius="20px"
                border={`1px solid ${colors.buttonSolidText}`}
                boxShadow="0px 8px 48px 0px #4F53F31A"
                display={currentStep !== CreateTokenSteps.Basic ? ' none' : 'block'}
              >
                <Flex direction="column" gap={4}>
                  <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    <Flex direction="column" gap={3}>
                      <Text color={colors.lightPurple} fontWeight="medium">
                        {t('launchpad.name')}
                      </Text>
                      <Input
                        name="name"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.name}
                        background={colors.backgroundDark}
                        _hover={{
                          background: colors.backgroundDark
                        }}
                        _focus={{
                          background: colors.backgroundDark
                        }}
                        maxLength={32}
                        placeholder="Solana"
                        color={colors.lightPurple}
                        fontSize="xl"
                        fontWeight="medium"
                        width="100%"
                      />
                      {touched.name && errors.name ? <Text variant="error">{errors.name}</Text> : null}
                    </Flex>
                    <Flex direction="column" gap={3}>
                      <Text color={colors.lightPurple} fontWeight="medium">
                        {t('launchpad.ticker')}
                      </Text>
                      <Flex
                        justifyContent="space-between"
                        alignItems="center"
                        borderRadius="12px"
                        background={colors.backgroundDark}
                        height="2.5rem"
                        overflow="hidden"
                        gap={2}
                        px={4}
                        border={`1px solid ${isFocused ? colors.textSecondary : 'transparent'}`}
                        transition="border 0.2s ease"
                      >
                        {/* <Text fontWeight="medium" fontSize="xl" lineHeight="26px" userSelect="none" whiteSpace="nowrap">
                          $
                        </Text> */}
                        <Input
                          name="ticker"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.ticker}
                          maxLength={10}
                          _hover={{
                            background: colors.backgroundDark
                          }}
                          _focus={{
                            background: colors.backgroundDark
                          }}
                          placeholder="SOL"
                          fontSize="xl"
                          fontWeight="medium"
                          sx={{
                            px: 1,
                            background: colors.backgroundDark,
                            color: colors.lightPurple,
                            fontWeight: '500',
                            fontSize: '20px',
                            lineHeight: '26px',
                            flex: 1,
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden',
                            minWidth: 0,
                            border: 'none'
                          }}
                        />
                      </Flex>
                      {touched.ticker && errors.ticker ? <Text variant="error">{errors.ticker}</Text> : null}
                    </Flex>
                  </Grid>
                  <Box>
                    <Text mb={3} color={colors.lightPurple} fontWeight="medium">
                      {t('launchpad.description')}
                    </Text>
                    <Textarea
                      name="description"
                      height="7rem"
                      background={colors.backgroundDark}
                      border="1px solid #ABC4FF1A"
                      borderRadius="12px"
                      resize="none"
                      maxLength={2000}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.description}
                      placeholder=""
                      size="sm"
                    />
                    {touched.description && errors.description ? (
                      <Text variant="error" mt="1">
                        {errors.description}
                      </Text>
                    ) : null}
                  </Box>
                  <Box>
                    <Flex alignItems="center" gap={1} mb={3}>
                      <Text color={colors.lightPurple} fontWeight="medium">
                        {t('launchpad.image_or_gif')}
                      </Text>
                      <Tooltip
                        hasArrow
                        placement="top"
                        label={'A square image of at least 128x128 is suggested. File size cannot exceed 5mb.'}
                      >
                        <HelpCircle size={12} color={colors.lightPurple} />
                      </Tooltip>
                    </Flex>
                    <ImageUploader
                      onImageUpload={(file) => {
                        setFieldValue('file', file)
                        setUploadError(null)
                      }}
                      onError={(error) => {
                        if (error) {
                          setUploadError(error)
                        } else {
                          setUploadError(null)
                        }
                      }}
                      acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif']}
                      maxFileSizeInMB={5}
                    />
                    {uploadError ? (
                      <Text mt="1" variant="error">
                        {uploadError}
                      </Text>
                    ) : (submitCount > 0 || touched['file']) && errors.file ? (
                      <Text mt="1" variant="error">
                        {errors.file}
                      </Text>
                    ) : null}
                  </Box>
                  <Box>
                    <Button
                      variant="ghost"
                      _hover={{
                        background: 'transparent'
                      }}
                      px={0}
                      rightIcon={isExpanded ? <ChevronUpIcon width={16} height={16} /> : <ChevronDownIcon width={16} height={16} />}
                      onClick={toggleExpand}
                    >
                      {t('launchpad.socials_more_options')}
                    </Button>
                  </Box>
                  {isExpanded && (
                    <Flex direction="column" gap={4}>
                      <Box>
                        <Text color={colors.lightPurple} fontWeight="medium" mb={3}>
                          {t('launchpad.telegram_link')}
                        </Text>
                        <Input
                          name="telegram"
                          value={values.telegram}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type="url"
                          background={colors.backgroundDark}
                          _hover={{
                            background: colors.backgroundDark
                          }}
                          _focus={{
                            background: colors.backgroundDark
                          }}
                          placeholder="Optional"
                          color={colors.lightPurple}
                          fontSize="xl"
                          fontWeight="medium"
                          width="100%"
                        />
                        {errors.telegram ? (
                          <Text mt="1" variant="error">
                            {' '}
                            {errors.telegram}
                          </Text>
                        ) : null}
                      </Box>
                      <Box>
                        <Text color={colors.lightPurple} fontWeight="medium" mb={3}>
                          {t('launchpad.website_link')}
                        </Text>

                        <Input
                          name="website"
                          value={values.website}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type="url"
                          background={colors.backgroundDark}
                          _hover={{
                            background: colors.backgroundDark
                          }}
                          _focus={{
                            background: colors.backgroundDark
                          }}
                          placeholder="Optional"
                          color={colors.lightPurple}
                          fontSize="xl"
                          fontWeight="medium"
                          width="100%"
                        />
                      </Box>
                      <Box>
                        <Text color={colors.lightPurple} fontWeight="medium" mb={3}>
                          {t('launchpad.x_link')}
                        </Text>
                        <Input
                          name="twitter"
                          value={values.twitter}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type="url"
                          background={colors.backgroundDark}
                          _hover={{
                            background: colors.backgroundDark
                          }}
                          _focus={{
                            background: colors.backgroundDark
                          }}
                          placeholder="Optional"
                          color={colors.lightPurple}
                          fontSize="xl"
                          fontWeight="medium"
                          width="100%"
                        />
                      </Box>
                    </Flex>
                  )}
                  <Button
                    size="lg"
                    type="button"
                    onClick={() => {
                      setCurrentStep(CreateTokenSteps.Advanced)
                      setTouched({
                        name: true,
                        ticker: true,
                        file: true,
                        description: true
                      })
                    }}
                  >
                    {t('button.next_step')}
                  </Button>
                </Flex>
              </Box>
              {currentStep === CreateTokenSteps.Advanced ? null : (
                <Flex
                  background={colors.backgroundLight}
                  px={[3, 6]}
                  py={4}
                  borderRadius="20px"
                  border={`1px solid ${colors.buttonSolidText}`}
                  boxShadow="0px 8px 48px 0px #4F53F31A"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={4}
                >
                  <Text fontWeight="medium" fontSize="lg">
                    Advanced options
                  </Text>
                  <EditIcon cursor="pointer" onClick={() => setCurrentStep(CreateTokenSteps.Advanced)} />
                </Flex>
              )}
              <Box
                background={colors.backgroundLight}
                mt={4}
                px={[3, 6]}
                py={4}
                borderRadius="20px"
                border={`1px solid ${colors.buttonSolidText}`}
                boxShadow="0px 8px 48px 0px #4F53F31A"
                display={currentStep !== CreateTokenSteps.Advanced ? ' none' : 'block'}
              >
                <Flex justifyContent="space-between" mb={3} fontSize={['sm', 'md']}>
                  <Text color={colors.lightPurple} fontWeight="medium">
                    Quote Token
                  </Text>
                  <Flex
                    gap={1}
                    alignItems="center"
                    cursor="pointer"
                    onClick={() => {
                      setFieldValue('supply', supplyList[1])

                      const clearedValues = {
                        ...values,
                        vestingDuration: 0,
                        cliff: 0,
                        lockedPercent: '',
                        tokenSoldPercent: '',
                        solRaised: '',
                        supply: supplyList[1]
                      }

                      setFieldValue('lockedPercent', '')
                      setFieldValue('tokenSoldPercent', '')
                      setFieldValue('solRaised', '')
                      setFieldValue('vestingDuration', '')
                      setFieldValue('cliff', '')

                      setIsPostMigrationFeeShare(true)
                      setMigrateType('cpmm')

                      setPoolData(clearedValues)

                      setLockError(undefined)
                      setSupplyError(undefined)
                    }}
                  >
                    <EraserIcon />
                    <Text color={colors.textLink} fontWeight="medium">
                      Clear all values
                    </Text>
                  </Flex>
                </Flex>
                <DropdownSelectMenu
                  triggerSx={{
                    width: '100%',
                    height: ['3.125rem', '3.75rem'],
                    background: colors.backgroundDark,
                    color: colors.textSecondary,
                    borderRadius: '12px',
                    mb: 4,
                    _hover: {
                      background: colors.backgroundDark
                    },
                    span: {
                      textAlign: 'left'
                    }
                  }}
                  items={[
                    {
                      group: 'tokens',
                      items: configList.map((c) => ({
                        label: (
                          <Flex alignItems="center" gap={1}>
                            <Avatar
                              src={c.mintInfoB.logoURI}
                              name={c.mintInfoB.symbol}
                              size="sm"
                              width={['20px', '24px']}
                              height={['20px', '24px']}
                            />
                            <Text color={colors.textPrimary} fontWeight="medium" fontSize={['md', 'xl']}>
                              {wSolToSolString(c.mintInfoB.symbol)}
                            </Text>
                            <Text color={colors.lightPurple} fontSize={['sm', 'md']}>
                              ({encodeStr(c.mintInfoB.address)})
                            </Text>
                          </Flex>
                        ),
                        value: c.key.pubKey
                      }))
                    }
                  ]}
                  value={configInfo?.key.pubKey}
                  onValueChange={(val) => setConfigInfo(configMap.get(val))}
                />
                <Grid gridTemplateColumns={['minmax(0, 1.9fr) minmax(0, 1.24fr)', 'minmax(0, 3fr) minmax(0, 1.4fr)']} gap={3} mb={4}>
                  <Box color={colors.lightPurple} fontWeight="medium">
                    <Text mb={3} fontSize={['sm', 'md']}>
                      Token Supply
                    </Text>
                    <DropdownSelectMenu
                      triggerSx={{
                        width: '100%',
                        height: ['3.125rem', '3.75rem'],
                        background: colors.backgroundDark,
                        color: colors.lightPurple,
                        borderRadius: '12px',
                        _hover: {
                          background: colors.backgroundDark
                        },
                        span: {
                          textAlign: 'left'
                        }
                      }}
                      items={[
                        {
                          group: 'supply',
                          items: supplyList.map((v) => ({
                            label: formatCurrency(v),
                            value: v
                          }))
                        }
                      ]}
                      value={values.supply}
                      onValueChange={(val) => {
                        setFieldValue('supply', val)
                        setPoolData({ ...values, supply: val })
                      }}
                    />
                  </Box>

                  <Box color={colors.lightPurple} fontWeight="medium">
                    <Flex alignItems="center" gap={1} mb={3}>
                      <Text fontSize={['sm', 'md']}>{wSolToSolString(configInfo?.mintInfoB.symbol ?? 'SOL')} Raised</Text>
                      <Tooltip
                        hasArrow
                        placement="top"
                        label={'Amount of SOL before triggering graduation and migrating liquidity to the AMM. Min of 30 SOL'}
                      >
                        <HelpCircle size={12} color={colors.lightPurple} />
                      </Tooltip>
                    </Flex>
                    <NumberInput
                      variant="input"
                      name="solRaised"
                      value={values.solRaised}
                      onChange={(val) => {
                        setFieldValue('solRaised', val)
                        setPoolData({ ...values, solRaised: val })
                      }}
                      onBlur={handleBlur}
                      parse={handleParseVal(configInfo?.mintInfoB.decimals ?? 9)}
                      width="100%"
                      height={['3.125rem', '3.75rem']}
                      borderRadius="12px"
                    >
                      <NumberInputField
                        width="100%"
                        pr={4}
                        height={['3.125rem', '3.75rem']}
                        borderRadius="12px"
                        border={`1px solid ${touched['solRaised'] && errors.solRaised ? '#FF4EA3' : 'transparent'}`}
                        fontSize="xl"
                        placeholder=">= 30"
                      />
                    </NumberInput>
                    {touched['solRaised'] && errors.solRaised ? (
                      <Text variant="error" mt="1">
                        {errors.solRaised}
                      </Text>
                    ) : null}
                  </Box>
                </Grid>

                <Grid
                  gridTemplateColumns={[
                    'minmax(0, 0.95fr) minmax(0, 0.95fr) minmax(0, 0.95fr)',
                    'minmax(0, 1.4fr) minmax(0, 1.4fr) minmax(0, 1.4fr)'
                  ]}
                  gap={3}
                >
                  <Box color={colors.lightPurple} fontWeight="medium">
                    <Flex alignItems="center" gap={1} mb={3}>
                      <Text fontSize={['sm', 'md']}>Bonding Curve</Text>
                      <Tooltip
                        hasArrow
                        placement="top"
                        label={
                          'Set the amount of tokens that will be sold on the bonding curve (min 51% - max 80%) Remaining tokens are migrated to AMM pool upon graduation.'
                        }
                      >
                        <HelpCircle size={12} color={colors.lightPurple} />
                      </Tooltip>
                    </Flex>
                    <InputGroup
                      background={colors.backgroundDark}
                      borderRadius="12px"
                      width="100%"
                      border={`1px solid ${touched['tokenSoldPercent'] && errors.tokenSoldPercent ? '#FF4EA3' : 'transparent'}`}
                    >
                      <NumberInput
                        variant="input"
                        name="tokenSoldPercent"
                        value={values.tokenSoldPercent}
                        onChange={(val) => {
                          setFieldValue('tokenSoldPercent', val)
                          // setPoolData({ ...values, tokenSoldPercent: val })
                        }}
                        onBlur={(e) => {
                          handleBlur(e)
                          setPoolData({ ...values, tokenSoldPercent: e.currentTarget.value })
                        }}
                        parse={handleParseVal(decimalA)}
                        width="100%"
                        height={['3.125rem', '3.75rem']}
                        borderRadius="12px"
                      >
                        <NumberInputField
                          width="100%"
                          height={['3.125rem', '3.75rem']}
                          pr={4}
                          borderRadius="12px"
                          fontSize="xl"
                          placeholder="min 51% - max 80%"
                        />
                      </NumberInput>
                      <InputRightAddon
                        height={['3.125rem', '3.75rem']}
                        children="%"
                        background="transparent"
                        borderColor="transparent"
                        color={colors.textPrimary}
                      />
                    </InputGroup>
                    {touched['tokenSoldPercent'] && errors.tokenSoldPercent ? (
                      <Text variant="error" mt="1">
                        {errors.tokenSoldPercent}
                      </Text>
                    ) : null}
                    {!errors.tokenSoldPercent ? (
                      <Text color="#8C6EEF" fontSize={['xs', 'sm']} mt="1">
                        {formatCurrency(
                          new Decimal(values.supply || 0)
                            .mul(values.tokenSoldPercent || 0)
                            .div(100)
                            .toFixed(0)
                        )}{' '}
                        {values.ticker}
                      </Text>
                    ) : null}
                  </Box>

                  <Box color={colors.lightPurple} fontWeight="medium">
                    <Flex alignItems="center" gap={1} mb={3}>
                      <Text fontSize={['sm', 'md']}>Pool Migration</Text>
                      <Tooltip hasArrow placement="top" label={'Remaining tokens will be migrated to AMM pool upon graduation.'}>
                        <HelpCircle size={12} color={colors.lightPurple} />
                      </Tooltip>
                    </Flex>
                    <InputGroup background={colors.backgroundDark} borderRadius="12px" width="100%" border={`1px solid transparent`}>
                      <NumberInput
                        variant="input"
                        value={
                          values.tokenSoldPercent || values.lockedPercent
                            ? new Decimal(100)
                                .sub(values.tokenSoldPercent || '0')
                                .sub(values.lockedPercent || '0')
                                .clampedTo(0, 100)
                                .toDecimalPlaces(2)
                                .toString()
                            : ''
                        }
                        parse={handleParseVal(2)}
                        width="100%"
                        height={['3.125rem', '3.75rem']}
                        borderRadius="12px"
                      >
                        <NumberInputField
                          width="100%"
                          height={['3.125rem', '3.75rem']}
                          pr={4}
                          cursor="default"
                          _focusVisible={{ bg: 'inherit', border: 'inherit' }}
                          _hover={{ bg: 'inherit' }}
                          _focus={{ border: 'inherit' }}
                          borderRadius="12px"
                          fontSize="xl"
                          placeholder=""
                          readOnly
                        />
                      </NumberInput>
                      <InputRightAddon
                        height={['3.125rem', '3.75rem']}
                        children="%"
                        background="transparent"
                        borderColor="transparent"
                        color={colors.textPrimary}
                      />
                    </InputGroup>
                    <Text color="#8C6EEF" fontSize={['xs', 'sm']} mt="1">
                      {formatCurrency(
                        new Decimal(values.tokenSoldPercent || values.lockedPercent ? 100 : 0)
                          .sub(values.tokenSoldPercent || '0')
                          .sub(values.lockedPercent || '0')
                          .clampedTo(0, 100)
                          .div(100)
                          .mul(values.supply)
                          .toFixed(0)
                      ) + ` ${values.ticker}`}
                    </Text>
                  </Box>

                  <Box color={colors.lightPurple} fontWeight="medium">
                    <Flex alignItems="center" gap={1} mb={3}>
                      <Text fontSize={['sm', 'md']}>Vesting</Text>
                      <Tooltip
                        hasArrow
                        placement="top"
                        label={'Set the percentage of tokens that will be locked and vested. Maximum of 30% of supply can be locked.'}
                      >
                        <HelpCircle size={12} color={colors.lightPurple} />
                      </Tooltip>
                    </Flex>
                    <InputGroup
                      background={colors.backgroundDark}
                      borderRadius="12px"
                      width="100%"
                      border={`1px solid ${lockError || errors.lockedPercent ? '#FF4EA3' : 'transparent'}`}
                    >
                      <NumberInput
                        variant="input"
                        name="lockedPercent"
                        value={values.lockedPercent}
                        onChange={(val) => {
                          setFieldValue('lockedPercent', val)
                          setPoolData({ ...values, lockedPercent: val })
                        }}
                        onBlur={handleBlur}
                        parse={handleParseVal(2)}
                        width="100%"
                        height={['3.125rem', '3.75rem']}
                        borderRadius="12px"
                      >
                        <NumberInputField
                          width="100%"
                          height={['3.125rem', '3.75rem']}
                          pr={4}
                          borderRadius="12px"
                          fontSize="xl"
                          placeholder="<= 30"
                          _focus={{ border: lockError || errors.lockedPercent ? 'none' : undefined }}
                        />
                      </NumberInput>
                      <InputRightAddon
                        height={['3.125rem', '3.75rem']}
                        children="%"
                        background="transparent"
                        borderColor="transparent"
                        color={colors.textPrimary}
                      />
                    </InputGroup>

                    {errors.lockedPercent ? (
                      <Text variant="error" display="block" mt="2" mb="2">
                        {errors.lockedPercent}
                      </Text>
                    ) : lockError ? (
                      <Text variant="error" display="block" mt="2" mb="2">
                        {lockError}
                      </Text>
                    ) : (
                      <Text color="#8C6EEF" fontSize={['xs', 'sm']} mt="1">
                        {formatCurrency(new Decimal(values.lockedPercent || '0').div(100).mul(values.supply).toFixed(0)) +
                          ` ${values.ticker}`}
                      </Text>
                    )}
                  </Box>
                </Grid>

                <Box>
                  <Flex
                    justifyContent="space-between"
                    p={2}
                    mt={4}
                    alignItems="center"
                    borderRadius="8px"
                    background="#ABC4FF12"
                    border="1px solid #BFD2FF1A"
                  >
                    <Flex alignItems="center" gap={1} lineHeight="20px">
                      <Text color={colors.lightPurple} fontWeight="medium">
                        Creator LP fee share
                      </Text>
                      <Tooltip
                        hasArrow
                        placement="top"
                        label={`After the token graduates, token creators can claim ${
                          platformInfo ? (Number(platformInfo.creatorScale) / 1000000) * 100 : 10
                        }% of LP fees from AMM pool trades.`}
                      >
                        <HelpCircle size={12} color={colors.lightPurple} />
                      </Tooltip>
                    </Flex>
                    <Switch
                      isChecked={isPostMigrationFeeShare}
                      onChange={() => {
                        setIsPostMigrationFeeShare(!isPostMigrationFeeShare)
                        setMigrateType(isPostMigrationFeeShare ? 'amm' : 'cpmm')
                      }}
                      _checked={{
                        '.chakra-switch__track': {
                          bg: '#8C6EEF'
                        },
                        '.chakra-switch__thumb': {
                          bg: colors.lightPurple
                        }
                      }}
                    />
                  </Flex>
                  {new Decimal(values.lockedPercent || 0).gt(0) ? (
                    <>
                      <Flex alignItems="center" width="100%" my={4}>
                        <Divider variant="dashed" flex="1" borderColor={colors.lightPurple} />
                        <Text color={colors.lightPurple} fontSize="sm" textAlign="center" fontWeight="medium" flexShrink={0} mx={3}>
                          Vesting criteria for locked tokens
                        </Text>
                        <Divider variant="dashed" flex="1" borderColor={colors.lightPurple} />
                      </Flex>
                      <Flex alignItems="center" mb={2} gap={1}>
                        <Text color={colors.lightPurple} fontSize={['sm', 'md']}>
                          Vesting Duration
                        </Text>
                        <Tooltip hasArrow placement="top" label={'The number of days after vesting starts until vesting ends.'}>
                          <HelpCircle size={12} color={colors.lightPurple} />
                        </Tooltip>
                      </Flex>
                      <Grid templateColumns="2fr 2.4fr" gap={3} mb={4}>
                        <NumberInput
                          variant="input"
                          name="vestingDuration"
                          value={values.vestingDuration}
                          onChange={(val) => {
                            setFieldValue('vestingDuration', val)
                            setPoolData({ ...values, vestingDuration: Number(val || 0) })
                          }}
                          onBlur={handleBlur}
                          parse={handleParseVal(0)}
                          height={['3.125rem', '3.75rem']}
                          borderRadius="8px"
                        >
                          <NumberInputField width="100%" height={['3.125rem', '3.75rem']} borderRadius="12px" fontSize="xl" />
                        </NumberInput>
                        <DropdownSelectMenu
                          triggerSx={{
                            width: '100%',
                            height: ['3.125rem', '3.75rem'],
                            background: colors.backgroundDark,
                            color: colors.textSecondary,
                            borderRadius: '12px',
                            _hover: {
                              background: colors.backgroundDark
                            },
                            span: {
                              textAlign: 'left'
                            }
                          }}
                          items={[
                            {
                              group: '',
                              items: [
                                {
                                  label: 'Year',
                                  value: YEAR_SECONDS
                                },
                                {
                                  label: 'Month',
                                  value: MONTH_SECONDS
                                },
                                {
                                  label: 'Week',
                                  value: WEEK_SECONDS
                                },
                                {
                                  label: 'Day',
                                  value: DAY_SECONDS
                                }
                              ]
                            }
                          ]}
                          value={vestingUnit}
                          onValueChange={setVestingUnit}
                        />
                      </Grid>
                      <Grid templateColumns="2fr 2.4fr" gap={3}>
                        <Box>
                          <Flex alignItems="center" mb={2} gap={1}>
                            <Text color={colors.lightPurple} fontSize={['sm', 'md']}>
                              Cliff
                            </Text>
                            <Tooltip
                              hasArrow
                              placement="top"
                              label={'The number of days after token migrates before locked tokens start vesting. (optional)'}
                            >
                              <HelpCircle size={12} color={colors.lightPurple} />
                            </Tooltip>
                          </Flex>
                          {isCliffEnabled ? (
                            <NumberInput
                              variant="input"
                              name="cliff"
                              value={values.cliff}
                              onChange={(val) => {
                                setFieldValue('cliff', val)
                                setPoolData({ ...values, cliff: Number(val || 0) })
                              }}
                              onBlur={handleBlur}
                              parse={handleParseVal(0)}
                              height={['3.125rem', '3.75rem']}
                              borderRadius="8px"
                            >
                              <NumberInputField width="100%" height={['3.125rem', '3.75rem']} borderRadius="12px" fontSize="xl" />
                            </NumberInput>
                          ) : null}
                        </Box>
                        <Box textAlign="end">
                          <Switch
                            isChecked={isCliffEnabled}
                            onChange={() => {
                              setIsCliffEnabled(!isCliffEnabled)
                              if (isCliffEnabled) setFieldValue('cliff', '')
                            }}
                            _checked={{
                              '.chakra-switch__track': {
                                bg: '#8C6EEF'
                              },
                              '.chakra-switch__thumb': {
                                bg: colors.lightPurple
                              }
                            }}
                            mb={2}
                          />
                          {isCliffEnabled ? (
                            <DropdownSelectMenu
                              triggerSx={{
                                width: '100%',
                                height: ['3.125rem', '3.75rem'],
                                background: colors.backgroundDark,
                                color: colors.textSecondary,
                                borderRadius: '12px',
                                _hover: {
                                  background: colors.backgroundDark
                                },
                                span: {
                                  textAlign: 'left'
                                }
                              }}
                              items={[
                                {
                                  group: '',
                                  items: [
                                    {
                                      label: 'Year',
                                      value: YEAR_SECONDS
                                    },
                                    {
                                      label: 'Month',
                                      value: MONTH_SECONDS
                                    },
                                    {
                                      label: 'Week',
                                      value: WEEK_SECONDS
                                    },
                                    {
                                      label: 'Day',
                                      value: DAY_SECONDS
                                    }
                                  ]
                                }
                              ]}
                              value={cliffUnit}
                              onValueChange={setCliffUnit}
                            />
                          ) : null}
                        </Box>
                      </Grid>
                    </>
                  ) : null}
                </Box>
                <Flex direction="column" mt={2} gap={3}>
                  <Text color={colors.semanticWarning} fontSize="sm" fontWeight="medium">
                    {t('launchpad.token_creation_note')}
                  </Text>
                  <Button size="lg" type="submit" isDisabled={isSignIn && !configInfo}>
                    {isSignIn ? t('launchpad.create_token') : t('launchpad.sign_in_create_token')}
                  </Button>
                </Flex>
              </Box>
            </Flex>
          </form>
        )}
      </Formik>
      {isMobile ? (
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg={colors.backgroundLight}
          borderTopRadius="24px"
          border="1px solid #BFD2FF80"
          pt={4}
          pb={5}
          onClick={() => openDialog(DialogTypes.CurvePreview({ data }))}
        >
          <Box width={16} height={1} borderRadius="4px" background="rgba(191, 210, 255, 0.5)" margin="auto"></Box>
          <Flex justifySelf="center" alignItems="center" gap="6px" mt={4}>
            <Text fontSize="sm" fontWeight="medium" color={colors.lightPurple}>
              Curve Preview
            </Text>
            <CurvePreviewIcon />
          </Flex>
        </Box>
      ) : (
        <Flex direction="column" gap={5} width="100%">
          <Box px={[0, '10px']} py="10px" borderRadius="12px" background={colors.backgroundLight}>
            <Text color={colors.lightPurple} fontSize={['xs', 'md']} fontWeight="medium" mb={3} textAlign={['center', 'start']}>
              Curve Preview
            </Text>
            <CurveAreaChart data={data} isLoading={false} />
            <Text color={colors.lightPurple} fontSize={['2xs', 'xs']} opacity={0.5} textAlign="center" mt={3} mb={4}>
              Token Supply
            </Text>
            <Grid
              templateColumns={['repeat(2, 150px)', 'repeat(2, 200px)']}
              justifyContent="center"
              columnGap={7}
              rowGap={1}
              fontSize={['2xs', 'xs']}
            >
              <Flex justifyContent="space-between">
                <Flex alignItems="center">
                  <Box width="8px" height="8px" borderRadius="50%" bg="white" mr={2} />
                  <Text color={colors.lightPurple}>Starting MC</Text>
                </Flex>
                <Text color={colors.lightPurple}>$100.00</Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Flex alignItems="center">
                  <Box width="8px" height="8px" borderRadius="50%" bg="#22D1F8" mr={2} />
                  <Text color={colors.lightPurple}>Migration MC</Text>
                </Flex>
                <Text color={colors.lightPurple}>$100,000.00</Text>
              </Flex>
            </Grid>
          </Box>
          <Box p={6} borderRadius="12px" backgroundColor={colors.backgroundLight}>
            <Flex alignItems="center" mb={3}>
              <Box mr={3}>
                <Info size={16} color={colors.lightPurple} />
              </Box>
              <Text color={colors.lightPurple} fontSize="sm" fontWeight="medium">
                Please Note
              </Text>
            </Flex>
            <Text color="#C4D6FF80" fontSize="sm">
              This tool is for advanced users. Before changing launch parameters, make sure to go through the{' '}
              <Link
                color="#22D1F8"
                target="_blank"
                href="https://docs.raydium.io/raydium/pool-creation/launchlab/create-a-token"
                textDecoration="underline"
              >
                detailed guide
              </Link>
              .
            </Text>
          </Box>
        </Flex>
      )}
      <CompleteInfoModel isOpen={isOpen} onClose={onClose} />
    </Grid>
  )
}

const TabContent = memo(
  ({
    value = Tab.JustSendIt,
    onValueChange,
    items = [],
    slotTabRight,
    slotToolbar,
    sx
  }: {
    value: Tab
    onValueChange?: ((value: Tab) => void) | undefined
    items: TabItem<Tab>[]
    slotTabRight?: ReactNode
    slotToolbar?: React.ReactNode
    sx?: SystemStyleObject
  }) => {
    const currentItem = items.find((item) => item.value === value)
    const tabItems = useMemo(
      () =>
        items.map((item) => ({
          label: item.label,
          value: item.value
        })),
      [items]
    )

    const onTabChange = (tabId: Tab) => {
      if (onValueChange) {
        onValueChange(tabId)
      }
    }

    return (
      <Grid templateRows="auto 1fr">
        <Box overflow="auto" minH="40px">
          <Flex justifyContent="center">
            <Tabs size="md" variant="rounded" items={tabItems} value={value} onChange={onTabChange} sx={sx} />
            {slotTabRight}
          </Flex>
          {(currentItem?.slotToolbar ?? slotToolbar) && (
            <Flex alignItems="center" mt={2}>
              {currentItem?.slotToolbar ?? slotToolbar}
            </Flex>
          )}
        </Box>
        <Grid
          templateAreas="'stack'"
          sx={{
            '& > *': {
              gridArea: 'stack'
            }
          }}
        >
          {currentItem?.content}
        </Grid>
      </Grid>
    )
  }
)

const FileAvatar = ({ file, name }: { file: File | null | undefined; name: string }) => {
  const url = useObjectUrl(file)
  return <Avatar width={7} height={7} src={url || undefined} name={name || 'Token image'} />
}
