'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ManajemenPengetahuanForm from '@/components/manajemen-pengetahuan/manajemen-pengetahuan-form'
import { Loader2 } from 'lucide-react'

export default function EditManajemenPengetahuan() {
    const { id } = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetch(`/api/manajemen-pengetahuan/${id}`)
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
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        </div>
    )

    return <ManajemenPengetahuanForm id={id as string} initialData={data} />
}