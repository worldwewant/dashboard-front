'use client'

import { useQuery } from 'react-query'
import { ICampaign } from '@interfaces'
import { getCampaign } from '@services/wra-dashboard-api'
import { useFiltersStore } from '@stores/filters'
import { useEffect } from 'react'
import { defaultFilterValues } from '@constants'
import _ from 'lodash'
import { TDashboard } from '@types'
import { getDashboardConfig } from '@utils'
import { useQuestionAskedCodeStore } from '@stores/question-asked-code'
import { DashboardName } from '@enums'

export const useCampaignQuery = (dashboard: TDashboard, lang: string) => {
    const filters = useFiltersStore((state) => state.filters)
    const questionAskedCode = useQuestionAskedCodeStore((state) => state.questionAskedCode)
    const config = getDashboardConfig(dashboard)

    // 'healthwellbeing' at 'q2' should ignore response topics filtering
    if (dashboard === DashboardName.HEALTHWELLBEING && questionAskedCode === 'q2') {
        if (filters.filter1) {
            filters.filter1.response_topics = []
            filters.filter1.only_responses_from_categories = false
        }
        if (filters.filter2) {
            filters.filter2.response_topics = []
            filters.filter2.only_responses_from_categories = false
        }
    }

    // If the filter has not changed from the default filter values then do not send it with the request
    const filter1 = _.isEqual(filters.filter1, defaultFilterValues) ? undefined : filters.filter1
    const filter2 = _.isEqual(filters.filter2, defaultFilterValues) ? undefined : filters.filter2

    const campaignQuery = useQuery<ICampaign>({
        queryKey: [`campaign-${dashboard}`],
        queryFn: ({ signal }) =>
            getCampaign(
                config,
                {
                    filter_1: filter1,
                    filter_2: filter2,
                },
                lang,
                questionAskedCode,
                signal
            ),
        refetchOnWindowFocus: false,
    })

    // Refetch function
    const refetch = campaignQuery.refetch

    // Refetch campaign on filters change
    useEffect(() => {
        if (filters) {
            refetch({ cancelRefetch: true }).then()
        }
    }, [refetch, filters, questionAskedCode])

    return campaignQuery
}
