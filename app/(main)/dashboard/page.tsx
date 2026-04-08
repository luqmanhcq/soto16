'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import {
    Users,
    Video,
    BookOpen,
    Award,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    Rocket,
    Zap,
    ArrowRight,
    Flame,
    LayoutDashboard,
    ShieldCheck,
    Calendar
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
    const { user } = useAuth()
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/dashboard/stats')
                const data = await res.json()
                if (res.ok) setStats(data.data)
            } catch (err) {
                console.error('Failed to fetch dashboard stats', err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) return <div className="p-20 text-center font-black text-indigo-600 animate-pulse uppercase tracking-widest">Sinkronisasi Data Dashboard...</div>

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Selamat Datang, {user?.nama.split(' ')[0]}! 👋</h1>
                    <p className="text-slate-500 font-bold mt-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="hidden lg:flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-black text-slate-700 tracking-tight">SI-SOTO VERSI 1.0 AKTIF</span>
                </div>
            </header>

            {/* Main Stats Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {isAdmin ? (
                    <>
                        <StatCard label="Total ASN" value={stats?.totalUsers || 0} icon={Users} color="blue" />
                        <StatCard label="Webinar Aktif" value={stats?.totalWebinars || 0} icon={Video} color="indigo" />
                        <StatCard label="E-Learning" value={stats?.totalLessons || 0} icon={BookOpen} color="purple" />
                        <StatCard label="Usul Sertifikat" value={stats?.certificates?.total || 0} icon={Award} color="emerald" />
                    </>
                ) : (
                    <>
                        <StatCard label="Total Capaian" value={`${stats?.totalJp || 0} JP`} icon={Flame} color="orange" />
                        <StatCard label="Webinar Diikuti" value={stats?.webinarsJoined || 0} icon={Video} color="blue" />
                        <StatCard label="Kursus Selesai" value={stats?.lessons?.completed || 0} icon={CheckCircle2} color="green" />
                        <StatCard label="Sertifikat Luar" value={stats?.certificates?.approved || 0} icon={ShieldCheck} color="indigo" />
                    </>
                )}
            </div>

            <div className="grid gap-12 lg:grid-cols-3">
                {/* Detail Analytics / Progress */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                            <TrendingUp className="h-64 w-64" />
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <Rocket className="h-6 w-6 text-indigo-600" />
                                {isAdmin ? 'Monitoring Aktivitas Sistem' : 'Target Kompetensi Tahunan'}
                            </h2>

                            {!isAdmin ? (
                                <div className="space-y-12">
                                    {/* Progress Meter */}
                                    <div>
                                        <div className="flex justify-between mb-4">
                                            <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Jam Pelajaran (JP) Terkumpul</span>
                                            <span className="text-sm font-black text-indigo-600">
                                                {Math.round((stats?.totalJp / 20) * 100)}% Menuju Target
                                            </span>
                                        </div>
                                        <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200">
                                            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg shadow-indigo-100" style={{ width: `${Math.min((stats?.totalJp / 20) * 100, 100)}%` }} />
                                        </div>
                                        <div className="flex justify-between mt-3 px-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mulai: 0 JP</p>
                                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Target Tahunan: 20 JP</p>
                                        </div>
                                    </div>

                                    {/* Joined Webinars List */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Webinar yang Diikuti</h3>
                                            <Link href="/webinar" className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest">Cari Webinar Baru +</Link>
                                        </div>
                                        
                                        <div className="grid gap-4">
                                            {stats?.joinedWebinars?.length > 0 ? (
                                                stats.joinedWebinars.map((webinar: any) => (
                                                    <div key={webinar.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                                                        <div className="flex items-center gap-5">
                                                            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                                <Video className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase leading-none mb-1">
                                                                    {webinar.nama_webinar}
                                                                </p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                                                                    <Calendar className="h-3 w-3" /> {new Date(webinar.tanggal_mulai).toLocaleDateString('id-ID')} • {webinar.kategori}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Link href={`/webinar/${webinar.id}`} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-slate-400 border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm">
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                                    <p className="text-xs font-black text-slate-300 uppercase italic">Anda belum mendaftar webinar apapun</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Status Usulan Sertifikat</p>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                                                <span className="flex items-center gap-2 text-xs font-bold text-amber-600"><Clock className="h-3 w-3" /> Menunggu</span>
                                                <span className="text-lg font-black">{stats?.certificates?.pending || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                                                <span className="flex items-center gap-2 text-xs font-bold text-green-600"><CheckCircle2 className="h-3 w-3" /> Disetujui</span>
                                                <span className="text-lg font-black">{stats?.certificates?.approved || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 overflow-hidden relative group">
                                        <LayoutDashboard className="absolute -bottom-10 -right-10 h-40 w-40 opacity-10 group-hover:scale-110 transition-transform" />
                                        <h3 className="text-2xl font-black mb-2">Kelola Konten</h3>
                                        <p className="text-indigo-100 text-sm opacity-80 mb-8 font-medium">Update webinar dan pembelajaran mandiri secara berkala.</p>
                                        <div className="flex flex-wrap gap-3">
                                            <Link href="/admin/webinar" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all leading-none">
                                                KELOLA KONTEN <Plus className="h-4 w-4" />
                                            </Link>
                                            {user?.role === 'super_admin' && (
                                                <Link href="/admin/users" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all leading-none border border-white/10">
                                                    KELOLA PENGGUNA <Users className="h-4 w-4" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Sidebar */}
                <aside className="space-y-8">
                    <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
                        <div className="h-20 w-20 bg-indigo-500 rounded-3xl mb-8 flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform shadow-xl shadow-indigo-500/20">
                            <ShieldCheck className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-black mb-4">Grup Eksklusif ASN</h3>
                        <p className="text-indigo-200 text-sm leading-relaxed mb-8 opacity-60">Bergabunglah dengan komunitas pembelajar ASN se-provinsi untuk sharing pengalaman.</p>
                        <button className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black text-sm hover:bg-white hover:text-indigo-900 transition-all active:scale-95">
                            GABUNG TELEGRAM
                        </button>
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Pusat Bantuan</h3>
                        <div className="space-y-4">
                            <button className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-slate-50 transition-all group">
                                <span className="text-sm font-bold text-slate-700">Panduan SI-SOTO</span>
                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                            </button>
                            <button className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-slate-50 transition-all group border-t border-slate-50 pt-6">
                                <span className="text-sm font-bold text-slate-700">Hubungi Helpdesk</span>
                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: any, icon: any, color: string }) {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        green: 'bg-green-50 text-green-600 border-green-100',
    }

    return (
        <div className={`p-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
            <div className={`h-14 w-14 rounded-2xl ${colors[color]} flex items-center justify-center mb-6 shadow-lg shadow-current/10 border group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            <div className="absolute -bottom-4 -right-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <Icon className="h-24 w-24" />
            </div>
        </div>
    )
}

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
