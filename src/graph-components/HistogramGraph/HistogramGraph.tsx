/*
MIT License

Copyright (c) 2023 World We Want. Maintainers: Thomas Wood, https://fastdatascience.com, Zairon Jacobs, https://zaironjacobs.com.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

'use client'

import { Box } from '@components/Box'
import { GraphTitle } from '@components/GraphTitle'
import { GraphError } from '@components/GraphError'
import { Loading } from 'components/Loading'
import { useCampaignQuery } from '@hooks/use-campaign-query'
import { SelectSingleValue } from '@components/SelectSingleValue'
import { TOption } from '@types'
import { Controller, useForm, UseFormReturn } from 'react-hook-form'
import React, { MutableRefObject, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod/dist/zod'
import { histogramSchema, THistogram } from '@schemas/histogram'
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
import { LegacyDashboardName } from '@enums'
import { classNames, niceNum, toThousandsSep } from '@utils'
import { IHistogramData } from '@interfaces'
import { getCampaignHistogramOptions } from 'services/dashboard-api'
import { useTranslation } from '@app/i18n/client'
import { useQuery } from 'react-query'
import { useFilterFormsStore } from '@stores/filter-forms'
import { TFilter } from '@schemas/filter'
import { useCountriesStore } from '@stores/countries'
import { ParamsContext } from '@contexts/params'

interface ICustomTooltip extends TooltipProps<number, string> {
    dashboard: string
    hoveredBarDataKey: MutableRefObject<string>
    showTooltip: boolean
    lang: string
}

export const HistogramGraph = () => {
    const { params } = useContext(ParamsContext)
    const { dashboard, lang, config } = params
    const { data, isError, isLoading, isRefetching } = useCampaignQuery()
    const [histogramOptions, setHistogramOptions] = useState<TOption<string>[]>([])
    const { t } = useTranslation(lang)
    const [currentHistogramData, setCurrentHistogramData] = useState<IHistogramData[]>([])
    const hoveredBarDataKey = useRef<string>(undefined as any)
    const [showTooltip, setShowTooltip] = useState<boolean>(false)
    const [paragraph, setParagraph] = useState<string>('')
    const form1 = useFilterFormsStore((state) => state.form1)
    const form2 = useFilterFormsStore((state) => state.form2)
    const countries = useCountriesStore((state) => state.countries)

    // Fetch options
    const histogramOptionsQuery = useQuery<TOption<string>[]>({
        queryKey: [`${dashboard}-${lang}-histogram-options`],
        queryFn: () => getCampaignHistogramOptions(config.campaign_code, lang),
        refetchOnWindowFocus: false,
        retry: 3,
        onSuccess: () => {},
        onError: () => {},
        enabled: !!data,
    })

    // Only show options for histograms that contain data
    useEffect(() => {
        if (histogramOptionsQuery.data && data) {
            let options = histogramOptionsQuery.data
            if (dashboard === LegacyDashboardName.ALL_CAMPAIGNS) {
                if (data.histogram.age_buckets_default.length <= 1) {
                    options = options.filter((option) => option.value !== 'breakdown-age-bucket')
                }
            } else if (data.histogram.age_buckets.length <= 1) {
                options = options.filter((option) => option.value !== 'breakdown-age-bucket')
            }
            if (data.histogram.ages.length <= 1) {
                options = options.filter((option) => option.value !== 'breakdown-age')
            }
            if (data.histogram.genders.length <= 1) {
                options = options.filter((option) => option.value !== 'breakdown-gender')
            }
            if (data.histogram.professions.length <= 1) {
                options = options.filter((option) => option.value !== 'breakdown-profession')
            }
            if (data.histogram.canonical_countries.length <= 1) {
                options = options.filter((option) => option.value !== 'breakdown-country')
            }

            setHistogramOptions(options)
        }
    }, [histogramOptionsQuery.data, data, dashboard])

    // Form
    const form = useForm<THistogram>({
        resolver: zodResolver(histogramSchema),
    })

    // Watch field
    const displayBreakdownByField = form.watch('show_breakdown_by')

    // Set default value for show_breakdown_by
    useEffect(() => {
        if (form && histogramOptions.length > 0) {
            form.setValue('show_breakdown_by', histogramOptions[0].value)
        }
    }, [dashboard, form, histogramOptions])

    // Container height
    const containerHeight = useMemo(() => {
        if (!displayBreakdownByField) return 0
        switch (displayBreakdownByField) {
            case 'breakdown-age':
                if (dashboard === LegacyDashboardName.WHAT_YOUNG_PEOPLE_WANT) {
                    return 550
                }
                return 1900
            case 'breakdown-age-bucket':
                return 550
            case 'breakdown-gender':
                return 550
            default:
                return 1100
        }
    }, [dashboard, displayBreakdownByField])

    // Set bars fill
    let bar1Fill: string
    let bar2Fill: string
    switch (dashboard) {
        case LegacyDashboardName.WHAT_YOUNG_PEOPLE_WANT:
            bar1Fill = 'var(--pmnchSecondary)'
            bar2Fill = 'var(--pmnchTertiary)'
            break
        case LegacyDashboardName.WORLD_WE_WANT_DATA_EXCHANGE:
            bar1Fill = 'var(--dataExchangePrimary)'
            bar2Fill = 'var(--dataExchangeQuaternary)'
            break
        default:
            bar1Fill = 'var(--defaultPrimary)'
            bar2Fill = 'var(--defaultTertiary)'
    }

    // Set bars classes
    let bar1Classes: string
    let bar2Classes: string
    switch (dashboard) {
        case LegacyDashboardName.WHAT_YOUNG_PEOPLE_WANT:
            bar1Classes = 'fill-pmnchColors-secondary hover:fill-pmnchColors-secondaryFaint'
            bar2Classes = 'fill-pmnchColors-tertiary hover:fill-pmnchColors-tertiaryFaint'
            break
        case LegacyDashboardName.WORLD_WE_WANT_DATA_EXCHANGE:
            bar1Classes = 'fill-dataExchangeColors-primary hover:fill-dataExchangeColors-secondary'
            bar2Classes = 'fill-dataExchangeColors-quaternary hover:fill-dataExchangeColors-quaternaryFaint'
            break
        default:
            bar1Classes = 'fill-defaultColors-primary hover:fill-defaultColors-primaryFaint'
            bar2Classes = 'fill-defaultColors-tertiary hover:fill-defaultColors-tertiaryFaint'
    }

    // Set histogram data
    useEffect(() => {
        if (data && displayBreakdownByField) {
            let histogramData: IHistogramData[]
            switch (displayBreakdownByField) {
                case 'breakdown-age':
                    histogramData = data.histogram.ages
                    setParagraph(t('number-ages-respondents'))
                    break
                case 'breakdown-age-bucket':
                    if (dashboard === LegacyDashboardName.ALL_CAMPAIGNS) {
                        histogramData = data.histogram.age_buckets_default
                        setParagraph(t('number-ages-respondents'))
                    } else {
                        histogramData = data.histogram.age_buckets
                        setParagraph(t('number-ages-respondents'))
                    }
                    break
                case 'breakdown-gender':
                    histogramData = data.histogram.genders
                    setParagraph(t('number-ages-respondents'))
                    break
                case 'breakdown-profession':
                    histogramData = data.histogram.professions
                    setParagraph(t('number-ages-respondents'))
                    break
                case 'breakdown-country':
                    histogramData = data.histogram.canonical_countries
                    setParagraph(t('countries-respondents-located-in'))
                    break
                default:
                    histogramData = []
            }

            // Set count 2 values as negative
            for (const datum of histogramData) {
                datum.count_2 = -Math.abs(datum.count_2)
            }

            setCurrentHistogramData(histogramData)
        }
    }, [dashboard, data, displayBreakdownByField, t])

    // Set form value
    function setFormValue(form: UseFormReturn<TFilter>, payload: any) {
        const data = payload?.payload as IHistogramData
        if (data?.value) {
            let currentFormValues: string[] = []
            switch (displayBreakdownByField) {
                case 'breakdown-age':
                    currentFormValues = form.getValues('ages')
                    if (!currentFormValues.includes(data.value)) {
                        form.setValue('ages', [...currentFormValues, data.value])
                    }
                    break
                case 'breakdown-age-bucket':
                    currentFormValues = form.getValues('age_buckets')
                    if (!currentFormValues.includes(data.value)) {
                        form.setValue('age_buckets', [...currentFormValues, data.value])
                    }
                    break
                case 'breakdown-gender':
                    currentFormValues = form.getValues('genders')
                    if (!currentFormValues.includes(data.value)) {
                        form.setValue('genders', [...currentFormValues, data.value])
                    }
                    break
                case 'breakdown-profession':
                    currentFormValues = form.getValues('professions')
                    if (!currentFormValues.includes(data.value)) {
                        form.setValue('professions', [...currentFormValues, data.value])
                    }
                    break
                case 'breakdown-country':
                    // Get the alpha2 code of the country to add to the filter
                    const countryValue = countries.find((country) => country.name === data.value)?.alpha2code
                    currentFormValues = form.getValues('countries')
                    if (countryValue) {
                        if (!currentFormValues.includes(countryValue)) {
                            form.setValue('countries', [...currentFormValues, countryValue])
                        }
                    }
                    break
            }
        }
    }

    // Format x-axis numbers
    function xAxisFormatter(item: number) {
        return toThousandsSep(Math.abs(item), lang).toString()
    }

    // Determine the max value for the x-axis
    const getMaxValueX = useMemo(() => {
        if (currentHistogramData.length < 1) return 0

        // Find the max value for count_1
        const count1Max = Math.abs(
            currentHistogramData.reduce((prev, curr) => (prev.count_1 > curr.count_1 ? prev : curr)).count_1
        )

        // Find the max value for count_2 (count_2 has negative numbers) and convert the number to positive
        const count2Max = Math.abs(
            currentHistogramData.reduce((prev, curr) => (prev.count_2 < curr.count_2 ? prev : curr)).count_2
        )

        return niceNum(Math.max(count1Max, count2Max), false)
    }, [currentHistogramData])

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

    const displayGraph = !!data && !isLoading && !isRefetching && !!currentHistogramData && !!displayBreakdownByField

    // Nothing to show
    if (
        data &&
        !data.histogram?.age_buckets?.length &&
        !data.histogram?.age_buckets_default?.length &&
        !data.histogram?.ages?.length &&
        !data.histogram?.genders?.length &&
        !data.histogram?.professions?.length &&
        !data.histogram?.canonical_countries?.length &&
        !data.histogram?.regions?.length
    ) {
        return null
    }

    return (
        <Box>
            <GraphTitle dashboard={dashboard} text={t('who-the-people-are')} />
            <p>{paragraph}</p>

            {/* Error */}
            {!data && isError && <GraphError dashboard={dashboard} />}

            {/* Loading */}
            {!displayGraph && !isError && <Loading dashboard={dashboard} />}

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
                                    options={histogramOptions}
                                    value={value}
                                    controllerRenderOnChange={onChange}
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
                                    dataKey="value"
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
                                            lang={lang}
                                        />
                                    }
                                    position={{ x: 25 }}
                                />
                                {/* Only display bar2 if filters are not identical */}
                                {!data.filters_are_identical && (
                                    <Bar
                                        dataKey="count_2"
                                        className={bar2Classes}
                                        stackId={0}
                                        fill={bar2Fill}
                                        minPointSize={3}
                                        onMouseOver={() => setHoveredBarDataKey('count_2')}
                                        onMouseEnter={toggleShowTooltip}
                                        onMouseLeave={toggleShowTooltip}
                                        onClick={(payload) => {
                                            if (form2) setFormValue(form2, payload)
                                        }}
                                    />
                                )}

                                <Bar
                                    dataKey="count_1"
                                    className={bar1Classes}
                                    stackId={0}
                                    fill={bar1Fill}
                                    minPointSize={3}
                                    onMouseOver={() => setHoveredBarDataKey('count_1')}
                                    onMouseEnter={toggleShowTooltip}
                                    onMouseLeave={toggleShowTooltip}
                                    onClick={(payload) => {
                                        if (form1) setFormValue(form1, payload)
                                    }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </Box>
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
