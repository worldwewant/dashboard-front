import { ICampaign, ICampaignRequest, IConfiguration, IFilterOptions } from '@interfaces'
import { TOption } from '@types'

const apiUrl = process.env.NEXT_PUBLIC_WRA_DASHBOARD_API_URL
const headers = { 'Content-Type': 'application/json' }

/**
 * Get campaign filter options
 *
 * @param config The campaign configuration
 * @param lang The language
 */
export async function getCampaignFilterOptions(config: IConfiguration, lang: string) {
    const response = await fetch(`${apiUrl}/campaigns/${config.campaignCode}/filter-options?lang=${lang}`, {
        method: 'GET',
        headers: headers,
    })

    if (!response.ok) {
        throw new Error('Failed to fetch campaign filter options')
    }

    const data: IFilterOptions = await response.json()

    return data
}

/**
 * Get campaigns merged filter options
 *
 * @param lang The language
 */
export async function getCampaignsMergedFilterOptions(lang: string) {
    const response = await fetch(`${apiUrl}/campaigns-merged/filter-options?lang=${lang}`, {
        method: 'GET',
        headers: headers,
    })

    if (!response.ok) {
        throw new Error('Failed to fetch campaigns merged filter options')
    }

    const data: IFilterOptions = await response.json()

    return data
}

/**
 * Get campaign
 *
 * @param config The campaign configuration
 * @param campaignRequest The campaign request
 * @param lang The language
 * @param qCode The question code
 * @param response_year The response year
 * @param signal Signal
 */
export async function getCampaign(
    config: IConfiguration,
    campaignRequest: ICampaignRequest,
    lang: string,
    qCode: string,
    response_year: string,
    signal: AbortSignal | null | undefined
) {
    const response = await fetch(`${apiUrl}/campaigns/${config.campaignCode}?q_code=${qCode}&response_year=${response_year}&lang=${lang}`, {
        signal: signal,
        method: 'POST',
        headers: headers,
        body: JSON.stringify(campaignRequest),
    })

    if (!response.ok) {
        throw new Error('Failed to fetch campaign')
    }

    const data: ICampaign = await response.json()

    return data
}

/**
 * Get campaign
 *
 * @param campaignRequest The campaign request
 * @param lang The language
 * @param signal Signal
 */
export async function getCampaignsMerged(
    campaignRequest: ICampaignRequest,
    lang: string,
    signal: AbortSignal | null | undefined
) {
    const response = await fetch(`${apiUrl}/campaigns-merged?lang=${lang}`, {
        signal: signal,
        method: 'POST',
        headers: headers,
        body: JSON.stringify(campaignRequest),
    })

    if (!response.ok) {
        throw new Error('Failed to fetch campaigns merged')
    }

    const data: ICampaign = await response.json()

    return data
}

/**
 * Get campaign who the people are options
 *
 * @param config The campaign configuration
 * @param lang The language
 */
export async function getCampaignWhoThePeopleAreOptions(config: IConfiguration, lang: string) {
    const response = await fetch(`${apiUrl}/campaigns/${config.campaignCode}/who-the-people-are-options?lang=${lang}`, {
        method: 'GET',
        headers: headers,
    })

    if (!response.ok) {
        throw new Error('Failed to fetch campaign who the people are options')
    }

    const data: TOption<string>[] = await response.json()

    return data
}

/**
 * Get campaigns merged who the people are options
 *
 * @param lang The language
 */
export async function getCampaignsMergedWhoThePeopleAreOptions(lang: string) {
    const response = await fetch(`${apiUrl}/campaigns-merged/who-the-people-are-options?lang=${lang}`, {
        method: 'GET',
        headers: headers,
    })

    if (!response.ok) {
        throw new Error('Failed to fetch campaigns merged who the people are options')
    }

    const data: TOption<string>[] = await response.json()

    return data
}
