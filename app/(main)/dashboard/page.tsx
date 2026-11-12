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
    ShieldCheck,
    FileCheck,
    Calendar,
    ArrowRight,
    Sparkles,
    Zap,
    Layers,
    GraduationCap,
    PlayCircle,
    Lightbulb,
    ChevronRight,
    Target,
    MessageCircle,
    FileText,
    Download,
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

    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                <div className="h-24 rounded-3xl bg-white border border-slate-100 animate-pulse" />
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 sm:h-32 rounded-2xl bg-white border border-slate-100 animate-pulse" />
                    ))}
                </div>
                <div className="h-80 rounded-3xl bg-white border border-slate-100 animate-pulse" />
            </div>
        )
    }

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
    const firstName = user?.nama?.split(' ')[0] ?? 'ASN'
    const totalJp = stats?.totalJp || 0
    const targetJp = 20
    const pct = Math.min(Math.round((totalJp / targetJp) * 100), 100)

    return (
        <div className="min-h-screen bg-[#f8fafc] w-full overflow-x-hidden">
            <div className="max-w-7xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10 space-y-5 sm:space-y-8 overflow-hidden">
                {/* Header */}
                <header className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-3">
                                <Sparkles className="h-3 w-3 text-indigo-600" />
                                <span className="text-[10px] font-black tracking-widest uppercase text-indigo-600">Dashboard</span>
                            </div>
                            <h1 className="text-[22px] sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                                Halo, {firstName}! <span className="inline-block">👋</span>
                            </h1>
                            <p className="mt-1.5 text-xs sm:text-sm font-semibold text-slate-500 flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-400">
                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                    Semangat belajar hari ini
                                </span>
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm shrink-0">
                            <div className="h-7 w-7 rounded-xl bg-amber-400 flex items-center justify-center">
                                <Zap className="h-3.5 w-3.5 text-white fill-white" />
                            </div>
                            <span className="text-xs font-black text-slate-700">SURAJAYA CORPU</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-900 text-white">v1.0</span>
                        </div>
                    </div>

                    {/* Mobile quick actions */}
                    <div className="grid grid-cols-2 sm:hidden gap-3">
                        <Link href="/webinar" className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900 text-white active:scale-[0.98] transition-transform">
                            <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center">
                                <Video className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black leading-none">Webinar</p>
                                <p className="text-[10px] opacity-70">Jadwal & daftar</p>
                            </div>
                            <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
                        </Link>
                        <Link href="/pembelajaran" className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 active:scale-[0.98] transition-transform">
                            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <BookOpen className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black text-slate-900 leading-none">E-Learning</p>
                                <p className="text-[10px] text-slate-500">Kursus</p>
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Stats */}
                <section>
                    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                        {isAdmin ? (
                            <>
                                <StatCard label="Total ASN" value={stats?.totalUsers || 0} sub="Pengguna terdaftar" icon={Users} tone="blue" href="/admin/users" />
                                <StatCard label="Webinar Aktif" value={stats?.totalWebinars || 0} sub="Event berjalan" icon={Video} tone="indigo" href="/admin/webinar" />
                                <StatCard label="E-Learning" value={stats?.totalLessons || 0} sub="Materi tersedia" icon={BookOpen} tone="violet" href="/admin/pembelajaran" />
                                <StatCard label="Usul Sertifikat" value={stats?.certificates?.total || 0} sub="Menunggu & selesai" icon={Award} tone="emerald" href="/admin/sertifikat" />
                            </>
                        ) : (
                            <>
                                <StatCard label="Capaian JP" value={`${totalJp} JP`} sub={`dari ${targetJp} JP target`} icon={Target} tone="amber" highlight />
                                <StatCard label="Webinar Diikuti" value={stats?.webinarsJoined || 0} sub="Terdaftar" icon={Video} tone="blue" href="/webinar" />
                                <StatCard label="Kursus Selesai" value={stats?.lessons?.completed || 0} sub="Dari pembelajaran" icon={CheckCircle2} tone="emerald" href="/pembelajaran" />
                                <StatCard label="Sertifikat" value={stats?.certificates?.approved || 0} sub="Disetujui" icon={ShieldCheck} tone="indigo" href="/sertifikat" />
                            </>
                        )}
                    </div>
                </section>

                <div className="grid gap-5 sm:gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3 items-start w-full max-w-full min-w-0 overflow-hidden">
                    {/* Main - full width on mobile */}
                    <div className="lg:col-span-2 space-y-5 sm:space-y-6 min-w-0 w-full max-w-full overflow-hidden">
                        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden w-full max-w-full min-w-0">
                            <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full min-w-0 overflow-hidden">
                                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                    <span className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-100">
                                        {isAdmin ? <Layers className="h-4 w-4" /> : <GraduationCap className="h-5 w-5" />}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-[15px] sm:text-lg font-black text-slate-900 leading-none tracking-tight">
                                            {isAdmin ? 'Ringkasan Sistem' : 'Progres Kompetensi'}
                                        </h2>
                                        {!isAdmin && (
                                            <p className="text-[11px] font-bold text-slate-500 mt-1 sm:hidden">
                                                {totalJp}/{targetJp} JP • {pct}% tercapai
                                            </p>
                                        )}
                                        <p className="hidden sm:block text-xs font-semibold text-slate-500 mt-1">
                                            {isAdmin ? 'Monitoring aktivitas platform' : 'Pantau capaian Jam Pelajaran tahunan'}
                                        </p>
                                    </div>
                                    {!isAdmin && (
                                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-widest shrink-0">
                                            <TrendingUp className="h-3 w-3" /> {pct}% TERCAPAI
                                        </span>
                                    )}
                                    {!isAdmin && (
                                        <span className="sm:hidden inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shrink-0">
                                            <TrendingUp className="h-4 w-4" />
                                        </span>
                                    )}
                                </div>

                                {!isAdmin ? (
                                    <div className="space-y-4 sm:space-y-6">
                                        {/* Progress - mobile friendly */}
                                        <div className="rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 p-3.5 sm:p-5 overflow-hidden">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                                                <p className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase text-slate-500 leading-none">Jam Pelajaran Terkumpul</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-black text-indigo-600 shadow-sm">
                                                        {totalJp}/{targetJp} JP
                                                    </span>
                                                    <span className="inline-flex sm:hidden items-center px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-black">
                                                        {pct}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="relative h-2.5 sm:h-3 w-full bg-white rounded-full overflow-hidden border border-slate-200 p-1 flex items-center">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 transition-all duration-700 ease-out"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between mt-2.5 gap-2">
                                                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">0 JP</span>
                                                <span className="text-[10px] font-black tracking-widest uppercase text-indigo-600 text-right">Target {targetJp} JP / tahun</span>
                                            </div>

                                            <div className="mt-3 sm:mt-3.5">
                                                {pct < 100 ? (
                                                    <div className="flex items-start gap-2 rounded-xl bg-white border border-slate-100 p-2.5 sm:p-3">
                                                        <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                                            <Target className="h-3.5 w-3.5" />
                                                        </div>
                                                        <p className="text-xs font-medium leading-relaxed text-slate-600">
                                                            Sisa <span className="font-black text-slate-900">{Math.max(targetJp - totalJp, 0)} JP</span> lagi menuju target. Yuk ikut webinar atau selesaikan kursus!
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 sm:p-3 text-emerald-700">
                                                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                                                        <p className="text-xs font-black">Target tercapai! Pertahankan capaianmu.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Breakdown - mobile stack (full width, no horizontal overflow), desktop 3 cols */}
                                        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-3 w-full max-w-full min-w-0">
                                            <div className="min-w-0 w-full max-w-full rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-100 p-3 sm:p-4 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2 overflow-hidden">
                                                <div className="min-w-0 flex-1 sm:flex-none">
                                                    <p className="text-[10px] font-black tracking-widest uppercase text-blue-600 leading-none truncate">Webinar</p>
                                                    <p className="hidden sm:block mt-1 text-[11px] font-semibold text-blue-600/70 leading-none truncate">Live & rekaman</p>
                                                </div>
                                                <p className="text-lg sm:text-2xl font-black text-blue-700 leading-none shrink-0">{stats?.webinarJp || 0} <span className="text-xs font-bold">JP</span></p>
                                            </div>
                                            <div className="min-w-0 w-full max-w-full rounded-xl sm:rounded-2xl bg-violet-50 border border-violet-100 p-3 sm:p-4 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2 overflow-hidden">
                                                <div className="min-w-0 flex-1 sm:flex-none">
                                                    <p className="text-[10px] font-black tracking-widest uppercase text-violet-600 leading-none truncate">E-Learning</p>
                                                    <p className="hidden sm:block mt-1 text-[11px] font-semibold text-violet-600/70 leading-none truncate">Mandiri</p>
                                                </div>
                                                <p className="text-lg sm:text-2xl font-black text-violet-700 leading-none shrink-0">{stats?.pembelajaranJp || 0} <span className="text-xs font-bold">JP</span></p>
                                            </div>
                                            <div className="min-w-0 w-full max-w-full rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 p-3 sm:p-4 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2 ring-1 ring-emerald-200/50 overflow-hidden">
                                                <div className="min-w-0 flex-1 sm:flex-none">
                                                    <p className="text-[10px] font-black tracking-widest uppercase text-emerald-600 leading-none truncate">Total</p>
                                                    <p className="hidden sm:block mt-1 text-[11px] font-semibold text-emerald-600/70 leading-none truncate">Akumulasi</p>
                                                </div>
                                                <p className="text-lg sm:text-2xl font-black text-emerald-700 leading-none shrink-0">{totalJp} <span className="text-xs font-bold">JP</span></p>
                                            </div>
                                        </div>

                                        {/* Joined Webinars */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xs font-black tracking-widest uppercase text-slate-500">Webinar yang Diikuti</h3>
                                                <Link href="/webinar" className="text-[11px] font-black tracking-widest uppercase text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                                    Lihat semua <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            </div>

                                            {stats?.joinedWebinars?.length > 0 ? (
                                                <div className="space-y-3 w-full max-w-full min-w-0">
                                                    {stats.joinedWebinars.slice(0, 4).map((webinar: any) => (
                                                        <Link
                                                            key={webinar.id}
                                                            href={`/webinar/${webinar.id}`}
                                                            className="group flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all w-full max-w-full min-w-0 overflow-hidden"
                                                        >
                                                            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                                <PlayCircle className="h-5 w-5" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 pr-2">{webinar.nama_webinar}</p>
                                                                <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                                    <Calendar className="h-3 w-3 shrink-0" />
                                                                    <span className="truncate">{new Date(webinar.tanggal_mulai).toLocaleDateString('id-ID')} • {webinar.kategori}</span>
                                                                </p>
                                                            </div>
                                                            <div className="hidden sm:flex items-center gap-2 shrink-0">
                                                                {webinar.jumlah_jp ? (
                                                                    <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-black">{webinar.jumlah_jp} JP</span>
                                                                ) : null}
                                                                <span className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">
                                                                    <ArrowRight className="h-4 w-4" />
                                                                </span>
                                                            </div>
                                                            <ChevronRight className="h-4 w-4 text-slate-300 sm:hidden shrink-0" />
                                                        </Link>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-300">
                                                        <Video className="h-6 w-6" />
                                                    </div>
                                                    <p className="text-sm font-black text-slate-600">Belum ada webinar</p>
                                                    <p className="text-xs font-medium text-slate-500 mt-1">Daftar webinar untuk mulai kumpulkan JP</p>
                                                    <Link href="/webinar" className="inline-flex mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black tracking-widest hover:bg-indigo-700">JELAJAHI WEBINAR</Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                                            <p className="text-[11px] font-black tracking-widest uppercase text-slate-500 mb-4">Status Usulan Sertifikat</p>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-100">
                                                    <span className="flex items-center gap-2 text-xs font-bold text-amber-600"><Clock className="h-4 w-4" /> Menunggu</span>
                                                    <span className="text-lg font-black text-slate-900">{stats?.certificates?.pending || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-100">
                                                    <span className="flex items-center gap-2 text-xs font-bold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Disetujui</span>
                                                    <span className="text-lg font-black text-slate-900">{stats?.certificates?.approved || 0}</span>
                                                </div>
                                                <Link href="/admin/sertifikat" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-black tracking-widest hover:bg-black">
                                                    KELOLA SERTIFIKAT <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="rounded-2xl bg-indigo-600 p-6 text-white relative overflow-hidden flex flex-col">
                                            <div className="absolute -right-8 -bottom-8 opacity-10">
                                                <Layers className="h-32 w-32" />
                                            </div>
                                            <h3 className="text-lg font-black">Kelola Konten</h3>
                                            <p className="text-sm text-indigo-100 mt-1 leading-relaxed">Perbarui webinar & pembelajaran secara berkala untuk ASN.</p>
                                            <div className="mt-auto pt-6 flex flex-wrap gap-2">
                                                <Link href="/admin/webinar" className="px-4 py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-black hover:bg-slate-50">KELOLA WEBINAR</Link>
                                                <Link href="/admin/pembelajaran" className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-black">E-LEARNING</Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Extra for user: quick links */}
                        {!isAdmin && (
                            <section className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                                <Link href="/manajemen-pengetahuan" className="group flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-sm transition-all">
                                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                        <Lightbulb className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Pengetahuan</p>
                                        <p className="text-xs font-medium text-slate-500">Best practice ASN</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 ml-auto text-slate-300 group-hover:text-amber-500" />
                                </Link>
                                <Link href="/pembelajaran" className="group flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 hover:border-violet-200 hover:shadow-sm transition-all">
                                    <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Katalog Kursus</p>
                                        <p className="text-xs font-medium text-slate-500">Belajar mandiri</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 ml-auto text-slate-300 group-hover:text-violet-600" />
                                </Link>
                                <Link href="/sertifikat" className="group flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        <FileCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Sertifikat</p>
                                        <p className="text-xs font-medium text-slate-500">Unduh & kelola</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 ml-auto text-slate-300 group-hover:text-emerald-600" />
                                </Link>
                            </section>
                        )}
                    </div>

                    {/* Sidebar - stacks below on mobile, no horizontal overflow */}
                    <aside className="space-y-5 sm:space-y-6 min-w-0 w-full max-w-full overflow-hidden">
                        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-7 relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />
                            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-violet-500/20 blur-2xl" />
                            <div className="relative">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-lg font-black leading-tight">Komunitas ASN Lamongan</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-300">Diskusi, sharing pengalaman, dan update program terbaru di grup eksklusif.</p>
                                <button className="mt-5 w-full py-3.5 rounded-2xl bg-white text-slate-900 font-black text-xs tracking-widest hover:bg-indigo-50 transition-colors">
                                    GABUNG TELEGRAM
                                </button>
                                <p className="mt-3 text-center text-[10px] font-bold tracking-widest uppercase text-slate-400">Gratis untuk ASN terverifikasi</p>
                            </div>
                        </div>

                        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-black tracking-widest uppercase text-slate-400">Sertifikat Saya</p>
                                    <h3 className="mt-1 text-lg font-black text-slate-900">Akses & Unduh</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-500">Kelola sertifikat webinar & usulan luar platform.</p>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                    <FileCheck className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-black">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> {stats?.certificates?.approved || 0} Disetujui
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 font-bold">
                                    {stats?.certificates?.pending || 0} Menunggu
                                </span>
                            </div>
                            <Link href="/sertifikat" className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-blue-600 text-white font-black text-sm hover:bg-blue-700 active:scale-[0.98] transition-all">
                                Lihat Daftar Sertifikat <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
                            <h3 className="text-xs font-black tracking-widest uppercase text-slate-500">Pusat Bantuan</h3>
                            <div className="mt-4 space-y-1">
                                <div className="flex items-center gap-2 rounded-xl hover:bg-slate-50 transition-colors group">
                                    <a
                                        href="/4.%20Buku%20Panduan%20Pengguna%20DRAJAT%20ASN.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 flex-1 min-w-0 p-3.5"
                                    >
                                        <span className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <FileText className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-sm font-black text-slate-800">Panduan Penggunaan</span>
                                            <span className="block text-xs font-semibold text-slate-500">Buku Panduan DRAJAT ASN</span>
                                        </span>
                                    </a>
                                    <a
                                        href="/4.%20Buku%20Panduan%20Pengguna%20DRAJAT%20ASN.pdf"
                                        download="Buku Panduan Pengguna DRAJAT ASN.pdf"
                                        title="Unduh panduan"
                                        className="h-9 w-9 mr-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors shrink-0"
                                    >
                                        <Download className="h-4 w-4" />
                                    </a>
                                </div>
                                <a
                                    href="https://wa.me/6281336980266?text=Halo%20Helpdesk%20SURAJAYA%20CORPU%2C%20saya%20butuh%20bantuan."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-600 transition-colors group"
                                >
                                    <span className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                                        <MessageCircle className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-black text-slate-800 group-hover:text-white">Hubungi Helpdesk</span>
                                        <span className="block text-xs font-semibold text-emerald-700 group-hover:text-emerald-50">WA +62 813-3698-0266</span>
                                    </span>
                                    <ArrowRight className="h-4 w-4 ml-auto text-emerald-600 group-hover:text-white shrink-0" />
                                </a>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, sub, icon: Icon, tone, href, highlight }: { label: string; value: any; sub?: string; icon: any; tone: string; href?: string; highlight?: boolean }) {
    const toneMap: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        violet: 'bg-violet-50 text-violet-600 border-violet-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
    }
    const content = (
        <div className={`group relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden ${highlight ? 'ring-1 ring-amber-200' : ''}`}>
            <div className="flex items-start justify-between gap-3">
                <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl border flex items-center justify-center shrink-0 ${toneMap[tone] || toneMap.blue}`}>
                    <Icon className="h-5 w-5" />
                </div>
                {href && <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all hidden sm:block" />}
            </div>
            <p className="mt-4 text-[10px] sm:text-[11px] font-black tracking-widest uppercase text-slate-500 leading-none">{label}</p>
            <p className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900">{value}</p>
            {sub && <p className="mt-1 text-[11px] font-semibold text-slate-500">{sub}</p>}
        </div>
    )
    if (href) return <Link href={href}>{content}</Link>
    return content
}
