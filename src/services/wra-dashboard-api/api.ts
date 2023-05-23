import { ICampaign, ICampaignRequest, IFilterOptions } from '@interfaces'
import { getDashboardCampaignCode } from '@utils'

const apiUrl = process.env.NEXT_PUBLIC_WRA_DASHBOARD_API_URL as string
const headers = { 'Content-Type': 'application/json' }

/**
 * Get campaign filter options
 *
 * @param dashboard The dashboard
 */
export async function getCampaignFilterOptions(dashboard: string) {
    const campaign = getDashboardCampaignCode(dashboard)
    const response = await fetch(`${apiUrl}/campaigns/${campaign}/filter-options`, {
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
 * Get campaign
 *
 * @param dashboard The dashboard
 * @param campaignRequest The campaign request
 */
export async function getCampaign(dashboard: string, campaignRequest: ICampaignRequest) {
    const campaign = getDashboardCampaignCode(dashboard)
    const response = await fetch(`${apiUrl}/campaigns/${campaign}`, {
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
