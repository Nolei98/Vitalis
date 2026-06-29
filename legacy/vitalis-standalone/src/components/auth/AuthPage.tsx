import React, { useState } from 'react';
import Logo from '../shared/Logo';
import { UserProfile } from '../../types';
import { login, register, loginAsGuest } from '../../services/authService';
import FloatingDecor from '../ui/FloatingDecor';

interface AuthPageProps {
  onSuccess: (user: UserProfile) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const participants = ['Bruna Monteiro', 'Fred Henrique', 'João Rodrigues', 'Lucas Gonçalves', 'Patrick Gutemberg'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = activeTab === 'register' ? await register({ name, email, password }) : await login(email, password);
      onSuccess(user);
    } catch (err: any) {
      setError(err?.message || 'Não foi possível continuar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    setIsLoading(true);
    const guest = loginAsGuest(name, email);
    setTimeout(() => onSuccess(guest), 400);
  };

  const input = 'w-full px-6 py-5 rounded-[24px] bg-surface-soft font-semibold text-ink-strong outline-none placeholder:text-ink-soft/50';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-[1100px] min-h-[680px] flex flex-col md:flex-row card-fresh overflow-hidden">

        {/* PAINEL ESQUERDO */}
        <div className="w-full md:w-[45%] bg-signature p-10 md:p-14 flex flex-col justify-between text-white relative overflow-hidden">
          <FloatingDecor variant="dark" />
          <div className="relative z-10 space-y-8">
            <Logo size="md" />
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-[0.95] tracking-tight">
                Nutrição <br /><span className="text-lime-300 italic">fresca.</span>
              </h1>
              <p className="text-white/70 text-base font-medium leading-relaxed max-w-xs">
                Performance, saúde e frescor no padrão Vitalis.
              </p>
            </div>

            <button
              onClick={handleGuestAccess}
              disabled={isLoading}
              className="btn-pill press inline-flex items-center gap-3 px-8 py-5 bg-accent-500 text-white font-extrabold text-[12px] uppercase tracking-[0.15em] shadow-glow disabled:opacity-60"
              style={{ borderRadius: 999 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Acesso free
            </button>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 mt-8">
            <p className="text-[9px] font-extrabold text-lime-300/60 uppercase tracking-[0.3em] mb-3">Equipe do projeto</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {participants.map((p, i) => (
                <span key={i} className="text-[12px] font-semibold text-white/50 italic">{p}</span>
              ))}
            </div>
          </div>
        </div>

        {/* FORMULÁRIO */}
        <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto space-y-8">
            <div className="flex bg-surface-soft p-1.5 rounded-pill" style={{ borderRadius: 999 }}>
              {(['login', 'register'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setError(''); }}
                  className={`flex-1 py-4 text-[11px] font-extrabold uppercase tracking-widest rounded-pill transition press ${activeTab === tab ? 'bg-green-700 text-white shadow-soft' : 'text-ink-soft'}`}
                  style={{ borderRadius: 999 }}
                >
                  {tab === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {activeTab === 'register' && (
                <div>
                  <label className="text-[10px] font-extrabold text-ink-soft uppercase tracking-widest ml-3">Nome completo</label>
                  <input type="text" placeholder="Seu nome" className={`${input} mt-1.5`} value={name} onChange={e => setName(e.target.value)} />
                </div>
              )}
              <div>
                <label className="text-[10px] font-extrabold text-ink-soft uppercase tracking-widest ml-3">E-mail</label>
                <input type="email" required placeholder="exemplo@vitalis.app" className={`${input} mt-1.5`} value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-ink-soft uppercase tracking-widest ml-3">Senha</label>
                <input type="password" required placeholder="••••••••" className={`${input} mt-1.5`} value={password} onChange={e => setPassword(e.target.value)} />
              </div>

              {error && <p className="text-[12px] font-bold text-red-500 bg-red-50 rounded-2xl px-5 py-3 text-center">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-pill press w-full py-5 bg-green-700 text-white font-extrabold text-[12px] uppercase tracking-[0.2em] shadow-soft hover:bg-green-900 disabled:opacity-60"
                style={{ borderRadius: 999 }}
              >
                {isLoading ? 'Processando...' : activeTab === 'login' ? 'Iniciar fluxo' : 'Criar identidade'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
