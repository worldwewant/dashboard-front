import { dashboards } from '@constants'
import { notFound } from 'next/navigation'
import { Title } from 'components/Title'
import React from 'react'
import { Subtext } from 'components/Subtext'
import { FiltersPanel } from '@components/FiltersPanel'
import { ResponsesBreakdownGraph } from '@graph-components/ResponsesBreakdownGraph'
import { TopWordsAndPhrasesGraph } from '@graph-components/TopWordsAndPhrasesGraph'
import { ResponsesSampleGraph } from '@graph-components/ResponsesSampleGraph'
import { LocationGraph } from '@graph-components/LocationGraph'
import { ThePeopleGraph } from '@graph-components/ThePeopleGraph'
import { Dashboards } from '@enums'
import { GenderBreakdownGraph } from '@graph-components/GenderBreakdownGraph'

interface IDashboardProps {
    params: { dashboard: string }
}

export const Dashboard = async ({ params }: IDashboardProps) => {
    const { dashboard } = params

    // Fire notFound() if subdomain/dashboard requested is not an existing dashboard
    if (!dashboards.some((d) => d === dashboard)) {
        notFound()
    }

    return (
        <>
            {/* Title */}
            <div className="mb-3 flex justify-center xl:hidden">
                <Title dashboard={dashboard} />
            </div>

            {/* Subtext */}
            <div className="mb-10 flex justify-center">
                <Subtext dashboard={dashboard} />
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-x-[10%] xl:grid-cols-2">
                {/* Filters panel */}
                <aside className="hidden xl:sticky xl:top-5 xl:block xl:h-fit">
                    <FiltersPanel dashboard={dashboard} />
                </aside>

                {/* Graphs */}
                <section className="grid grid-cols-1 gap-y-[200px]">
                    {Dashboards.WHAT_YOUNG_PEOPLE_WANT === dashboard ? (
                        <>
                            <ResponsesBreakdownGraph dashboard={dashboard} />
                            <LocationGraph dashboard={dashboard} />
                            <ThePeopleGraph dashboard={dashboard} />
                            <GenderBreakdownGraph dashboard={dashboard} />
                            <TopWordsAndPhrasesGraph dashboard={dashboard} />
                            <ResponsesSampleGraph dashboard={dashboard} />
                        </>
                    ) : (
                        <>
                            <TopWordsAndPhrasesGraph dashboard={dashboard} />
                            <ResponsesSampleGraph dashboard={dashboard} />
                            <LocationGraph dashboard={dashboard} />
                            <ResponsesBreakdownGraph dashboard={dashboard} />
                            <ThePeopleGraph dashboard={dashboard} />
                        </>
                    )}
                </section>
            </div>
        </>
    )
}
