'use client';

import React, { useActionState, useState } from 'react';
import Link from 'next/link';
import { loginUser, type AuthState } from '@/app/actions/auth';

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginUser, {});
  const [magicEmail, setMagicEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [sendingMagic, setSendingMagic] = useState(false);

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicEmail) return;
    setSendingMagic(true);
    // Mock Magic Link sending
    setTimeout(() => {
      setSendingMagic(false);
      setMagicSent(true);
    }, 1200);
  };

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

      {/* Logo — fuera del card */}
      <Link href="/" className="flex flex-col items-center gap-3 group relative z-10">
        <img src="/images/vitalis-logo.png" alt="Vitalis Logo" className="h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105" />
        <div className="text-center">
          <span className="font-extrabold text-xl tracking-wider text-[#14150F] uppercase">
            Vitalis
          </span>
          <p className="text-[11px] font-bold tracking-widest text-[#6B6F63] uppercase mt-0.5">
            Seu sistema pessoal de bem-estar
          </p>
        </div>
      </Link>

      {/* Glass Card */}
      <div className="m-glass-card w-full max-w-md p-8 md:p-10 flex flex-col gap-6 border border-white/60 bg-white/40 shadow-2xl relative z-10">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-[#14150F] uppercase">
            Entrar na conta
          </h1>
          <p className="text-xs font-semibold text-[#6B6F63] mt-1">
            Escolha seu método de entrada rápida
          </p>
        </div>

        {/* 1. Google OAuth Button */}
        <button
          type="button"
          onClick={() => {
            // Mocado - em produção chamaria signIn('google')
            alert('A integração OAuth com Google iniciará o fluxo de consentimento.');
          }}
          className="w-full py-3 px-4 rounded-full border border-black/10 bg-white hover:bg-[#F4F5F1] active:scale-[0.98] text-[#14150F] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-200 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" width="16" height="16">
            <path
              fill="#EA4335"
              d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.93 1 12 1 7.37 1 3.4 3.66 1.45 7.55l3.77 2.92C6.12 7.55 8.84 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.44-1.09 2.66-2.31 3.48l3.6 2.79c2.1-1.94 3.76-4.79 3.76-8.37z"
            />
            <path
              fill="#FBBC05"
              d="M5.22 14.77c-.24-.72-.37-1.49-.37-2.27s.13-1.55.37-2.27L1.45 7.31C.52 9.16 0 11.23 0 13.5s.52 4.34 1.45 6.19l3.77-2.92z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.6-2.79c-1.1.74-2.51 1.18-4.36 1.18-3.16 0-5.88-2.51-6.78-5.43L1.45 15.97C3.4 19.86 7.37 23 12 23z"
            />
          </svg>
          Entrar com Google
        </button>

        {/* 2. Divider */}
        <div className="flex items-center gap-3 my-2 text-xs font-bold uppercase tracking-widest text-[#6B6F63]/60">
          <div className="flex-1 h-[1px] bg-black/10" />
          <span>ou</span>
          <div className="flex-1 h-[1px] bg-black/10" />
        </div>

        {/* 3. Magic Link (One-tap email) */}
        {!magicSent ? (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Seu e-mail para link mágico"
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-full border border-black/10 bg-white/50 text-[#14150F] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] focus:bg-white transition-all duration-200"
              />
              <button
                type="submit"
                disabled={sendingMagic}
                className="px-5 py-2.5 bg-[#8A9A5B] hover:bg-[#76844e] text-white font-bold text-xs uppercase tracking-wider rounded-full active:scale-95 disabled:opacity-50 transition-all duration-200"
              >
                {sendingMagic ? 'Enviando...' : 'Link Mágico'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3 bg-[#B7C48E]/20 border border-[#8A9A5B]/30 rounded-2xl text-center">
            <p className="text-xs font-bold text-[#14150F]">📧 Link enviado!</p>
            <p className="text-[10px] text-[#6B6F63] font-medium mt-1">Verifique seu e-mail para entrar com 1 clique.</p>
          </div>
        )}

        {/* 4. Divider */}
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#6B6F63]/60">
          <div className="flex-1 h-[1px] bg-black/10" />
          <span>E-mail e Senha</span>
          <div className="flex-1 h-[1px] bg-black/10" />
        </div>

        {/* 5. Traditional Fallback Form */}
        <form action={action} className="flex flex-col gap-3">
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
            placeholder="Senha"
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
            {pending ? 'Verificando...' : 'Entrar →'}
          </button>
        </form>

        {/* Alternative Actions */}
        <p className="text-center text-xs font-semibold text-[#6B6F63]">
          Não tem uma conta?{' '}
          <Link href="/register" className="font-bold text-[#8A9A5B] hover:underline">
            Criar perfil
          </Link>
        </p>
      </div>

      <p className="text-[10px] font-bold text-[#6B6F63] relative z-10">
        © {new Date().getFullYear()} Vitalis
      </p>
    </div>
  );
}
