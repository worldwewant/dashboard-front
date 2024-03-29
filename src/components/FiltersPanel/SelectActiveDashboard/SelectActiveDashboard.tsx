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

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box } from '@components/Box'
import React, { useContext, useEffect } from 'react'
import { useTranslation } from '@app/i18n/client'
import { TOption } from '@types'
import { SelectSingleValue } from '@components/SelectSingleValue'
import {
    allCampaignsActiveDashboardSchema,
    TAllCampaignsActiveDashboard,
} from '@schemas/all-campaigns-active-dashboard'
import { LegacyDashboardName } from '@enums'
import { ParamsContext } from '@contexts/params'
import { getDefaultFilterValues } from '@schemas/filter'
import { useFilterFormsStore } from '@stores/filter-forms'
import { produce } from 'immer'
import { ConfigurationsContext } from '@contexts/configurations'

interface ISelectActiveDashboardProps {
    options: TOption<string>[]
}

export const SelectActiveDashboard = ({ options }: ISelectActiveDashboardProps) => {
    const { params, setParams } = useContext(ParamsContext)
    const { allCampaignsConfigurations } = useContext(ConfigurationsContext)
    const { lang } = params

    const { t } = useTranslation(lang)
    const filterForm1 = useFilterFormsStore((state) => state.form1)
    const filterForm2 = useFilterFormsStore((state) => state.form2)

    // Form
    const form = useForm<TAllCampaignsActiveDashboard>({
        defaultValues: { active_dashboard: LegacyDashboardName.ALL_CAMPAIGNS },
        resolver: zodResolver(allCampaignsActiveDashboardSchema),
    })

    // Watch field
    const activeDashboardField = form.watch('active_dashboard')

    // Set active dashboard
    useEffect(() => {
        if (activeDashboardField) {
            const newCampaignConfig = allCampaignsConfigurations.find((c) => c.dashboard_path === activeDashboardField)
            if (newCampaignConfig) {
                const defaultFilterValues = getDefaultFilterValues(activeDashboardField)
                setParams((prev) => {
                    return produce(prev, (draft) => {
                        draft.dashboard = activeDashboardField
                        draft.config = newCampaignConfig
                        draft.filters = { filter1: defaultFilterValues, filter2: defaultFilterValues }
                        draft.questionAskedCode = 'q1'
                        draft.responseYear = ''
                    })
                })

                // Clear forms
                if (filterForm1 && filterForm2) {
                    filterForm1.reset(defaultFilterValues)
                    filterForm2.reset(defaultFilterValues)
                }
            }
        }
    }, [activeDashboardField, allCampaignsConfigurations, setParams, filterForm1, filterForm2])

    // Set default value for active_dashboard
    useEffect(() => {
        if (form) {
            form.setValue('active_dashboard', LegacyDashboardName.ALL_CAMPAIGNS)
        }
    }, [form])

    return (
        <Box>
            <p className="font-bold">{t('select-dashboard')}:</p>

            {/* Select */}
            {options.length > 0 && (
                <div className="mt-3 w-full">
                    <Controller
                        name="active_dashboard"
                        control={form.control}
                        render={({ field: { onChange, value } }) => (
                            <SelectSingleValue
                                id="select-active-dashboard"
                                options={options}
                                value={value}
                                controllerRenderOnChange={onChange}
                            />
                        )}
                    />
                </div>
            )}
        </Box>
    )
}
