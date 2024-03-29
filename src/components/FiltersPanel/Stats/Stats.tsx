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
import { useCampaignQuery } from '@hooks/use-campaign-query'
import { useTranslation } from '@app/i18n/client'
import { toThousandsSep } from '@utils'
import { Tooltip } from '@components/Tooltip'
import React, { useContext } from 'react'
import { LegacyDashboardName } from '@enums'
import { ParamsContext } from '@contexts/params'

export const Stats = () => {
    const { params } = useContext(ParamsContext)
    const { dashboard, lang } = params

    const { data } = useCampaignQuery()
    const { t } = useTranslation(lang)

    // Set average age
    let filter1AverageAge = 'N/A'
    let filter2AverageAge = 'N/A'
    switch (dashboard) {
        case LegacyDashboardName.WHAT_WOMEN_WANT:
            if (data) {
                filter1AverageAge = data.filter_1_average_age_bucket
                filter2AverageAge = data.filter_2_average_age_bucket
            }
            break
        case LegacyDashboardName.MIDWIVES_VOICES:
            if (data) {
                filter1AverageAge = data.filter_1_average_age_bucket
                filter2AverageAge = data.filter_2_average_age_bucket
            }
            break
        default:
            if (data) {
                filter1AverageAge = data.filter_1_average_age
                filter2AverageAge = data.filter_2_average_age
            }
    }

    if (!data) return null

    return (
        <div>
            {/* Tooltip: number of respondents */}
            <Tooltip
                id="stats-number-of-respondents"
                dashboard={dashboard}
                title={'Number of responses'}
                paragraphs={[
                    'Here you can see how many respondents fall into the criteria you have selected in the filters. If you have selected two groups or segments using the “Compare to...” tab in the filters control panel, then the number of respondents in the second group will appear in the box on the right.',
                ]}
            />

            {/* Tooltip: average age */}
            <Tooltip
                id="stats-average-age"
                dashboard={dashboard}
                title={'Average age'}
                paragraphs={[
                    'This shows the average age of the respondents you have selected.',
                    'If you have selected two groups or segments using the “Compare to...” tab in the filters control panel, then the average age of the second group will appear in the box on the right.',
                ]}
            />

            <div className="mb-5 flex flex-col">
                <div className="mb-2 flex w-full flex-row gap-x-3">
                    <div className="flex-1" data-tooltip-id="stats-number-of-respondents">
                        <Box>
                            <div className="text-2xl">{toThousandsSep(data.filter_1_respondents_count, lang)}</div>
                            <div>{data.filter_1_description}</div>
                        </Box>
                    </div>
                    <div className="flex-1" data-tooltip-id="stats-average-age">
                        <Box>
                            <div className="text-2xl">{filter1AverageAge}</div>
                            <div>{t('average-age')}</div>
                        </Box>
                    </div>
                </div>

                {/* Only display if filters are not identical */}
                {!data.filters_are_identical && (
                    <>
                        <div className="text-center">{t('vs')}</div>
                        <div className="mt-2 flex w-full flex-row gap-x-3">
                            <div className="flex-1">
                                <Box>
                                    <div className="text-2xl">
                                        {toThousandsSep(data.filter_2_respondents_count, lang)}
                                    </div>
                                    <div>{data.filter_2_description}</div>
                                </Box>
                            </div>
                            <div className="flex-1">
                                <Box>
                                    <div className="text-2xl">{filter2AverageAge}</div>
                                    <div>{t('average-age')}</div>
                                </Box>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
