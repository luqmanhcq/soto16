'use client'

import React, { useState, useEffect } from 'react'
import {
    Users,
    Search,
    Loader2,
    ShieldCheck,
    UserCog,
    ToggleLeft,
    ToggleRight,
    Filter,
    ArrowRight,
    ShieldAlert,
    CheckCircle2,
    AlertCircle,
    UserCheck,
    UserX,
    MoreHorizontal,
    Trash2,
    Edit3,
    Key,
    X,
    Save
} from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'

export default function UserManagementPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')

    // State for Modals
    const [editingUser, setEditingUser] = useState<any>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // State for Forms
    const [editForm, setEditForm] = useState({
        nama: '',
        nip: '',
        email: '',
        jabatan: '',
        unit_kerja: '',
        golongan: ''
    })
    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    })

    useEffect(() => {
        if (user && user.role !== 'super_admin') {
            router.push('/dashboard')
            return
        }
        fetchUsers()
    }, [user])

    async function fetchUsers() {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/users')
            const data = await res.json()
            if (res.ok) setUsers(data.data || [])
        } catch (err) {
            console.error('Gagal mengambil data user', err)
        } finally {
            setLoading(false)
        }
    }

    async function toggleActive(userId: number, currentStatus: boolean) {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                body: JSON.stringify({ is_active: !currentStatus })
            })
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u))
            }
        } catch (err) {
            console.error('Gagal update status user', err)
        }
    }

    async function changeRole(userId: number, newRole: string) {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                body: JSON.stringify({ role: newRole })
            })
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
            }
        } catch (err) {
            console.error('Gagal ganti role user', err)
        }
    }
    async function deleteUser(userId: number) {
        if (!confirm('Apakah Anda yakin ingin menghapus user ini secara permanen?')) return

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                setUsers(users.filter(u => u.id !== userId))
            }
        } catch (err) {
            console.error('Gagal menghapus user', err)
        }
    }

    const openEditModal = (u: any) => {
        setEditingUser(u)
        setEditForm({
            nama: u.nama || '',
            nip: u.nip || '',
            email: u.email || '',
            jabatan: u.jabatan || '',
            unit_kerja: u.unit_kerja || '',
            golongan: u.golongan || ''
        })
        setIsEditModalOpen(true)
    }

    const openPasswordModal = (u: any) => {
        setEditingUser(u)
        setPasswordData({ password: '', confirmPassword: '' })
        setIsPasswordModalOpen(true)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingUser) return
        setSubmitting(true)

        try {
            const res = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            })

            if (res.ok) {
                const updated = await res.json()
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u))
                setIsEditModalOpen(false)
                alert('Profil pengguna berhasil diperbarui')
            } else {
                const error = await res.json()
                alert(error.message || 'Gagal memperbarui profil')
            }
        } catch (err) {
            console.error('Error updating user', err)
            alert('Terjadi kesalahan sistem')
        } finally {
            setSubmitting(false)
        }
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingUser) return
        if (passwordData.password !== passwordData.confirmPassword) {
            alert('Password tidak cocok')
            return
        }
        if (passwordData.password.length < 6) {
            alert('Password minimal 6 karakter')
            return
        }

        setSubmitting(true)

        try {
            const res = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: passwordData.password })
            })

            if (res.ok) {
                setIsPasswordModalOpen(false)
                alert('Password pengguna berhasil direset')
            } else {
                const error = await res.json()
                alert(error.message || 'Gagal mereset password')
            }
        } catch (err) {
            console.error('Error resetting password', err)
            alert('Terjadi kesalahan sistem')
        } finally {
            setSubmitting(false)
        }
    }

    const filtered = users.filter(u => {
        const matchesSearch = u.nama.toLowerCase().includes(search.toLowerCase()) || u.nip.includes(search)
        const matchesRole = roleFilter === 'all' || u.role === roleFilter
        return matchesSearch && matchesRole
    })

    if (user?.role !== 'super_admin') return null

    return (
        <div className="p-8 lg:p-12 space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                        <ShieldCheck className="h-5 w-5" />
                        <span className="text-xs font-black uppercase tracking-widest leading-none">Direktori Otoritas Sistem</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                        Manajemen <span className="text-indigo-600">Pengguna.</span>
                    </h1>
                </div>
            </header>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden shadow-slate-200/50">
                <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center gap-8 bg-slate-50/30">
                    <div className="flex-1 flex items-center gap-4 px-8 py-5 bg-white rounded-[2rem] border border-slate-100 focus-within:ring-4 focus-within:ring-indigo-100 transition-all shadow-sm group">
                        <Search className="h-6 w-6 text-slate-300 group-focus-within:text-indigo-600" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan Nama atau NIP..."
                            className="flex-1 bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm overflow-x-auto">
                        {['all', 'super_admin', 'admin', 'asn'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRoleFilter(r)}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest leading-none transition-all ${roleFilter === r ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                {r === 'all' ? 'SEMUA ROLE' : r.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Profil & NIP</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Jabatan & Unit</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Otoritas</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Manajemen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-32 text-center">
                                        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto" />
                                        <p className="mt-4 font-black text-slate-300 uppercase tracking-widest text-[10px]">Sinkronisasi Direktori...</p>
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? (
                                filtered.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-lg border-2 border-white shadow-lg ${u.role === 'super_admin' ? 'bg-slate-900 text-white' : u.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                    {u.nama.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-lg leading-none mb-2 group-hover:text-indigo-600 transition-colors">{u.nama}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic flex items-center gap-2">
                                                        <ShieldAlert className="h-3 w-3" /> NIP: {u.nip}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="space-y-1.5">
                                                <p className="text-sm font-black text-slate-700 leading-tight italic">{u.jabatan || 'Fungsional Umum'}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.unit_kerja || 'Instansi Terkait'}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <select
                                                value={u.role}
                                                onChange={(e) => changeRole(u.id, e.target.value)}
                                                disabled={u.id === user.id}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer outline-none border transition-all text-center
                                                    ${u.role === 'super_admin' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-600'}`}
                                            >
                                                <option value="asn">ASN Biasa</option>
                                                <option value="admin">Admin Instansi</option>
                                                <option value="super_admin">Super Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <button
                                                onClick={() => toggleActive(u.id, u.is_active)}
                                                disabled={u.id === user.id}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-all shadow-sm
                                                    ${u.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white'}`}
                                            >
                                                {u.is_active ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                                    {u.is_active ? 'AKTIF' : 'NONAKTIF'}
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => openPasswordModal(u)}
                                                    className="h-12 w-12 bg-white text-indigo-300 rounded-2xl flex items-center justify-center border border-slate-50 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm group/btn"
                                                    title="Reset Password"
                                                >
                                                    <Key className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <button 
                                                    onClick={() => openEditModal(u)}
                                                    className="h-12 w-12 bg-white text-emerald-300 rounded-2xl flex items-center justify-center border border-slate-50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm group/btn"
                                                    title="Edit User"
                                                >
                                                    <Edit3 className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <button 
                                                    onClick={() => deleteUser(u.id)}
                                                    disabled={u.id === user?.id}
                                                    className="h-12 w-12 bg-white text-red-300 rounded-2xl flex items-center justify-center border border-slate-50 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed group/btn"
                                                    title="Hapus User"
                                                >
                                                    <Trash2 className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-10 py-40 text-center space-y-4">
                                        <Filter className="h-16 w-16 text-slate-200 mx-auto" />
                                        <p className="text-2xl font-black text-slate-300 italic uppercase">User tidak ditemukan</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                                    Edit <span className="text-emerald-600">Profil.</span>
                                </h2>
                                <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Memperbarui data otoritas user</p>
                            </div>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="h-14 w-14 bg-white text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-10 space-y-8 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nama Lengkap</label>
                                    <input 
                                        type="text"
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none"
                                        value={editForm.nama}
                                        onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">NIP</label>
                                    <input 
                                        type="text"
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none"
                                        value={editForm.nip}
                                        onChange={(e) => setEditForm({ ...editForm, nip: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email</label>
                                    <input 
                                        type="email"
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Golongan</label>
                                    <input 
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none"
                                        value={editForm.golongan}
                                        onChange={(e) => setEditForm({ ...editForm, golongan: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Jabatan</label>
                                    <input 
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none"
                                        value={editForm.jabatan}
                                        onChange={(e) => setEditForm({ ...editForm, jabatan: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Unit Kerja</label>
                                    <input 
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none"
                                        value={editForm.unit_kerja}
                                        onChange={(e) => setEditForm({ ...editForm, unit_kerja: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex justify-end">
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-4 px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                                    Reset <span className="text-indigo-600">Sandi.</span>
                                </h2>
                                <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amankan ulang akses user</p>
                            </div>
                            <button 
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="h-14 w-14 bg-white text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Password Baru</label>
                                    <input 
                                        type="password"
                                        required
                                        placeholder="Min. 6 karakter"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                                        value={passwordData.password}
                                        onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Konfirmasi Password</label>
                                    <input 
                                        type="password"
                                        required
                                        placeholder="Ulangi password baru"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex justify-end">
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 hover:-translate-y-1 transition-all disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
