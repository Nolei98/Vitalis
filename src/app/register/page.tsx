'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerUser, type AuthState } from '@/app/actions/auth';

export default function RegisterPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(registerUser, {});

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="clay-panel p-8 text-white">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🧬</div>
          <h1 className="text-2xl font-extrabold">Criar perfil</h1>
          <p className="text-purple-100 text-sm font-semibold">Novo usuário do LifeOS</p>
        </div>
        <form action={action} className="space-y-4">
          <input
            name="name"
            type="text"
            required
            placeholder="Nome"
            className="w-full rounded-2xl px-4 py-3 text-gray-800 font-semibold outline-none"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="E-mail"
            className="w-full rounded-2xl px-4 py-3 text-gray-800 font-semibold outline-none"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Senha (mín. 4)"
            className="w-full rounded-2xl px-4 py-3 text-gray-800 font-semibold outline-none"
          />
          {state.error && <p className="text-sm font-bold text-red-200">⚠️ {state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="clay-btn w-full bg-white text-[#9871F5] font-extrabold py-3 hover:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {pending ? 'Criando...' : 'Criar e entrar'}
          </button>
        </form>
        <p className="text-center text-purple-100 text-sm font-semibold mt-5">
          Já tem conta?{' '}
          <Link href="/login" className="underline font-bold">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
