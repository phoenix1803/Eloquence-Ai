'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Pages that should not have navbar/footer
    const fullScreenPages = ['/interview']
    const isFullScreen = fullScreenPages.some(page => pathname.startsWith(page))

    if (isFullScreen) {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    )
}