'use client'

import { useState, useEffect, use } from 'react'
import WebinarForm from '@/components/webinar/webinar-form'

export default function EditWebinarPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/webinar/${id}`)
                if (res.ok) {
                    const result = await res.json()
                    setData(result.data)
                }
            } catch (error) {
                console.error('Failed to fetch webinar', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    if (loading) return <div className="p-12 text-center text-slate-500 font-medium">Memuat data webinar...</div>
    if (!data) return <div className="p-12 text-center text-red-500 font-bold tracking-tight">Webinar tidak ditemukan</div>

    return <WebinarForm id={id} initialData={data} />
}
