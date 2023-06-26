'use client'

import { Box } from '@components/Box'
import { GraphTitle } from '@components/GraphTitle'
import { useCampaignQuery } from '@hooks/use-campaign'
import { Tab } from '@headlessui/react'
import { classNames } from '@utils'
import React from 'react'
import { DashboardName } from '@enums'
import { TopWordsWordcloud } from 'graph-components/TopWordsAndPhrasesGraph/TopWordsWordcloud'
import { TopWordsOrPhrases } from 'graph-components/TopWordsAndPhrasesGraph/TopWordsOrPhrases'
import { GraphLoading } from 'components/GraphLoading'
import { GraphError } from 'components/GraphError'
import { useTranslation } from '@app/i18n/client'
import { Dashboard } from '@types'
import { Tooltip } from '@components/Tooltip'

interface ITopWordsAndPhrasesGraphProps {
    dashboard: Dashboard
    lang: string
}

export const TopWordsAndPhrasesGraph = ({ dashboard, lang }: ITopWordsAndPhrasesGraphProps) => {
    const { data, isError } = useCampaignQuery(dashboard, lang)
    const { t } = useTranslation(lang)

    // Set selected tab classes
    let selectedTabClasses: string
    switch (dashboard) {
        case DashboardName.WHAT_YOUNG_PEOPLE_WANT:
            selectedTabClasses = 'border-t-pmnchColors-septenary'
            break
        default:
            selectedTabClasses = 'border-t-defaultColors-tertiary'
    }

    // Tabs
    const tabs = [
        {
            id: 'word-cloud',
            title: t('word-cloud'),
            content: data ? (
                <TopWordsWordcloud
                    dashboard={dashboard}
                    wordcloudWords={data.top_words_and_phrases.wordcloud_words}
                    lang={lang}
                />
            ) : null,
        },
        {
            id: 'top-words',
            title: t('top-words'),
            content: data ? (
                <TopWordsOrPhrases
                    dashboard={dashboard}
                    lang={lang}
                    id="top-words"
                    words={data.top_words_and_phrases.top_words}
                    filter1Description={data.filter_1_description}
                    filter2Description={data.filter_2_description}
                    filtersAreIdentical={data.filters_are_identical}
                    yAxisWidth={250}
                />
            ) : null,
        },
        {
            id: 'two-word-phrases',
            title: t('two-word-phrases'),
            content: data ? (
                <TopWordsOrPhrases
                    dashboard={dashboard}
                    lang={lang}
                    id="two-word-phrases"
                    words={data.top_words_and_phrases.two_word_phrases}
                    filter1Description={data.filter_1_description}
                    filter2Description={data.filter_2_description}
                    filtersAreIdentical={data.filters_are_identical}
                    yAxisWidth={250}
                />
            ) : null,
        },
        {
            id: 'three-word-phrases',
            title: t('three-word-phrases'),
            content: data ? (
                <TopWordsOrPhrases
                    dashboard={dashboard}
                    lang={lang}
                    id="three-word-phrases"
                    words={data.top_words_and_phrases.three_word_phrases}
                    filter1Description={data.filter_1_description}
                    filter2Description={data.filter_2_description}
                    filtersAreIdentical={data.filters_are_identical}
                    yAxisWidth={275}
                />
            ) : null,
        },
    ]

    // Display graph or not
    const displayGraph = !!data

    return (
        <div>
            {/* Tooltip: top words phrases */}
            <Tooltip
                id="two-word-phrases"
                dashboard={dashboard}
                title={'Single words, two-word phrases, and three-word phrases'}
                paragraphs={[
                    'Of the responses that you have filtered, here you can see the most common single words that the respondent mentioned.',
                    'You can also see the most common two-word and three-word phrases that were mentioned within your filter, allowing for a deeper understanding of what the respondents were asking for.',
                    'Similar to the “Filter by keyword” function at the top of the Dashboard, you can also click on any bar on the “One word phrases” graph to filter the responses for that word.',
                ]}
            />

            {/* Tooltip: top words phrases  */}
            <Tooltip
                id="top-words-phrases"
                dashboard={dashboard}
                title={'Advanced feature'}
                paragraphs={[
                    'If you want to limit the two-word and three-word phrases to those phrases containing a keyword, you can select “Show only multi-word phrases containing filter term” in the filter control panel.',
                ]}
            />

            <Box>
                <div data-tooltip-id="two-word-phrases">
                    <GraphTitle dashboard={dashboard} text={t('top-words-and-phrases')} />
                </div>
                <p>{t('what-people-said-own-words')}</p>

                {/* Error */}
                {!data && isError && <GraphError dashboard={dashboard} />}

                {/* Loading (only at first data fetch) */}
                {!displayGraph && !isError && <GraphLoading dashboard={dashboard} />}

                {/* Graph */}
                {displayGraph && (
                    <div className="mt-3 w-full">
                        <Tab.Group>
                            <Tab.List data-tooltip-id="top-words-phrases" className="flex flex-col sm:flex-row">
                                {tabs.map((tab) => (
                                    <Tab
                                        key={tab.id}
                                        className={({ selected }) =>
                                            classNames(
                                                'w-full bg-grayLighter py-5 leading-5 shadow-sm ring-transparent ring-offset-2 focus:outline-none',
                                                selected ? `border-t-2 bg-white shadow-none ${selectedTabClasses}` : ''
                                            )
                                        }
                                    >
                                        {tab.title}
                                    </Tab>
                                ))}
                            </Tab.List>
                            <Tab.Panels>
                                {tabs.map(({ id, content }) => (
                                    <Tab.Panel key={id} unmount={false} className="w-full">
                                        {content}
                                    </Tab.Panel>
                                ))}
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                )}
            </Box>
        </div>
    )
}
