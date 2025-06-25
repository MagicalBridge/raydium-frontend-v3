import { useState, useRef, useMemo } from 'react'
import { Box, Flex, Grid, Spinner, Text, Tooltip as ChakraTooltip } from '@chakra-ui/react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  Scatter,
  ComposedChart
} from 'recharts'
import { CategoricalChartProps } from 'recharts/types/chart/generateCategoricalChart'
import { colors } from '@/theme/cssVariables/colors'
import { formatCurrency } from '@/utils/numberish/formatter'

export interface Point {
  x: number
  y: number
  current?: number
}

export const CurveLineChart = ({
  data,
  current,
  margin,
  xKey = 'x',
  yKey = 'y',
  height,
  isLoading = false
}: {
  data: Point[]
  current?: number
  margin?: CategoricalChartProps['margin']
  xKey?: string
  yKey?: string
  height?: string
  isLoading?: boolean
}) => {
  const currentPoints = data.filter((d) => !!d.current)
  const currentPoint = currentPoints.length > 0 ? currentPoints[0] : null
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef(null)
  const isHovering = activeIndex !== -1

  return (
    <Box
      width="100%"
      height={height}
      overflow="hidden"
      position="relative"
      zIndex={1}
      sx={{
        '--chakra-zIndices-tooltip': '2'
      }}
    >
      {!isLoading && data.length > 0 ? (
        <Box background={colors.backgroundDark}>
          <ResponsiveContainer ref={containerRef} minWidth="330px" minHeight="175px">
            <ComposedChart
              data={data}
              margin={margin}
              style={{ padding: 0 }}
              onMouseMove={(e) => {
                if (e.activeTooltipIndex !== undefined) {
                  setActiveIndex(e.activeTooltipIndex)
                }
              }}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              <CartesianGrid stroke={colors.lightPurple} opacity={0.1} />
              <YAxis yAxisId="left" dataKey={yKey} tickMargin={8} domain={['auto', 'auto']} stroke="#BFD2FF80" tick={false} />
              <ReferenceLine y={0} yAxisId="left" strokeWidth={2} stroke={colors.lightPurple} opacity={0.2} />
              <XAxis type="number" dataKey={xKey} domain={['dataMin', 'dataMax']} stroke="#BFD2FF80" tickMargin={8} tick={false} />
              {/* <Scatter yAxisId="left" xAxisId="0" dataKey={yKey} name="red" fill="red" data={currentPoints} shape={<CustomLabel />} /> */}
              <Line
                yAxisId="left"
                data={data}
                dataKey={yKey}
                dot={false}
                strokeWidth={2}
                stroke="#8C6EEF"
                strokeDasharray="5 5"
                activeDot={{
                  r: 6,
                  fill: '#22D1F8',
                  stroke: 'transparent',
                  strokeWidth: 0
                }}
                type="monotone"
              />
              {currentPoint && (!isHovering || data[activeIndex]?.x !== currentPoint.x || data[activeIndex]?.y !== currentPoint.y) && (
                <ReferenceDot
                  x={currentPoint.x}
                  y={currentPoint.y}
                  yAxisId="left"
                  shape={
                    <CustomLabel
                      payload={currentPoint}
                      isHovering={isHovering}
                      total={data[data.length - 1].x}
                      containerRef={containerRef}
                    />
                  }
                />
              )}
              <Tooltip
                content={(props) => <CustomTooltip {...props} current={current} total={data[data.length - 1].x} />}
                cursor={{
                  stroke: colors.textSecondary,
                  opacity: 0.5,
                  strokeDasharray: '4'
                }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Grid
          gridTemplateAreas={`"stack"`}
          minWidth="328px"
          minHeight="180px"
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
          height="100%"
        >
          <Grid gridTemplateColumns="minmax(0,1fr)" minHeight="100%" placeItems="center">
            <Spinner thickness="4px" speed="0.65s" color={colors.textSecondary} size="xl" />
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

const CustomTooltip = ({ active, payload, current, total }: { active?: boolean; payload?: any[]; current?: number; total?: number }) => {
  if (active && payload?.length) {
    const data = payload[0]?.payload
    if (!data) return null
    return (
      <Flex direction="column" px={3} py={2} background={colors.tooltipBg} fontSize="xs" color={colors.textSecondary}>
        {current === data.y ? <Text>Current</Text> : null}
        <Text>Mkt Cap: {formatCurrency(data.y, { symbol: '$', abbreviated: true, decimalPlaces: 2 })} </Text>
        <Text>Tokens Remaining: {formatCurrency(total ? total - data.x : data.x, { decimalPlaces: 2, abbreviated: true })}</Text>
      </Flex>
    )
  }
  return null
}

const CustomLabel = ({ cx, cy, payload, isHovering, total, containerRef }: any) => {
  const marker = (
    <g>
      <circle cx={cx} cy={cy} r="6" fill="transparent" stroke="#22D1F8" strokeWidth="1" />
      <circle cx={cx} cy={cy} r="3" fill="#FFCC33" />
    </g>
  )

  const tooltipContent = useMemo(
    () => (
      <Flex direction="column" background={colors.tooltipBg} fontSize="xs" color={colors.textSecondary}>
        <Text>Current</Text>
        <Text>Mkt Cap: {formatCurrency(payload.y, { symbol: '$', abbreviated: true, decimalPlaces: 2 })} </Text>
        <Text>Tokens Remaining: {formatCurrency(total ? total - payload.x : payload.x, { decimalPlaces: 2, abbreviated: true })}</Text>
      </Flex>
    ),
    [payload.x, payload.y, total]
  )

  if (payload.current) {
    if (!isHovering) {
      return (
        <ChakraTooltip
          isOpen={true}
          placement="auto"
          label={tooltipContent}
          portalProps={{ containerRef }}
          modifiers={[
            {
              name: 'preventOverflow',
              options: {
                boundary: containerRef.current,
                altAxis: true,
                tether: false,
                rootBoundary: 'viewport',
                padding: 8
              }
            },
            {
              name: 'flip',
              options: {
                boundary: containerRef.current,
                fallbackPlacements: ['top', 'right', 'left']
              }
            }
          ]}
        >
          {marker}
        </ChakraTooltip>
      )
    }
    return marker
  }
  return <circle cx={0} cy={0} r="0" fill="transparent" />
}
