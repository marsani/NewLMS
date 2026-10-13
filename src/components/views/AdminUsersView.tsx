"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { User, Role } from "@/types";
import {
  Users,
  UserPlus,
  Search,
  Download,
  Trash2,
  Edit2,
  Shield,
  GraduationCap,
  BookOpen,
  RotateCcw,
  Key,
  Eye,
  EyeOff,
  X,
  AlertTriangle,
  CheckCircle,
  Lock,
} from "lucide-react";
import { exportToCSV } from "@/lib/utils";

export const AdminUsersView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, resetPasswordToDefault } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetConfirmUser, setResetConfirmUser] = useState<User | null>(null);
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formNimNip, setFormNimNip] = useState("");
  const [formRole, setFormRole] = useState<Role>("STUDENT");
  const [formProdi, setFormProdi] = useState("Teknik Informatika");
  const [formFaculty, setFormFaculty] = useState("Fakultas Teknologi Informasi");
  const [formDefaultPassword, setFormDefaultPassword] = useState("ucic1234");
  const [showPasswordField, setShowPasswordField] = useState(false);

  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userActionError, setUserActionError] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nim_nip.includes(searchQuery);
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleStats = {
    total: users.length,
    admin: users.filter((u) => u.role === "ADMIN").length,
    dosen: users.filter((u) => u.role === "DOSEN").length,
    student: users.filter((u) => u.role === "STUDENT").length,
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormNimNip("");
    setFormRole("STUDENT");
    setFormProdi("Teknik Informatika");
    setFormFaculty("Fakultas Teknologi Informasi");
    setFormDefaultPassword("ucic1234");
    setShowPasswordField(false);
    setUserActionError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormNimNip(user.nim_nip);
    setFormRole(user.role);
    setFormProdi(user.studyProgram || "Teknik Informatika");
    setFormFaculty(user.faculty || "Fakultas Teknologi Informasi");
    setFormDefaultPassword(user.defaultPassword || "ucic1234");
    setShowPasswordField(false);
    setUserActionError(null);
    setShowAddModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formNimNip.trim()) return;

    setIsSavingUser(true);
    setUserActionError(null);

    try {
      if (editingUser) {
        const res = await updateUser(editingUser.id, {
          name: formName.trim(),
          email: formEmail.trim(),
          nim_nip: formNimNip.trim(),
          role: formRole,
          studyProgram: formProdi,
          faculty: formFaculty,
          defaultPassword: formDefaultPassword,
        });

        if (res && res.success) {
          setResetMessage({ type: "success", text: `Akun "${formName}" berhasil diperbarui dan disimpan ke database!` });
          setTimeout(() => setResetMessage(null), 4000);
          setShowAddModal(false);
        } else {
          setUserActionError(res?.error || "Gagal memperbarui data pengguna di server.");
        }
      } else {
        const res = await addUser({
          name: formName.trim(),
          email: formEmail.trim(),
          nim_nip: formNimNip.trim(),
          role: formRole,
          studyProgram: formProdi,
          faculty: formFaculty,
          defaultPassword: formDefaultPassword,
          password: formDefaultPassword,
        });

        if (res && res.success) {
          setResetMessage({ type: "success", text: `Akun baru "${formName}" berhasil dibuat dan disimpan ke database!` });
          setTimeout(() => setResetMessage(null), 4000);
          setShowAddModal(false);
        } else {
          setUserActionError(res?.error || "Gagal menyimpan akun baru ke server.");
        }
      }
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetConfirmUser) return;
    const result = await resetPasswordToDefault(resetConfirmUser.id);
    setResetMessage({ type: result.success ? "success" : "error", text: result.message });
    setResetConfirmUser(null);
    setTimeout(() => setResetMessage(null), 4000);
  };

  const handleExportUsers = () => {
    exportToCSV("Data_Pengguna_LMS_UCIC.csv", users);
  };

  return (
    <div className="space-y-6">
      {/* Flash message */}
      {resetMessage && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-semibold animate-fade-in ${
            resetMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
          }`}
        >
          {resetMessage.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {resetMessage.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-600" />
            Manajemen Pengguna Civitas Akademika
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akun Dosen, Mahasiswa, dan Administrator. Atur password default dan reset akses pengguna.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={handleExportUsers}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Ekspor CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Pengguna", value: roleStats.total, icon: <Users className="w-4 h-4" />, color: "slate" },
          { label: "Administrator", value: roleStats.admin, icon: <Shield className="w-4 h-4" />, color: "rose" },
          { label: "Dosen", value: roleStats.dosen, icon: <BookOpen className="w-4 h-4" />, color: "amber" },
          { label: "Mahasiswa", value: roleStats.student, icon: <GraduationCap className="w-4 h-4" />, color: "blue" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className={`flex items-center gap-2 text-${stat.color}-600 dark:text-${stat.color}-400 mb-1`}>
              {stat.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Password Default Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs">
          <p className="font-bold text-amber-800 dark:text-amber-300 mb-0.5">Manajemen Password Default</p>
          <p className="text-amber-700 dark:text-amber-400">
            Setiap akun baru dibuat dengan <strong>password default</strong> yang Anda tentukan. Dosen & Mahasiswa dapat mengubah password sendiri setelah login. Gunakan tombol{" "}
            <strong>Reset Password</strong> (<RotateCcw className="w-3 h-3 inline" />) di tiap baris untuk mengembalikan password ke default ketika pengguna lupa password.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, NIM/NIP, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="ALL">Semua Role ({users.length})</option>
            <option value="STUDENT">Mahasiswa ({roleStats.student})</option>
            <option value="DOSEN">Dosen Pengampu ({roleStats.dosen})</option>
            <option value="ADMIN">Administrator ({roleStats.admin})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">NIM / NIP</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Program Studi</th>
                <th className="py-3 px-4">Pwd Default</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-600 dark:text-slate-300">
                    {u.nim_nip}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        u.role === "ADMIN"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : u.role === "DOSEN"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      }`}
                    >
                      {u.role === "ADMIN" ? "Admin" : u.role === "DOSEN" ? "Dosen" : "Mahasiswa"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {u.studyProgram || "-"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-300">
                      {u.defaultPassword || "ucic1234"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                      u.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      {u.status === "ACTIVE" ? "AKTIF" : "NONAKTIF"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        title="Edit data pengguna"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setResetConfirmUser(u)}
                        title="Reset password ke default"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(u.id)}
                        title="Hapus pengguna"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>Tidak ada pengguna yang sesuai filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah / Edit User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                {editingUser ? <Edit2 className="w-5 h-5 text-blue-600" /> : <UserPlus className="w-5 h-5 text-rose-600" />}
                {editingUser ? "Perbarui Data Pengguna" : "Tambah Akun Pengguna Baru"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              {userActionError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{userActionError}</span>
                </div>
              )}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ahmad Fauzi / Dr. Saniman, M.Kom."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NIM / NIP
                  </label>
                  <input
                    type="text"
                    placeholder="2101001"
                    value={formNimNip}
                    onChange={(e) => setFormNimNip(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Peran (Role)
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="STUDENT">Mahasiswa</option>
                    <option value="DOSEN">Dosen Pengampu</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Institusi
                </label>
                <input
                  type="email"
                  placeholder="nama@cic.ac.id"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Program Studi
                  </label>
                  <input
                    type="text"
                    placeholder="Teknik Informatika"
                    value={formProdi}
                    onChange={(e) => setFormProdi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fakultas
                  </label>
                  <input
                    type="text"
                    placeholder="Fakultas Teknologi Informasi"
                    value={formFaculty}
                    onChange={(e) => setFormFaculty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Default Password Field */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-600" />
                  <label className="font-bold text-amber-800 dark:text-amber-300">
                    Password Default Akun
                  </label>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  {editingUser
                    ? "Ubah password default. Password aktif user tidak berubah kecuali admin melakukan reset."
                    : "Password ini digunakan untuk login pertama kali. User dapat mengubahnya setelah login."}
                </p>
                <div className="relative">
                  <input
                    type={showPasswordField ? "text" : "password"}
                    placeholder="Masukkan password default..."
                    value={formDefaultPassword}
                    onChange={(e) => setFormDefaultPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordField(!showPasswordField)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswordField ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow"
                >
                  {editingUser ? "Perbarui Data" : "Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Reset Password */}
      {resetConfirmUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
                <RotateCcw className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Reset Password?</h3>
                <p className="text-xs text-slate-500 mt-1.5">
                  Password <strong>{resetConfirmUser.name}</strong> akan direset ke password default:
                </p>
                <div className="mt-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                  <p className="font-mono font-bold text-amber-700 dark:text-amber-300 text-base">
                    {resetConfirmUser.defaultPassword || "ucic1234"}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  User harus login ulang menggunakan password default ini.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setResetConfirmUser(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleResetPassword}
                className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm shadow"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus User */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Hapus Pengguna?</h3>
                <p className="text-xs text-slate-500 mt-1.5">
                  Akun ini akan dihapus permanen dari sistem. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm"
              >
                Batal
              </button>
              <button
                onClick={() => { deleteUser(deleteConfirmId); setDeleteConfirmId(null); }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow"
              >
                Ya, Hapus!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
