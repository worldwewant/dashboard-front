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

import { TOption } from '@types'

export interface ICountryRegionOption {
    country_alpha2_code: string
    options: TOption<string>[]
}

export interface ICountryRegionProvinceOption {
    country_alpha2_code: string
    options: TOption<string>[]
}

export interface IFilterOptions {
    countries: TOption<string>[]
    country_regions: ICountryRegionOption[]
    country_provinces: ICountryRegionProvinceOption[]
    response_topics: TOption<string>[]
    ages: TOption<string>[]
    years: TOption<string>[]
    age_buckets: TOption<string>[]
    genders: TOption<string>[]
    living_settings: TOption<string>[]
    professions: TOption<string>[]
    only_responses_from_categories: TOption<boolean>[]
    only_multi_word_phrases_containing_filter_term: TOption<boolean>[]
}
