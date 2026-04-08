'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function TopLoadingBar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const handleStart = () => {
            setLoading(true)
            setProgress(10)
        }
        const handleComplete = () => {
            setProgress(100)
            setTimeout(() => {
                setLoading(false)
                setProgress(0)
            }, 500)
        }

        // We can't easily hook into Next.js router events in App Router like Pages Router
        // but we can detect pathname changes.
        handleStart()
        const timer = setTimeout(() => {
            setProgress(70)
        }, 300)

        handleComplete()

        return () => clearTimeout(timer)
    }, [pathname, searchParams])

    if (!loading) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            <div 
                className="h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
