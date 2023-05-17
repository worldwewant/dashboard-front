import '@styles/globals.scss'
import { ReactNode } from 'react'
import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core'
import localFont from 'next/font/local'

fontAwesomeConfig.autoAddCss = false

const notoSansRegular = localFont({
    src: './fonts/NotoSans/NotoSans-Regular.ttf',
    display: 'swap',
    variable: '--font-noto-sans-regular',
})

const _1point8 = localFont({
    src: './fonts/1point8/1point8.ttf',
    display: 'swap',
    variable: '--font-1-point-8',
})

const helvetica = localFont({
    src: [
        { path: './fonts/Helvetica/Helvetica.ttf', weight: '400', style: 'normal' },
        { path: './fonts/Helvetica/Helvetica-Bold.ttf', weight: '700', style: 'bold' },
    ],
    display: 'swap',
    variable: '--font-helvetica',
})

const proximaNova = localFont({
    src: [
        { path: './fonts/Proxima Nova/Proxima Nova Regular.otf', weight: '400', style: 'normal' },
        { path: './fonts/Proxima Nova/Proxima Nova Bold.otf', weight: '700', style: 'bold' },
    ],
    display: 'swap',
    variable: '--font-proxima-nova',
})

interface IRootLayoutProps {
    children: ReactNode
}

const RootLayout = async ({ children }: IRootLayoutProps) => {
    return (
        <html
            lang="en"
            className={`${notoSansRegular.variable} ${_1point8.variable} ${helvetica.variable} ${proximaNova.variable}`}
        >
            <body>{children}</body>
        </html>
    )
}

export default RootLayout
