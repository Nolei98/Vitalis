'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { registerUser, type AuthState } from '@/app/actions/auth';

export default function RegisterPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(registerUser, {});

  return (
    <div className="min-h-screen bg-[#F4F5F1] text-[#14150F] flex flex-col items-center justify-center gap-8 py-12 px-4 relative overflow-hidden">
      
      {/* Floating Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="px-4 py-2 border border-black/10 hover:border-black/25 bg-white/40 hover:bg-white/60 active:scale-95 text-[#14150F] text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          ← Voltar
        </Link>
      </div>

      {/* Background Glows */}
      <div className="absolute left-[-10%] top-[-10%] w-96 h-96 bg-[#8A9A5B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[-10%] w-96 h-96 bg-[#B7C48E]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Logo — fora do card */}
      <Link href="/" className="flex flex-col items-center gap-3 group relative z-10">
        <img src="/images/vitalis-logo.png" alt="Vitalis Logo" className="h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105" />
        <div className="text-center">
          <span className="font-extrabold text-xl tracking-wider text-[#14150F] uppercase">
            Vitalis
          </span>
          <p className="text-[11px] font-bold tracking-widest text-[#6B6F63] uppercase mt-0.5">
            Crie sua conta gratuita
          </p>
        </div>
      </Link>

      {/* Glass Card */}
      <div className="m-glass-card w-full max-w-md p-8 md:p-10 flex flex-col gap-6 border border-white/60 bg-white/40 shadow-2xl relative z-10">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-[#14150F] uppercase">
            Criar perfil
          </h1>
          <p className="text-xs font-semibold text-[#6B6F63] mt-1">
            Entre para o ecossistema de bem-estar
          </p>
        </div>

        <form action={action} className="flex flex-col gap-3">
          <input
            name="name"
            type="text"
            required
            placeholder="Seu nome completo"
            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 text-[#14150F] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] focus:bg-white transition-all"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Endereço de e-mail"
            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 text-[#14150F] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] focus:bg-white transition-all"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Senha (mínimo de 4 caracteres)"
            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 text-[#14150F] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] focus:bg-white transition-all"
          />
          
          {state.error && (
            <p className="text-xs font-bold rounded-xl px-3 py-2 border border-red-200 bg-red-50 text-red-600">
              ⚠️ {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-[#14150F] hover:bg-[#8A9A5B] active:scale-[0.98] disabled:opacity-60 text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition-all duration-300 mt-2 shadow-md"
          >
            {pending ? 'Criando perfil...' : 'Criar e entrar →'}
          </button>
        </form>

        {/* Alternative Actions */}
        <p className="text-center text-xs font-semibold text-[#6B6F63]">
          Já tem conta?{' '}
          <Link href="/login" className="font-bold text-[#8A9A5B] hover:underline">
            Entrar
          </Link>
        </p>
      </div>

      <p className="text-[10px] font-bold text-[#6B6F63] relative z-10">
        © {new Date().getFullYear()} Vitalis
      </p>
    </div>
  );
}
