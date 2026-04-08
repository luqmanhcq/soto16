'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import {
    Home,
    Video,
    BookOpen,
    FileCheck,
    User,
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    Users
} from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
    const pathname = usePathname()
    const { user, logout } = useAuth()

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Webinar', href: '/webinar', icon: Video },
        { name: 'Pembelajaran', href: '/pembelajaran', icon: BookOpen },
        { name: 'Sertifikat', href: '/sertifikat', icon: FileCheck },
        { name: 'Profil', href: '/profil', icon: User },
    ]

    const adminNavigation = [
        { name: 'Data Webinar', href: '/admin/webinar', icon: Video },
        { name: 'Data E-Learning', href: '/admin/pembelajaran', icon: BookOpen },
        { name: 'Data Pengumuman', href: '/admin/pengumuman', icon: Home },
        { name: 'Approval Sertifikat', href: '/admin/sertifikat', icon: FileCheck },
    ]

    const superAdminNavigation = [
        { name: 'Manajemen User', href: '/admin/users', icon: Users },
    ]

    const isActive = (path: string) => pathname === path

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-50 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                <nav className="fixed inset-y-0 left-0 w-64 bg-white p-6 shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <span className="text-2xl font-bold text-blue-600">SI-SOTO</span>
                        <button onClick={() => setIsSidebarOpen(false)}><X className="h-6 w-6 text-slate-400" /></button>
                    </div>
                    <div className="flex-1 space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive(item.href) ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                        {(user?.role === 'admin' || user?.role === 'super_admin') && (
                            <>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 mt-6 ml-4">Manajemen</p>
                                {adminNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive(item.href) ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                        onClick={() => setIsSidebarOpen(false)}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                ))}
                                {user?.role === 'super_admin' && (
                                    <>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 mt-6 ml-4">Super Admin</p>
                                        {superAdminNavigation.map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive(item.href) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                                onClick={() => setIsSidebarOpen(false)}
                                            >
                                                <item.icon className="h-5 w-5" />
                                                {item.name}
                                            </Link>
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        <LogOut className="h-5 w-5" />
                        Keluar
                    </button>
                </nav>
            </div>

            {/* Desktop Sidebar */}
            <nav className="hidden lg:flex w-72 flex-col bg-white border-r border-slate-200 p-8">
                <div className="mb-12">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        SI-SOTO
                    </h1>
                    <p className="text-xs text-slate-400 font-medium tracking-widest mt-1">CORE UNIVERSITY PLATFORM</p>
                </div>

                <div className="flex-1 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-4">Menu Utama</p>
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive(item.href)
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-2'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                                }`}
                        >
                            <item.icon className={`h-5 w-5 ${isActive(item.href) ? 'text-white' : ''}`} />
                            {item.name}
                        </Link>
                    ))}

                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-8 ml-4 leading-none">Manajemen Sistem</p>
                            {adminNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive(item.href)
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-2'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive(item.href) ? 'text-white' : ''}`} />
                                    {item.name}
                                </Link>
                            ))}
                            {user?.role === 'super_admin' && (
                                <>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-8 ml-4 leading-none">Super Admin Only</p>
                                    {superAdminNavigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive(item.href)
                                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 translate-x-2'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >
                                            <item.icon className={`h-5 w-5 ${isActive(item.href) ? 'text-white' : ''}`} />
                                            {item.name}
                                        </Link>
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="mt-auto pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-4 mb-6 px-2">
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
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Keluar Platform
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-6">
                    <button onClick={() => setIsSidebarOpen(true)}><Menu className="h-6 w-6 text-slate-600" /></button>
                    <span className="ml-4 font-bold text-slate-800">SI-SOTO</span>
                </header>
                <main className="flex-1 overflow-y-auto focus:outline-none">
                    {children}
                </main>
            </div>
        </div>
    )
}
