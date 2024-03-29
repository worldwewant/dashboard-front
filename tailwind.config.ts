import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/page-components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/graph-components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        colors: {
            white: 'var(--white)',
            black: 'var(--black)',
            grayLighter: 'var(--grayLighter)',
            grayLight: 'var(--grayLight)',
            gray: 'var(--gray)',
            transparent: 'transparent',
            defaultColors: {
                primary: 'var(--defaultPrimary)',
                secondary: 'var(--defaultSecondary)',
                tertiary: 'var(--defaultTertiary)',
                quaternary: 'var(--defaultQuaternary)',
                quinary: 'var(--defaultQuinary)',

                primaryFaint: 'var(--defaultPrimaryFaint)',
                secondaryFaint: 'var(--defaultSecondaryFaint)',
                tertiaryFaint: 'var(--defaultTertiaryFaint)',
                quaternaryFaint: 'var(--defaultQuaternaryFaint)',
                quinaryFaint: 'var(--defaultQuinaryFaint)',

                font: 'var(--defaultFont)',
            },
            pmnchColors: {
                primary: 'var(--pmnchPrimary)',
                secondary: 'var(--pmnchSecondary)',
                tertiary: 'var(--pmnchTertiary)',
                quaternary: 'var(--pmnchQuaternary)',
                quinary: 'var(--pmnchQuinary)',
                senary: 'var(--pmnchSenary)',
                septenary: 'var(--pmnchSeptenary)',

                primaryFaint: 'var(--pmnchPrimaryFaint)',
                secondaryFaint: 'var(--pmnchSecondaryFaint)',
                tertiaryFaint: 'var(--pmnchTertiaryFaint)',
                quaternaryFaint: 'var(--pmnchQuaternaryFaint)',
                quinaryFaint: 'var(--pmnchQuinaryFaint)',

                font: 'var(--pmnchFont)',
            },

            dataExchangeColors: {
                primary: 'var(--dataExchangePrimary)',
                secondary: 'var(--dataExchangeSecondary)',
                tertiary: 'var(--dataExchangeTertiary)',
                quaternary: 'var(--dataExchangeQuaternary)',
                quinary: 'var(--dataExchangeQuinary)',
                senary: 'var(--dataExchangeSenary)',

                primaryFaint: 'var(--dataExchangePrimaryFaint)',
                secondaryFaint: 'var(--dataExchangeSecondaryFaint)',
                quaternaryFaint: 'var(--dataExchangeQuaternaryFaint)',
                tertiaryFaint: 'var(--dataExchangeTertiaryFaint)',
                quinaryFaint: 'var(--dataExchangeQuinaryFaint)',

                font: 'var(--dataExchangeFont)',
            },
        },
        fontFamily: {
            'open-sans': ['Open Sans', 'var(--font-helvetica)', 'Arial', 'sans-serif'],
            'noto-sans-regular': ['var(--font-noto-sans-regular)', 'var(--font-helvetica)', 'Arial', 'sans-serif'],
            'noto-sans-bold': ['var(--font-noto-sans-bold)', 'var(--font-helvetica)', 'Arial', 'sans-serif'],
            '1point8': ['var(--font-1-point-8)', 'sans-serif'],
            'proxima-nova': ['var(--font-proxima-nova)', 'var(--font-helvetica)', 'sans-serif'],
            'helvetica': ['var(--font-helvetica)', 'sans-serif'],
        },
    },
    plugins: [],
}

export default config
