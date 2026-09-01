'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ShieldCheck, ArrowRight, LayoutDashboard, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'

export default function Navbar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const [isOpen, setIsOpen] = React.useState(false)

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Webinar', href: '/webinar' },
        { name: 'Pembelajaran', href: '/pembelajaran' },
        { name: 'Pengetahuan', href: '/manajemen-pengetahuan' },
        { name: 'Pengumuman', href: '/pengumuman' },
        { name: 'Tentang', href: '/tentang' },
    ]

    const isActive = (path: string) => pathname === path

    return (
<nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-3xl border-b border-slate-100 px-4 md:px-6 lg:px-12 py-3 md:py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105">
                    <div className="p-1 md:p-1.5 rounded-xl md:rounded-2xl bg-blue-50 shadow-lg shadow-blue-100 border border-blue-100">
                        <Image
                            src="/surajaya_corpu.webp"
                            alt="Surajaya Corpu Logo"
                            className="h-12 w-auto object-contain md:h-14 lg:h-16"
                            width={64}
                            height={64}
                            priority={true}
                            unoptimized
                        />
                    </div>
                    <div className="hidden sm:block">
                        <span className="text-base md:text-lg lg:text-xl font-black tracking-tighter italic text-slate-900 leading-none">SURAJAYA</span>
                        <span className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-indigo-600 mt-0.5">Kabupaten Lamongan</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`text-xs font-black uppercase tracking-widest transition-all hover:text-indigo-600 ${isActive(link.href) ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-slate-400'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    {user ? (
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100"
                            >
                                DASHBOARD <LayoutDashboard className="h-4 w-4" />
                            </Link>
                            <button
                                onClick={() => logout()}
                                className="flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-2.5 rounded-2xl font-black text-xs hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 border border-slate-200"
                            >
                                LOGOUT <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-8 py-2.5 rounded-2xl font-black text-xs hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl"
                        >
                            LOGIN <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}

                    <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu" className="md:hidden h-10 w-10 flex items-center justify-center bg-slate-900 text-white rounded-xl shadow-lg active:scale-90 transition-all">
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <>
                    <div className="md:hidden fixed inset-0 top-[72px] bg-slate-900/20 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} aria-hidden />
                    <div className="md:hidden absolute top-full left-2 right-2 bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] rounded-b-[2rem] p-6 space-y-1 animate-in slide-in-from-top-2 duration-200 z-50 overflow-hidden">
                        {user && (
                            <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                                    {user.nama?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-900 truncate">{user.nama}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">{user.role}</p>
                                </div>
                            </div>
                        )}
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-colors ${isActive(link.href) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {link.name}
                                <ArrowRight className={`h-4 w-4 transition-transform ${isActive(link.href) ? 'opacity-100' : 'opacity-0'}`} />
                            </Link>
                        ))}

                        <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-between bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-[0.98] transition-transform"
                                    >
                                        My Dashboard <LayoutDashboard className="h-4 w-4" />
                                    </Link>
                                    <button
                                        onClick={() => { logout(); setIsOpen(false); }}
                                        className="w-full flex items-center justify-between bg-white text-slate-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 active:scale-[0.98] transition-transform"
                                    >
                                        Keluar Sesi <LogOut className="h-4 w-4" />
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-[0.98] transition-transform"
                                >
                                    Akses Platform <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                </>
            )}
        </nav>
    )
}
