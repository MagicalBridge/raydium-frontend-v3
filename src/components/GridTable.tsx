import React, { Key, useCallback, useMemo } from 'react'
import { Box, Grid, Flex, SystemStyleObject, Skeleton } from '@chakra-ui/react'

type ColumnStaticSize = number | `${number}` | `${number}%`
type ColumnDynamicSize = `${number}fr`
type ColumnSize = ColumnStaticSize | ColumnDynamicSize

// eslint-disable-next-line @typescript-eslint/ban-types
type BaseTableRowData = {}
export type ColumnDef<TableRowData extends BaseTableRowData> = {
  columnKey: string
  label: React.ReactNode
  colspan?: number
  childColumns?: ColumnDef<TableRowData>[]
  renderCell: (row: TableRowData) => React.ReactNode
  isActionable?: boolean
  width?: ColumnSize
  align?: 'start' | 'center' | 'end'
}

export type TableElementProps<TableRowData extends BaseTableRowData> = {
  label?: string
  columns: ColumnDef<TableRowData>[]
  data: Array<TableRowData>
  getRowKey: (rowData: TableRowData, rowIndex?: number) => Key
  getRowAttributes?: (rowData: TableRowData, rowIndex: number) => Record<string, any>
  onRowAction?: (key: Key, row: TableRowData) => void
  slotEmpty?: React.ReactNode
}

export type TableStyleProps = {
  isLoading?: boolean
  sx?: SystemStyleObject
  headerRowSx?: SystemStyleObject
}

export type AllTableProps<TableRowData extends BaseTableRowData> = TableElementProps<TableRowData> &
  TableStyleProps & { style?: { [customProp: string]: number } }

export const GridTable = <TableRowData extends BaseTableRowData>({
  label = '',
  columns,
  data = [],
  getRowKey,
  getRowAttributes,
  onRowAction,
  isLoading = false,
  slotEmpty,
  sx,
  headerRowSx
}: AllTableProps<TableRowData>) => {
  const templateColumns = useMemo(() => {
    return columns.map((col) => col.width || '1fr').join(' ')
  }, [columns])

  const internalGetRowKey = useCallback(
    (row: TableRowData) => {
      return getRowKey(row)
    },
    [getRowKey]
  )

  const items = data
  const isEmpty = !isLoading && data.length === 0

  return (
    <Grid
      minWidth="max-content"
      flex="1 1 0%"
      overflow="clip"
      scrollSnapAlign="start"
      scrollMarginTop={0}
      scrollMarginBottom={0}
      scrollMarginLeft={0}
      scrollMarginRight={0}
      sx={{
        gridTemplateAreas: `"stack"`,
        '> *': {
          gridArea: 'stack'
        },
        '&:before, &:after': {
          gridArea: 'stack'
        }
      }}
    >
      {!isEmpty ? (
        <Grid
          templateColumns={templateColumns}
          sx={{
            '--table-row-height': '2rem',
            ...sx
          }}
          overflow="auto"
          scrollBehavior="smooth"
          overscrollBehavior="contain"
          aria-label={label}
          role="grid"
        >
          <Grid role="row" gridColumn="1 / -1" templateColumns="subgrid" alignItems="center" sx={headerRowSx}>
            {columns.map((column, colIndex) => (
              <Flex role="columnheader" key={column.columnKey} alignItems="center" justifyContent={column.align || 'flex-start'}>
                {column.label}
              </Flex>
            ))}
          </Grid>
          {isLoading
            ? Array(5)
                .fill(0)
                .map((_, index) => (
                  <Box key={`skeleton-${index}`} display="contents" cursor="wait">
                    <Grid
                      key={index}
                      gridColumn="1 / -1"
                      templateColumns="subgrid"
                      height="var(--table-row-height)"
                      alignItems="center"
                      {...getRowAttributes?.(_, index)}
                      sx={{
                        // contentVisibility: 'auto',
                        containIntrinsicWidth: 'auto',
                        containIntrinsicHeight: `auto 68px`,
                        minHeight: 'var(--table-row-height)',
                        opacity: Math.max(0, 1 - index / 5)
                      }}
                    >
                      {columns.map((column) => (
                        <Flex
                          key={`skeleton-${index}-${column.columnKey}`}
                          alignItems="center"
                          justifyContent={column.align || 'flex-start'}
                        >
                          <Skeleton width="3rem" height="1.25rem" />
                        </Flex>
                      ))}
                    </Grid>
                  </Box>
                ))
            : items.map((item, rowIndex) => (
                <Grid
                  role="row"
                  key={internalGetRowKey(item)}
                  {...getRowAttributes?.(item, rowIndex)}
                  gridColumn="1 / -1"
                  templateColumns="subgrid"
                  alignItems="center"
                  height="var(--table-row-height)"
                >
                  {columns.map((column) => (
                    <Flex
                      role="gridcell"
                      key={`${internalGetRowKey(item)}-${column.columnKey}`}
                      alignItems="center"
                      justifyContent={column.align || 'flex-start'}
                      aria-colindex={columns.findIndex((col) => col.columnKey === column.columnKey) + 1}
                    >
                      {column.renderCell(item)}
                    </Flex>
                  ))}
                </Grid>
              ))}
        </Grid>
      ) : (
        <Grid
          gridAutoFlow="row"
          gridTemplateColumns="minmax(0, 1fr)"
          height="100%"
          justifyItems="center"
          alignContent="center"
          padding="4rem"
        >
          {slotEmpty}
        </Grid>
      )}
    </Grid>
  )
}
