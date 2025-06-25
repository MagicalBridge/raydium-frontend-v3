export const getSavedResolution = ({ savedConfig }: { savedConfig?: object }): string | null => {
  // @ts-expect-error known
  const sources = (savedConfig?.charts ?? []).flatMap((chart: { panes: any[] }) => chart.panes.flatMap((pane) => pane.sources))

  const savedResolution = sources.find((source: { type: string; state: { interval: string | null } }) => source.type === 'MainSeries')
    ?.state?.interval

  return savedResolution ?? undefined
}

export const initPoolPriceDecimal = 0.00000002799381608423
