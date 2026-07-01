'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginUser, type AuthState } from '@/app/actions/auth';

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginUser, {});

  return (
    <div className="min-h-full flex flex-col items-center justify-center gap-8 py-12 px-4">

      {/* Logo — fora do card */}
      <div className="flex flex-col items-center gap-2">
        <img
          src="https://i.imgur.com/5MU9NOg.png"
          alt="Vitalis"
          width={80}
          height={80}
          style={{ filter: 'drop-shadow(0 4px 16px rgba(100,90,72,0.28))' }}
        />
        <p className="text-[13px] font-semibold tracking-wide" style={{ color: 'var(--clay-text-soft)' }}>
          Seu sistema pessoal de bem-estar
        </p>
      </div>

      {/* Card clay */}
      <div className="clay-card w-full max-w-sm p-8 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--clay-text)' }}>
            Entrar na conta
          </h1>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--clay-text-mute)' }}>
            Bem-vindo de volta
          </p>
        </div>

        <form action={action} className="flex flex-col gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="E-mail"
            className="clay-input w-full"
            style={{ color: 'var(--clay-text)' }}
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Senha"
            className="clay-input w-full"
            style={{ color: 'var(--clay-text)' }}
          />
          {state.error && (
            <p className="text-sm font-bold rounded-xl px-3 py-2"
              style={{ background: '#FFE5E9', color: '#D94060' }}>
              ⚠️ {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="clay-btn w-full py-3 text-white font-extrabold text-sm mt-1 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, var(--sidebar-from, #6D49E8), var(--sidebar-to, #B794FF))' }}
          >
            {pending ? 'Entrando...' : 'Entrar →'}
          </button>
        </form>

        <p className="text-center text-sm font-semibold" style={{ color: 'var(--clay-text-mute)' }}>
          Não tem conta?{' '}
          <Link href="/register" className="font-bold" style={{ color: 'var(--sidebar-from, #7C5CFC)' }}>
            Criar perfil
          </Link>
        </p>
      </div>

      <p className="text-[11px] font-medium" style={{ color: 'var(--clay-text-mute)' }}>
        © {new Date().getFullYear()} Vitalis
      </p>
    </div>
  );
}
