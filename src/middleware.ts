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

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { defaultLanguage, languagesAzure, languagesGoogle } from '@constants'
import { LegacyDashboardName } from '@enums'
import { ILanguage } from '@interfaces'
import { getSettings } from '@services/dashboard-api'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const hostname = request.headers.get('host') as string

    // Get API settings
    let translationsEnabled: boolean
    let cloudService: string
    try {
        const settings = await getSettings()
        translationsEnabled = settings.translations_enabled
        cloudService = settings.cloud_service
    } catch (err) {
        translationsEnabled = false
        cloudService = 'google'
    }

    // Languages to use in the dashboard
    let allLanguages: ILanguage[]
    if (translationsEnabled) {
        if (cloudService === 'azure') {
            allLanguages = languagesAzure
        } else {
            allLanguages = languagesGoogle
        }
    } else {
        // If translations is not enabled, only allow English
        allLanguages = [{ code: 'en', name: 'English' }]
    }

    // Redirect if there is a language that is not supported
    if (!translationsEnabled) {
        // Check if pathname contains a language that is not supported
        // e.g. when translations is disabled in the back-end, only 'en' is allowed
        const pathnameUnsupportedLanguage = allLanguages.find((language) => {
            if (pathname.startsWith(`/${language.code}/`) || pathname === `/${language.code}`) {
                return language
            }
        })

        if (pathnameUnsupportedLanguage) {
            // e.g. incoming request is /nl/products
            // The new URL is now /en/products
            const newPathname = pathname.replace(`/${pathnameUnsupportedLanguage.code}`, '')
            return NextResponse.redirect(new URL(`/en/${newPathname}`, request.url))
        }
    }

    // Check if pathname is missing language
    const pathnameIsMissingLanguage = allLanguages.every(
        (language) => !pathname.startsWith(`/${language.code}/`) && pathname !== `/${language.code}`
    )

    // Redirect if there is no language in pathname
    if (pathnameIsMissingLanguage) {
        // e.g. incoming request is /products
        // The new URL is now /en/products
        return NextResponse.redirect(new URL(`/${defaultLanguage.code}/${pathname}`, request.url))
    }

    // Get NextURL
    const nextUrl = request.nextUrl

    const LEGACY_CAMPAIGNS_DEPLOYMENT = process.env.LEGACY_CAMPAIGNS_DEPLOYMENT?.toLowerCase() === 'true'

    // Default routing e.g. my-dashboards.org/en/{DASHBOARD_NAME}
    if (!LEGACY_CAMPAIGNS_DEPLOYMENT) {
        // Rewrite to the current hostname
        return NextResponse.rewrite(nextUrl)
    }

    // Note!
    // The codes below are only in use for deployment of legacy campaigns
    const LEGACY_CAMPAIGNS_PROD_DOMAINS = process.env.LEGACY_CAMPAIGNS_PROD_DOMAINS
        ? process.env.LEGACY_CAMPAIGNS_PROD_DOMAINS.split(' ')
        : []
    const NEXT_PUBLIC_LEGACY_CAMPAIGNS_DEV_DOMAIN = process.env.NEXT_PUBLIC_LEGACY_CAMPAIGNS_DEV_DOMAIN || '.localhost'
    const LEGACY_CAMPAIGNS_MAIN_SUBDOMAIN = process.env.LEGACY_CAMPAIGNS_MAIN_SUBDOMAIN || ''
    const LEGACY_CAMPAIGNS_EXCHANGE_SUBDOMAIN = process.env.LEGACY_CAMPAIGNS_EXCHANGE_SUBDOMAIN || ''
    const PMNCH = process.env.PMNCH?.toLowerCase() === 'true'
    const pmnchLink = 'https://wypw.1point8b.org'

    // Extract the subdomain by removing the root URL
    // e.g. from 'whatwomenwant.my-dashboards.org' remove '.my-dashboards.org' to get 'whatwomenwant'
    let extractedSubdomain: string | undefined
    let prodDomain: string | undefined
    if (process.env.NODE_ENV === 'production') {
        // Find prod domain
        prodDomain = LEGACY_CAMPAIGNS_PROD_DOMAINS.find((prodDomain) => {
            if (hostname.endsWith(prodDomain)) {
                return prodDomain
            }
        })

        // If prod domain was not found, return 404
        if (!prodDomain) {
            return new Response('404 - Not Found', { status: 404 })
        }

        extractedSubdomain = hostname?.replace(prodDomain, '')
    } else {
        extractedSubdomain = hostname?.replace(`${NEXT_PUBLIC_LEGACY_CAMPAIGNS_DEV_DOMAIN}:3000`, '')
    }

    // Display the dashboard at dataexchange
    if (extractedSubdomain === LEGACY_CAMPAIGNS_EXCHANGE_SUBDOMAIN && prodDomain === '.worldwewantproject.org') {
        // e.g. '/dataexchange/en'
        nextUrl.pathname = `${nextUrl.pathname}/dataexchange`

        // Rewrite to the current hostname
        return NextResponse.rewrite(nextUrl)
    }

    // Redirect to new link for PMNCH
    if (process.env.NODE_ENV === 'production') {
        if (nextUrl.pathname.endsWith(`/${LegacyDashboardName.WHAT_YOUNG_PEOPLE_WANT}`)) {
            return NextResponse.redirect(pmnchLink)
        }
    }

    // Subdomain routing with path e.g. explore.my-dashboards.org/en/{DASHBOARD_NAME}
    // If LEGACY_CAMPAIGNS_MAIN_SUBDOMAIN equals the extracted subdomain
    if (LEGACY_CAMPAIGNS_MAIN_SUBDOMAIN === extractedSubdomain && !PMNCH) {
        // Get NextURL
        const nextUrl = request.nextUrl

        // Rewrite to the current hostname
        return NextResponse.rewrite(nextUrl)
    }

    // Subdomain routing e.g. {DASHBOARD_NAME}.my-dashboards.org/en
    else {
        // Set dashboard name from the current subdomain
        let dashboardName: string

        // PMNCH
        if (PMNCH) {
            // Dashboard name for pmnch
            dashboardName = LegacyDashboardName.WHAT_YOUNG_PEOPLE_WANT
        } else {
            // Redirect to new link for PMNCH
            if (process.env.NODE_ENV === 'production') {
                if (extractedSubdomain === LegacyDashboardName.WHAT_YOUNG_PEOPLE_WANT) {
                    return NextResponse.redirect(pmnchLink)
                }
            }

            // For other dashboards, the dashboard name is equal to the subdomain
            dashboardName = extractedSubdomain
        }

        // e.g. '/whatwomenwant/en'
        nextUrl.pathname = `${nextUrl.pathname}/${dashboardName}`

        // Rewrite to the current hostname
        return NextResponse.rewrite(nextUrl)
    }
}

export const config = {
    // Exclude these paths
    matcher: '/((?!api|.*\\..*|_next).*)',

    // Allow dynamic code evaluation for Lodash
    unstable_allowDynamic: ['**/node_modules/lodash/lodash.js'],
}
