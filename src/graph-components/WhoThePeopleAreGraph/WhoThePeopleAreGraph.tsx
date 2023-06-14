'use client'

import { Box } from '@components/Box'
import { GraphTitle } from '@components/GraphTitle'
import { GraphError } from '@components/GraphError'
import { GraphLoading } from '@components/GraphLoading'
import { useCampaignQuery } from '@hooks/use-campaign'
import { SelectSingleValue } from '@components/SelectSingleValue'
import { Option } from '@types'
import { Controller, useForm } from 'react-hook-form'
import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod/dist/zod'
import { WhoThePeopleAre, whoThePeopleAreSchema } from '@schemas/who-the-people-are'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from 'recharts'
import { DashboardName } from '@enums'
import { classNames, niceNum } from '@utils'
import { IHistogramData } from '@interfaces'
import { getCampaignWhoThePeopleAreOptions } from '@services/wra-dashboard-api'

interface IWhoThePeopleAreGraphProps {
    dashboard: string
}

interface ICustomTooltip extends TooltipProps<number, string> {
    dashboard: string
    hoveredBarDataKey: MutableRefObject<string>
    showTooltip: boolean
}

export const WhoThePeopleAreGraph = ({ dashboard }: IWhoThePeopleAreGraphProps) => {
    const { data, isError } = useCampaignQuery(dashboard)
    const [currentHistogramData, setCurrentHistogramData] = useState<IHistogramData[]>([])
    const hoveredBarDataKey = useRef<string>(undefined as any)
    const [showTooltip, setShowTooltip] = useState<boolean>(false)
    const [paragraph, setParagraph] = useState<string>('')
    const [options, setOptions] = useState<Option<string>[]>([])

    // Fetch options
    useEffect(() => {
        getCampaignWhoThePeopleAreOptions(dashboard)
            .then((options) => setOptions(options))
            .catch(() => {})
    }, [dashboard])

    // Form
    const form = useForm<WhoThePeopleAre>({
        resolver: zodResolver(whoThePeopleAreSchema),
    })

    // Watch field showBreakdownBy
    const showBreakdownBy = form.watch('show_breakdown_by')

    // Set default value for show_breakdown_by
    useEffect(() => {
        if (options.length > 0) {
            form.setValue('show_breakdown_by', options[0].value)
        }
    }, [form, options])

    // Container height
    const containerHeight = useMemo(() => {
        if (!showBreakdownBy) return 0

        switch (showBreakdownBy) {
            case 'breakdown-age':
                return 550
            case 'breakdown-gender':
                return 500
            default:
                return 1100
        }
    }, [showBreakdownBy])

    // Set bars fill
    let bar1Fill: string
    let bar2Fill: string
    switch (dashboard) {
        case DashboardName.WHAT_YOUNG_PEOPLE_WANT:
            bar1Fill = 'var(--pmnchPrimary)'
            bar2Fill = 'var(--pmnchSecondary)'
            break
        default:
            bar1Fill = 'var(--defaultTertiary)'
            bar2Fill = 'var(--defaultSecondary)'
    }

    // Display breakdown
    const displayBreakdown = useCallback(() => {
        if (data && showBreakdownBy) {
            let histogramData: IHistogramData[]
            switch (showBreakdownBy) {
                case 'breakdown-age':
                    histogramData = data.histogram.age
                    setParagraph('Number and ages of respondents.')
                    break
                case 'breakdown-gender':
                    histogramData = data.histogram.gender
                    setParagraph('Number and ages of respondents.')
                    break
                case 'breakdown-profession':
                    histogramData = data?.histogram.profession
                    setParagraph('Number and ages of respondents.')
                    break
                case 'breakdown-country':
                    histogramData = data.histogram.canonical_country
                    setParagraph('Countries respondents are located in.')
                    break
                default:
                    histogramData = []
            }

            // Set count 2 values as negative
            for (const datum of histogramData) {
                datum.count_2 = -datum.count_2
            }

            setCurrentHistogramData(histogramData)
        }
    }, [data, showBreakdownBy])

    useEffect(() => {
        displayBreakdown()
    }, [displayBreakdown])

    // Return all numbers as positive
    function xAxisFormatter(item: number) {
        return Math.abs(item).toString()
    }

    // Determine the max value for the x-axis
    // TODO: fix nice num
    const getMaxValueX = useMemo(() => {
        if (currentHistogramData.length < 1) return 0

        // Find the max value for count_1
        const count1Max = Math.abs(
            currentHistogramData.reduce((prev, curr) => (prev.count_1 > curr.count_1 ? prev : curr)).count_1
        )

        // Find the lowest value for count_2 (count_2 has negative numbers) and convert the number to positive
        const count2Max = Math.abs(
            currentHistogramData.reduce((prev, curr) => (prev.count_2 < curr.count_2 ? prev : curr)).count_2
        )

        return niceNum(Math.max(count1Max, count2Max), true)
    }, [currentHistogramData])

    // Legend formatter
    function legendFormatter(value: string) {
        if (data) {
            if (value == 'count_1') {
                return <span className="text-black">{data.filter_1_description}</span>
            }
            if (value == 'count_2') {
                return <span className="text-black">{data.filter_2_description} (normalized)</span>
            }
        }

        return null
    }

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

    // Set hovered bar data key
    function setHoveredBarDataKey(dataKey: string) {
        hoveredBarDataKey.current = dataKey
    }

    // Toggle showTooltip
    function toggleShowTooltip() {
        setShowTooltip((prev) => !prev)
    }

    // Display graph or not
    const displayGraph = data && currentHistogramData && showBreakdownBy

    return (
        <Box>
            <GraphTitle dashboard={dashboard} text="Who the people are" />
            <p>{paragraph}</p>

            {/* Error */}
            {!data && isError && <GraphError dashboard={dashboard} />}

            {/* Loading (only at first data fetch) */}
            {!displayGraph && !isError && <GraphLoading dashboard={dashboard} />}

            {/* Graph */}
            {displayGraph && (
                <div className="mt-3 flex flex-col">
                    {/* Select */}
                    <div className="w-full max-w-sm">
                        <Controller
                            name="show_breakdown_by"
                            control={form.control}
                            render={({ field: { onChange, value } }) => (
                                <SelectSingleValue
                                    id="select-show-breakdown-by"
                                    options={options}
                                    value={value}
                                    controllerRenderOnChange={onChange}
                                    customOnChange={displayBreakdown}
                                />
                            )}
                        />
                    </div>

                    {/* Bar chart */}
                    <div className="mb-3 mt-3 w-full">
                        <ResponsiveContainer height={containerHeight} className="bg-white">
                            <BarChart
                                data={currentHistogramData}
                                margin={{ top: 15, right: 35, left: 50, bottom: 15 }}
                                width={750}
                                layout="vertical"
                                barCategoryGap={5}
                                stackOffset="sign"
                            >
                                <Legend
                                    verticalAlign="top"
                                    formatter={(value) => legendFormatter(value)}
                                    wrapperStyle={{ paddingBottom: '1rem' }}
                                />
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
                                    width={150}
                                    interval={0}
                                />
                                <CartesianGrid strokeDasharray="0" stroke="#FFFFFF" />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={
                                        <CustomTooltip
                                            dashboard={dashboard}
                                            hoveredBarDataKey={hoveredBarDataKey}
                                            showTooltip={showTooltip}
                                        />
                                    }
                                    position={{ x: 25 }}
                                />

                                {/* Only display the legend if filters are not identical */}
                                {!data.filters_are_identical && <Legend />}

                                <Bar
                                    dataKey="count_1"
                                    stackId={0}
                                    fill={bar2Fill}
                                    minPointSize={5}
                                    onMouseOver={() => setHoveredBarDataKey('count_1')}
                                    onMouseEnter={toggleShowTooltip}
                                    onMouseLeave={toggleShowTooltip}
                                />

                                {!data.filters_are_identical && (
                                    <Bar
                                        dataKey="count_2"
                                        stackId={0}
                                        fill={bar1Fill}
                                        minPointSize={15}
                                        onMouseOver={() => setHoveredBarDataKey('count_2')}
                                        onMouseEnter={toggleShowTooltip}
                                        onMouseLeave={toggleShowTooltip}
                                    />
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </Box>
    )
}

const CustomTooltip = ({ active, payload, label, hoveredBarDataKey, showTooltip }: ICustomTooltip) => {
    if (active && payload && payload.length) {
        const data = payload.find((data) => data.dataKey === hoveredBarDataKey.current)
        if (data) {
            const value = data.value ? Math.abs(data.value) : ''

            return (
                <p
                    className={classNames(`border border-white p-1 text-sm text-white`, showTooltip ? '' : 'hidden')}
                    style={{ backgroundColor: data.color }}
                >
                    {`${label}, ${value}`}
                </p>
            )
        }
    }

    return null
}