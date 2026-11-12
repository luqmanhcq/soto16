'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
    Home,
    Video,
    BookOpen,
    FileCheck,
    User,
    LayoutDashboard,
    LogOut,
    Menu,
    Award,
    X,
    Users,
    Lightbulb,
    ChevronDown,
    ChevronRight,
    Megaphone,
    Layers,
    GraduationCap,
} from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
    const pathname = usePathname()
    const { user, logout } = useAuth()

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Webinar', href: '/webinar', icon: Video },
        { name: 'Pembelajaran', href: '/pembelajaran', icon: BookOpen },
        { name: 'Manajemen Pengetahuan', href: '/manajemen-pengetahuan', icon: Lightbulb },
        { name: 'Sertifikat', href: '/sertifikat', icon: FileCheck },
        { name: 'Profil', href: '/profil', icon: User },
    ]

    // ——— Kelompok Manajemen Sistem sebagai tree ———
    const adminGroups = [
        {
            label: 'Kelas & Webinar',
            icon: Layers,
            items: [
                { name: 'Data Webinar', href: '/admin/webinar', icon: Video },
                { name: 'Data E-Learning', href: '/admin/pembelajaran', icon: BookOpen },
                { name: 'Data MP', href: '/admin/manajemen-pengetahuan', icon: Lightbulb },
            ],
        },
        {
            label: 'Publikasi',
            icon: Megaphone,
            items: [
                { name: 'Data Pengumuman', href: '/admin/pengumuman', icon: Home },
                { name: 'Data Carousel', href: '/admin/carousel', icon: LayoutDashboard },
            ],
        },
        {
            label: 'Sertifikat',
            icon: GraduationCap,
            items: [
                { name: 'Rekap Webinar', href: '/admin/sertifikat-webinar', icon: Award },
                { name: 'Approval Sertifikat', href: '/admin/sertifikat', icon: FileCheck },
            ],
        },
    ]

    const superAdminNavigation = [
        { name: 'Manajemen User', href: '/admin/users', icon: Users },
    ]

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')
    const isGroupActive = (items: { href: string }[]) => items.some(i => isActive(i.href))

    // state buka/tutup tiap kelompok (default: buka jika ada item aktif, tutup lainnya biar ringkas)
    const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
        const init: Record<string, boolean> = {}
        adminGroups.forEach(g => { init[g.label] = isGroupActive(g.items) })
        // di awal biarkan 1 grup pertama terbuka agar tidak kosong
        if (!Object.values(init).some(Boolean)) init[adminGroups[0].label] = true
        return init
    })
    React.useEffect(() => {
        // auto-buka grup yang berisi halaman aktif
        setOpenGroups(prev => {
            const next = { ...prev }
            let changed = false
            adminGroups.forEach(g => {
                if (isGroupActive(g.items) && !next[g.label]) { next[g.label] = true; changed = true }
            })
            return changed ? next : prev
        })
    }, [pathname])

    const toggleGroup = (label: string) => setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
    const isSuper = user?.role === 'super_admin'

    const renderAdminTree = (compact = false) => (
        <>
            {adminGroups.map(group => {
                const open = !!openGroups[group.label]
                const activeGroup = isGroupActive(group.items)
                return (
                    <div key={group.label} className="mb-1">
                        <button
                            onClick={() => toggleGroup(group.label)}
                            className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-black tracking-widest uppercase transition-all ${activeGroup ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                        >
                            <span className="flex items-center gap-2">
                                <group.icon className={`h-4 w-4 ${activeGroup ? 'text-indigo-600' : 'text-slate-400'}`} />
                                {group.label}
                            </span>
                            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                        <div className={`grid transition-all duration-200 ${open ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                                <div className="ml-3 pl-3 border-l border-slate-100 space-y-1 py-1">
                                    {group.items.map(item => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all ${isActive(item.href) ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
                                        >
                                            <item.icon className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{item.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
            {isSuper && (
                <div className="mt-2 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-3 mb-2">Super Admin</p>
                    {superAdminNavigation.map(item => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-all ${isActive(item.href) ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <item.icon className="h-4 w-4" /> {item.name}
                        </Link>
                    ))}
                </div>
            )}
        </>
    )

    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-50 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                <nav className="fixed inset-y-0 left-0 w-72 bg-white p-6 shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <Image src="/surajaya_corpu.webp" alt="Logo" className="h-10 w-auto" width={40} height={40} priority={true} unoptimized />
                        <button onClick={() => setIsSidebarOpen(false)}><X className="h-6 w-6 text-slate-400" /></button>
                    </div>
                    <div className="flex-1 space-y-1 overflow-y-auto -mr-2 pr-2 custom-scrollbar">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${isActive(item.href) ? 'bg-amber-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                        {isAdmin && (
                            <>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-6 mb-2 ml-3">Manajemen Sistem</p>
                                {renderAdminTree(true)}
                            </>
                        )}
                    </div>
                    <div className="pt-4 border-t border-slate-100 mt-4">
                        <div className="flex items-center gap-3 mb-3 px-2">
                            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">{user?.nama?.[0]}</div>
                            <div className="truncate"><p className="text-sm font-bold text-slate-800 truncate">{user?.nama}</p><p className="text-[10px] text-slate-400 uppercase">{user?.role}</p></div>
                        </div>
                        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">
                            <LogOut className="h-5 w-5" /> Keluar
                        </button>
                    </div>
                </nav>
            </div>

            {/* Desktop Sidebar */}
            <nav className="hidden lg:flex w-72 flex-col bg-white border-r border-slate-200">
                <div className="px-8 pt-8 pb-6 shrink-0">
                    <Image src="/surajaya_corpu.webp" alt="Logo" className="h-14 w-auto" width={56} height={56} priority={true} unoptimized />
                    <p className="text-[10px] text-slate-400 font-black tracking-[0.3em] mt-3 uppercase leading-none italic">Talent Hub Platform</p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 custom-scrollbar">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-3">Menu Utama</p>
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${isActive(item.href)
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-amber-600'
                                }`}
                        >
                            <item.icon className={`h-5 w-5 ${isActive(item.href) ? 'text-white' : ''}`} />
                            {item.name}
                        </Link>
                    ))}

                    {isAdmin && (
                        <div className="mt-6">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-3">Manajemen Sistem</p>
                            {renderAdminTree()}
                        </div>
                    )}
                </div>

                <div className="shrink-0 px-6 py-5 border-t border-slate-100 bg-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {user?.nama?.[0]}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.nama}</p>
                            <p className="text-[10px] text-slate-400 font-medium truncate uppercase">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Keluar Platform
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
                <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shrink-0">
                    <button onClick={() => setIsSidebarOpen(true)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-50 active:scale-95 transition-all"><Menu className="h-6 w-6 text-slate-600" /></button>
                    <Image src="/surajaya_corpu.webp" alt="Logo" className="h-8 w-auto" width={32} height={32} priority={true} unoptimized />
                    <span className="text-xs font-black tracking-widest uppercase text-slate-600 truncate">SURAJAYA CORPU</span>
                </header>
                <main className="flex-1 overflow-y-auto overflow-x-hidden focus:outline-none min-w-0 w-full">
                    <div className="min-w-0 w-full max-w-full overflow-x-hidden">
                        {children}
                    </div>
                </main>
            </div>
        </div>
            </ProtectedRoute>
    )
}
