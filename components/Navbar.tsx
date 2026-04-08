'use client'

import React from 'react'
import Link from 'next/link'
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
        { name: 'Pengumuman', href: '/pengumuman' },
        { name: 'Tentang', href: '/tentang' },
    ]

    const isActive = (path: string) => pathname === path

    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-3xl border-b border-slate-100 px-6 lg:px-12 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105">
                    <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 group-hover:rotate-12 transition-transform">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">SI-SOTO</span>
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

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
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
                            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-2.5 rounded-2xl font-black text-xs hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl"
                        >
                            LOGIN <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}

                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden h-10 w-10 flex items-center justify-center bg-slate-50 rounded-xl">
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={`block text-sm font-black uppercase tracking-widest ${isActive(link.href) ? 'text-indigo-600' : 'text-slate-400'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="pt-6 mt-6 border-t border-slate-100 space-y-4">
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
                                >
                                    My Dashboard <LayoutDashboard className="h-4 w-4" />
                                </Link>
                                <button
                                    onClick={() => { logout(); setIsOpen(false); }}
                                    className="w-full flex items-center justify-between bg-slate-50 text-slate-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-100"
                                >
                                    Keluar Sesi <LogOut className="h-4 w-4" />
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-between bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
                            >
                                Akses Platform <ArrowRight className="h-4 w-4" />
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
