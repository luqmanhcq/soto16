'use client'

import { ShieldCheck } from 'lucide-react'
import Image from 'next/image'

interface FullPageLoaderProps {
    message?: string
    subMessage?: string
}

export default function FullPageLoader({ 
    message = "Memproses Permintaan...", 
    subMessage = "Kepegawaian Terintegrasi" 
}: FullPageLoaderProps) {
    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
<div className="relative">
                 <div className="h-20 w-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <Image src="/surajaya_corpu.webp" alt="Logo" className="h-10 w-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width={40} height={40} priority={true} unoptimized />
             </div>
            <div className="text-center">
                <p className="text-white font-black tracking-[0.2em] text-xs uppercase italic">{message}</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">{subMessage}</p>
            </div>
        </div>
    )
}
