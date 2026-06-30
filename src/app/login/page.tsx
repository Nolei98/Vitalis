'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginUser, type AuthState } from '@/app/actions/auth';

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginUser, {});

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="clay-panel p-8 text-white">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🧬</div>
          <h1 className="text-2xl font-extrabold">Vitalis</h1>
          <p className="text-purple-100 text-sm font-semibold">Entre na sua conta</p>
        </div>
        <form action={action} className="space-y-4">
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
            placeholder="Senha"
            className="w-full rounded-2xl px-4 py-3 text-gray-800 font-semibold outline-none"
          />
          {state.error && <p className="text-sm font-bold text-red-200">⚠️ {state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="clay-btn w-full bg-white text-[#9871F5] font-extrabold py-3 hover:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {pending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-center text-purple-100 text-sm font-semibold mt-5">
          Não tem conta?{' '}
          <Link href="/register" className="underline font-bold">
            Criar perfil
          </Link>
        </p>
      </div>
    </div>
  );
}
