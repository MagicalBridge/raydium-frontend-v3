import { useRef, useEffect } from 'react'
import { Box, Flex, Grid, Spinner, Text } from '@chakra-ui/react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot, DotProps } from 'recharts'
import { colors } from '@/theme/cssVariables/colors'
import { formatCurrency } from '@/utils/numberish/formatter'

export interface Point {
  x: number
  price: number
  // percent: number
}

export const CurveAreaChart = ({ data, isLoading = false }: { data: Point[]; isLoading?: boolean }) => {
  const hasData = Array.isArray(data) && data.length > 0
  const firstPoint = hasData ? data[0] : null
  const lastPoint = hasData ? data[data.length - 1] : null
  const maxPrice = hasData ? lastPoint?.price ?? 1 : 1
  return (
    <Box width="100%" overflow="hidden">
      {!isLoading ? (
        <Box
          width="100%"
          height={['200px', '400px', '400px']}
          sx={{
            backgroundColor: colors.backgroundLight,
            '.recharts-cartesian-axis-tick > text': {
              fill: colors.textSecondary,
              opacity: 0.5,
              fontSize: '2xs'
            },
            '.recharts-label': {
              fill: colors.textSecondary,
              opacity: 0.5,
              fontSize: '2xs'
            }
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid stroke={colors.lightPurple} opacity={0.1} />
              <XAxis
                dataKey="x"
                domain={['dataMin', 'dataMax']}
                stroke="#BFD2FF80"
                tickFormatter={(value) => {
                  if (typeof value === 'number') {
                    return formatCurrency(value, { abbreviated: true })
                  }
                  return value.toString()
                }}
                tickMargin={8}
              />
              <YAxis
                yAxisId="left"
                stroke="#BFD2FF80"
                label={{
                  value: 'price(10^-7)',
                  angle: -90,
                  position: 'insideLeft'
                }}
                domain={[0, maxPrice * 1.05]}
                tickMargin={8}
                tickCount={6}
                tickFormatter={(val) => {
                  if (typeof val === 'number') {
                    return formatCurrency(val, { maximumDecimalTrailingZeroes: 4 })
                  }
                  return val.toString()
                }}
              />
              {/* <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#BFD2FF80"
                label={{ value: 'Percent Increase', angle: 90, position: 'insideRight' }}
                domain={[0, 1800]}
                tickFormatter={(value) => `${value}%`}
                tickMargin={8}
              /> */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="price"
                stroke="#8C6EEF"
                strokeDasharray="5 5"
                strokeWidth={4}
                fill="url(#curve-area-color)"
                dot={false}
                activeDot={CustomActiveDot}
              />
              <Tooltip
                content={(props) => <CustomTooltip {...props} />}
                cursor={{
                  stroke: colors.textSecondary,
                  opacity: 0.5,
                  strokeDasharray: '4'
                }}
              />
              <defs>
                <linearGradient id="curve-area-color" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(140, 110, 239, 0.5)" stopOpacity={1} />
                  <stop offset="100%" stopColor="rgba(140, 110, 239, 0.1)" stopOpacity={1} />
                </linearGradient>
              </defs>
              {firstPoint && <ReferenceDot x={firstPoint.x} y={firstPoint.price} yAxisId="left" r={6} fill="#ECF5FF" stroke="#8C6EEF" />}
              {lastPoint && <ReferenceDot x={lastPoint.x} y={lastPoint.price} yAxisId="left" r={6} fill="#22D1F8" stroke="#8C6EEF" />}
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Grid
          gridTemplateAreas={`"stack"`}
          width={['320px', '100%', '100%']}
          height="400px"
          sx={{
            '> *': {
              gridArea: 'stack'
            },
            '&:before, &:after': {
              gridArea: 'stack'
            }
          }}
          userSelect="none"
          pointerEvents="initial"
        >
          <Grid gridTemplateColumns="minmax(0,1fr)" minHeight="100%" placeItems="center">
            <Spinner thickness="4px" speed="0.65s" color={colors.textSecondary} size="xl" />
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload?.length) {
    const data = payload[0]?.payload
    const dateText = formatCurrency(data.price, { maximumDecimalTrailingZeroes: 4 })

    if (!data) return null

    return (
      <Flex
        direction="column"
        p={2}
        background="linear-gradient(0deg, #0B1022, #0B1022), linear-gradient(0deg, rgba(171, 196, 255, 0.04), rgba(171, 196, 255, 0.04))"
        boxShadow="0px 8px 48px 0px #4F53F31A"
        borderRadius="4px"
      >
        <Text mb={2}>{dateText}</Text>
      </Flex>
    )
  }
  return null
}

const CustomActiveDot = (props: unknown) => {
  const { cx = 0, cy = 0 } = props as DotProps
  return <ActiveDot x={cx} y={cy} stroke="#8884d8" />
}

const ActiveDot = ({
  x,
  y,
  stroke,
  size = 32,
  strokeWidth = 8,
  fill
}: {
  x: number
  y: number
  stroke: string
  size?: number
  strokeWidth?: number
  fill?: string
}) => {
  const radius = size / 2
  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.transform = 'scale(1)'
    }
  }, [])

  return (
    <svg
      x={x - radius}
      y={y - radius}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        ref={circleRef}
        style={{
          transition: 'transform 0.3s ease-in-out',
          transformOrigin: 'center center',
          transform: 'scale(0.3)'
        }}
        cx={radius}
        cy={radius}
        r={radius - strokeWidth / 2}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
      />
    </svg>
  )
}
