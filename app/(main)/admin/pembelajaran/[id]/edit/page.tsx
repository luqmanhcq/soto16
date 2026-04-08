'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PembelajaranForm from '@/components/pembelajaran/pembelajaran-form'
import { Loader2 } from 'lucide-react'

export default function EditPembelajaran() {
    const { id } = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetch(`/api/pembelajaran/${id}`)
                .then(res => res.json())
                .then(data => {
                    setData(data.data)
                    setLoading(false)
                })
                .catch(err => {
                    console.error(err)
                    setLoading(false)
                })
        }
    }, [id])

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
        </div>
    )

    return <PembelajaranForm id={id as string} initialData={data} />
}
