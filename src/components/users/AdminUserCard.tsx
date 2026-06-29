'use client';

import { useState, useTransition } from 'react';
import { adminUpdateUser, adminDeleteUser } from '@/app/actions/admin';

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  passwordHash: string | null;
  lastBackupAt: Date | null;
  _count: { meals: number; foods: number; waterLogs: number };
}

function fmt(d: Date | null) {
  if (!d) return 'nunca';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
}

export default function AdminUserCard({ user, isSelf }: { user: UserData; isSelf: boolean }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name ?? '');
  const [email, setEmail] = useState(user.email ?? '');
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function save() {
    setError('');
    startTransition(async () => {
      try {
        await adminUpdateUser(user.id, {
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          role,
          newPassword: password.trim() || undefined,
        });
        setPassword('');
        setEditing(false);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Erro ao salvar');
      }
    });
  }

  function remove() {
    if (!confirm(`Deletar "${user.name || user.email}"? Isso é irreversível.`)) return;
    startTransition(async () => {
      try {
        await adminDeleteUser(user.id);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Erro ao deletar');
      }
    });
  }

  return (
    <div
      className={`clay-card p-4 transition-all ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
      style={{ borderLeft: `3px solid ${user.role === 'admin' ? 'var(--brand-500)' : 'var(--text-soft)'}` }}
    >
      {!editing ? (
        /* ── View mode ── */
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm" style={{ color: 'var(--text-strong)' }}>
                {user.name || '(sem nome)'}
              </span>
              {isSelf && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: 'var(--brand-500)' }}>você</span>
              )}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                user.role === 'admin'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {user.role === 'admin' ? '👑 admin' : '👤 user'}
              </span>
              {!user.passwordHash && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                  sem senha
                </span>
              )}
            </div>
            <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-soft)' }}>
              {user.email || '—'}
            </p>
            <p className="text-[10px] font-semibold mt-1" style={{ color: 'var(--text-soft)', opacity: 0.7 }}>
              🥗 {user._count.meals} refeições · 💧 {user._count.waterLogs} registros · ☁️ backup: {fmt(user.lastBackupAt)}
            </p>
          </div>

          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="clay-btn px-3 py-1.5 text-xs font-bold"
              style={{ background: 'var(--brand-100)', color: 'var(--brand-600)' }}
            >
              ✏️ Editar
            </button>
            {!isSelf && (
              <button
                onClick={remove}
                className="clay-btn px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ── Edit mode ── */
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-soft)' }}>
                NOME
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full clay-card px-3 py-1.5 text-sm outline-none"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-soft)' }}>
                E-MAIL
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full clay-card px-3 py-1.5 text-sm outline-none"
                placeholder="email@exemplo.com"
                type="email"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-soft)' }}>
                NOVA SENHA <span className="opacity-60">(deixe vazio para manter)</span>
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full clay-card px-3 py-1.5 text-sm outline-none"
                placeholder="••••••••"
                type="password"
              />
            </div>
            {!isSelf && (
              <div>
                <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-soft)' }}>
                  PAPEL
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full clay-card px-3 py-1.5 text-sm outline-none"
                >
                  <option value="user">👤 Usuário</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={save}
              className="clay-btn px-4 py-1.5 text-xs font-bold text-white"
              style={{ background: 'var(--brand-500)' }}
            >
              {isPending ? 'Salvando…' : '✓ Salvar'}
            </button>
            <button
              onClick={() => { setEditing(false); setError(''); setPassword(''); }}
              className="clay-btn px-4 py-1.5 text-xs font-bold"
              style={{ background: 'var(--brand-100)', color: 'var(--brand-600)' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
