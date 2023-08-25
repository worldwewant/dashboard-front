'use client'

import { Box } from '@components/Box'
import { GraphTitle } from '@components/GraphTitle'
import { DashboardName } from '@enums'
import { useCampaignQuery } from '@hooks/use-campaign-query'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from 'recharts'
import { classNames, niceNum, toThousandsSep } from '@utils'
import { GraphLoading } from 'components/GraphLoading'
import { GraphError } from 'components/GraphError'
import { useTranslation } from '@app/i18n/client'
import { TDashboard } from '@types'
import React, { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import { ILivingSettingBreakdown } from '@interfaces'
import { useQuestionAskedCodeStore } from '@stores/question-asked-code'

interface ILivingSettingsBreakdownGraphProps {
    dashboard: TDashboard
    lang: string
}

interface ICustomTooltip extends TooltipProps<number, string> {
    dashboard: TDashboard
    hoveredBarDataKey: MutableRefObject<string>
    showTooltip: boolean
    lang: string
}

export const LivingSettingsBreakdownGraph = ({ dashboard, lang }: ILivingSettingsBreakdownGraphProps) => {
    const { data, isError } = useCampaignQuery(dashboard, lang)
    const [livingSettingsBreakdown, setLivingSettingsBreakdown] = useState<ILivingSettingBreakdown[]>([])
    const hoveredBarDataKey = useRef<string>(undefined as any)
    const [showTooltip, setShowTooltip] = useState<boolean>(false)
    const { t } = useTranslation(lang)

    // Set bars fill
    let bar1Fill: string
    let bar2Fill: string
    switch (dashboard) {
        case DashboardName.WHAT_YOUNG_PEOPLE_WANT:
            bar1Fill = 'var(--pmnchSecondary)'
            bar2Fill = 'var(--pmnchTertiary)'
            break
        default:
            bar1Fill = 'var(--defaultPrimary)'
            bar2Fill = 'var(--defaultTertiary)'
    }

    // Set bars classes
    let bar1Classes: string
    let bar2Classes: string
    switch (dashboard) {
        case DashboardName.WHAT_YOUNG_PEOPLE_WANT:
            bar1Classes = 'fill-pmnchColors-secondary hover:fill-pmnchColors-secondaryFaint'
            bar2Classes = 'fill-pmnchColors-tertiary hover:fill-pmnchColors-tertiaryFaint'
            break
        default:
            bar1Classes = 'fill-defaultColors-primary hover:fill-defaultColors-primaryFaint'
            bar2Classes = 'fill-defaultColors-tertiary hover:fill-defaultColors-tertiaryFaint'
    }

    // Format x-axis numbers
    function xAxisFormatter(item: number) {
        return toThousandsSep(Math.abs(item), lang).toString()
    }

    // Determine the max value for the x-axis
    const getMaxValueX = useMemo(() => {
        if (livingSettingsBreakdown.length < 1) return 0

        // Find the max value for count_1
        const count1Max = Math.abs(
            livingSettingsBreakdown.reduce((prev, curr) => (prev.count_1 > curr.count_1 ? prev : curr)).count_1
        )

        // Find the max value for count_2 (count_2 has negative numbers) and convert the number to positive
        const count2Max = Math.abs(
            livingSettingsBreakdown.reduce((prev, curr) => (prev.count_2 < curr.count_2 ? prev : curr)).count_2
        )

        return niceNum(Math.max(count1Max, count2Max), false)
    }, [livingSettingsBreakdown])

    // Domain for x-axis
    const xAxisDomain = useMemo(() => {
        if (data) {
            if (data.filters_are_identical) {
                return [0, getMaxValueX]
            } else {
                return [-getMaxValueX, getMaxValueX]
            }
        }
    }, [data, getMaxValueX])

    // Set living settings breakdown
    useEffect(() => {
        if (data) {
            const tmpLivingSettingsBreakdown = data.living_settings_breakdown

            // Set count 2 values as negative
            const tmpModifiedLivingSettingsBreakdown: ILivingSettingBreakdown[] = []
            for (const datum of tmpLivingSettingsBreakdown) {
                const tmpDatum = datum
                tmpDatum.count_2 = -tmpDatum.count_2
                tmpModifiedLivingSettingsBreakdown.push(tmpDatum)
            }

            setLivingSettingsBreakdown(tmpModifiedLivingSettingsBreakdown)
        }
    }, [data])

    // Legend formatter
    function legendFormatter(value: string) {
        if (data) {
            if (value === 'count_1') {
                return <span className="text-black">{data.filter_1_description}</span>
            }
            if (value === 'count_2') {
                return (
                    <span className="text-black">
                        {data.filter_2_description} ({t('normalized')})
                    </span>
                )
            }
        }

        return null
    }

    // Toggle showTooltip
    function toggleShowTooltip() {
        setShowTooltip((prev) => !prev)
    }

    // Set hovered bar data key
    function setHoveredBarDataKey(dataKey: string) {
        hoveredBarDataKey.current = dataKey
    }

    // Display graph or not
    const displayGraph = !!data && !!livingSettingsBreakdown

    return (
        <div>
            <Box>
                <div data-tooltip-id="responses-breakdown">
                    <GraphTitle dashboard={dashboard} text={t('living-settings')} />
                </div>

                {/* Error */}
                {!data && isError && <GraphError dashboard={dashboard} />}

                {/* Loading (only at first data fetch) */}
                {!displayGraph && !isError && <GraphLoading dashboard={dashboard} />}

                {/* Graph */}
                {displayGraph && (
                    <>
                        <div className="mt-3 flex flex-col">
                            {/* Bar chart */}
                            <div className="mb-3 mt-3 w-full">
                                <ResponsiveContainer height={400} className="bg-white">
                                    <BarChart
                                        data={livingSettingsBreakdown}
                                        margin={{ top: 15, right: 50, left: 10, bottom: 15 }}
                                        width={750}
                                        height={500}
                                        layout="vertical"
                                        barCategoryGap={5}
                                        stackOffset="sign"
                                    >
                                        {/* Only display the legend if filters are not identical */}
                                        {!data.filters_are_identical && (
                                            <Legend
                                                verticalAlign="top"
                                                formatter={(value) => legendFormatter(value)}
                                                wrapperStyle={{ paddingBottom: '1rem' }}
                                            />
                                        )}
                                        <XAxis
                                            type="number"
                                            axisLine={false}
                                            domain={xAxisDomain}
                                            tickFormatter={(item) => xAxisFormatter(item)}
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            width={450}
                                            interval={0}
                                        />
                                        <CartesianGrid strokeDasharray="0" stroke="#FFFFFF" />
                                        <RechartsTooltip
                                            cursor={{ fill: 'transparent' }}
                                            content={
                                                <CustomTooltip
                                                    dashboard={dashboard}
                                                    hoveredBarDataKey={hoveredBarDataKey}
                                                    showTooltip={showTooltip}
                                                    lang={lang}
                                                />
                                            }
                                            position={{ x: 25 }}
                                        />

                                        {/* Only display bar2 if filters are not identical */}
                                        {!data.filters_are_identical && (
                                            <Bar
                                                dataKey="count_2"
                                                className={classNames('hover:cursor-pointer', bar2Classes)}
                                                fill={bar2Fill}
                                                minPointSize={3}
                                                stackId={0}
                                                onMouseOver={() => setHoveredBarDataKey('count_2')}
                                                onMouseEnter={toggleShowTooltip}
                                                onMouseLeave={toggleShowTooltip}
                                            />
                                        )}
                                        <Bar
                                            dataKey="count_1"
                                            className={classNames('hover:cursor-pointer', bar1Classes)}
                                            fill={bar1Fill}
                                            minPointSize={3}
                                            stackId={0}
                                            onMouseOver={() => setHoveredBarDataKey('count_1')}
                                            onMouseEnter={toggleShowTooltip}
                                            onMouseLeave={toggleShowTooltip}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}
            </Box>
        </div>
    )
}

const CustomTooltip = ({ active, payload, label, hoveredBarDataKey, showTooltip, lang }: ICustomTooltip) => {
    if (active && payload && payload.length) {
        const data = payload.find((data) => data.dataKey === hoveredBarDataKey.current)
        if (data) {
            const value = data.value ? Math.abs(data.value) : 0

            return (
                <p
                    className={classNames(`border border-white p-1 text-sm text-white`, showTooltip ? '' : 'hidden')}
                    style={{ backgroundColor: data.color }}
                >
                    {`${label}, ${toThousandsSep(value, lang)}`}
                </p>
            )
        }
    }

    return null
}