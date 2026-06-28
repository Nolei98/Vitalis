import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, MealGroup } from '../../types';
import { getMeals } from '../../services/storageService';
import { computeProfileSummary, ACTIVITY_LABELS, GOAL_LABELS, hasPhysicalProfile } from '../../utils/nutrition';
import ProgressRing from '../ui/ProgressRing';
import PillButton from '../ui/PillButton';
import MealCard from '../ui/MealCard';
import CapsuleImage from '../ui/CapsuleImage';
import FloatingDecor from '../ui/FloatingDecor';
import BlobDivider from '../ui/BlobDivider';

interface ProfilePageProps {
  user: UserProfile;
  onEditProfile: () => void;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onEditProfile, onLogout }) => {
  const [meals, setMeals] = useState<MealGroup[]>([]);
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');

  const [filterDate, setFilterDate] = useState(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 10);
  });

  const [filterMonth, setFilterMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    setMeals(getMeals());
  }, []);

  const profileSummary = useMemo(() => computeProfileSummary(user), [user]);

  const filteredHistory = useMemo(() => {
    return meals.filter(m => {
      const d = new Date(m.timestamp);
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      return viewMode === 'daily' ? `${y}-${mo}-${da}` === filterDate : `${y}-${mo}` === filterMonth;
    });
  }, [meals, viewMode, filterDate, filterMonth]);

  const historyTotals = useMemo(() => {
    return filteredHistory.reduce(
      (acc, m) => ({
        kcal: acc.kcal + Number(m.totalCalories || 0),
        p: acc.p + Number(m.totalProtein || 0),
        c: acc.c + Number(m.totalCarbs || 0),
        f: acc.f + Number(m.totalFat || 0),
      }),
      { kcal: 0, p: 0, c: 0, f: 0 }
    );
  }, [filteredHistory]);

  const stats = useMemo(() => {
    if (!user?.targets) return { status: 'Aguardando metas', percent: 0 };
    let targetKcal = Number(user.targets.kcal);
    if (viewMode === 'monthly') {
      const days = new Set(filteredHistory.map(m => new Date(m.timestamp).toDateString())).size || 1;
      targetKcal *= days;
    }
    const diff = (historyTotals.kcal / (targetKcal || 1)) * 100;
    if (diff >= 90 && diff <= 100) return { status: 'Fluxo de elite 🏆', percent: diff };
    if (diff > 100 && diff <= 110) return { status: 'Meta alcançada ✨', percent: diff };
    if (diff > 110) return { status: 'Excesso detectado 🛑', percent: diff };
    return { status: 'Abastecendo... 🌱', percent: diff };
  }, [user, historyTotals, viewMode, filteredHistory]);

  const downloadCSV = (type: 'current' | 'all') => {
    const exportData = type === 'current' ? filteredHistory : meals;
    if (exportData.length === 0) {
      alert('Sem registros para exportar no momento.');
      return;
    }
    const headers = ['ID', 'DATA', 'HORA', 'REFEICAO', 'PROTEINA_G', 'CARBOIDRATO_G', 'GORDURA_G', 'KCALS', 'ITENS'];
    const rows = exportData.map(m => {
      const d = new Date(m.timestamp);
      const itemsStr = m.items.map(i => `${i.foodName}(${i.amountGrams}g)`).join(' | ');
      return [
        m.id,
        d.toLocaleDateString('pt-BR'),
        d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        m.name.replace(/,/g, ''),
        m.totalProtein,
        m.totalCarbs,
        m.totalFat,
        m.totalCalories,
        `"${itemsStr}"`,
      ].join(',');
    });
    const csvContent = '﻿' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = type === 'current'
      ? `Vitalis_Relatorio_${filterDate || filterMonth}.csv`
      : `Vitalis_Relatorio_Geral_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const initials = (user.name || 'TM').split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase();

  return (
    <div className="animate-fadeIn">
      {/* HEADER */}
      <header className="relative -mx-4 sm:-mx-6 bg-signature text-white pt-12 pb-2 px-6 overflow-hidden rounded-b-[44px]">
        <FloatingDecor variant="dark" />
        <div className="relative z-10 pb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="capsule w-16 h-16 rounded-full flex items-center justify-center text-xl font-extrabold text-green-900">{initials}</div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">{user.name}</h1>
                <p className="text-[11px] font-medium text-lime-300/80">{user.email}</p>
              </div>
            </div>
            <button onClick={onLogout} className="px-5 py-2.5 rounded-pill bg-white/15 backdrop-blur text-white text-[10px] font-extrabold uppercase tracking-wider hover:bg-white/25 transition press" style={{ borderRadius: 999 }}>Sair</button>
          </div>

          {/* TMB / GET */}
          <div className="mt-7 bg-white/10 backdrop-blur rounded-[26px] p-5 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-extrabold">Perfil físico</h3>
              {hasPhysicalProfile(user) ? (
                <p className="text-[10px] font-semibold text-white/60 mt-1 leading-relaxed">
                  {user.sex === 'male' ? 'Masculino' : 'Feminino'} · {user.age}a · {user.heightCm}cm · {user.weightKg}kg<br />
                  {GOAL_LABELS[user.goal!]}
                </p>
              ) : (
                <p className="text-[11px] font-medium text-lime-300 mt-1">Complete para metas automáticas.</p>
              )}
            </div>
            {profileSummary && (
              <div className="flex gap-5 text-center">
                <div>
                  <p className="text-2xl font-extrabold italic text-lime-300 leading-none">{profileSummary.bmr}</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-white/40 mt-1">TMB</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold italic leading-none">{profileSummary.tdee}</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-white/40 mt-1">GET</p>
                </div>
              </div>
            )}
            <button onClick={onEditProfile} aria-label="Editar perfil" className="w-11 h-11 rounded-full bg-accent-500 flex items-center justify-center text-white shadow-glow press flex-shrink-0">✎</button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0"><BlobDivider color="#F2F8F4" /></div>
      </header>

      <div className="pt-6 space-y-8">
        {/* RESUMO DO PERÍODO */}
        <section className="card-fresh p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex bg-surface-soft p-1.5 rounded-pill" style={{ borderRadius: 999 }}>
              {(['daily', 'monthly'] as const).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} className={`px-6 py-2.5 rounded-pill text-[10px] font-extrabold uppercase tracking-wider transition press ${viewMode === mode ? 'bg-green-700 text-white shadow-soft' : 'text-ink-soft'}`} style={{ borderRadius: 999 }}>
                  {mode === 'daily' ? 'Diário' : 'Mensal'}
                </button>
              ))}
            </div>
            {viewMode === 'daily' ? (
              <input type="date" className="bg-surface-soft rounded-[18px] px-4 py-2.5 text-[11px] font-bold text-ink-strong outline-none" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            ) : (
              <input type="month" className="bg-surface-soft rounded-[18px] px-4 py-2.5 text-[11px] font-bold text-ink-strong outline-none" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
            )}
          </div>

          <div className="flex items-center gap-6">
            <ProgressRing value={Math.min(100, stats.percent)} size={120} stroke={12}>
              <span className="text-2xl font-extrabold italic text-ink-strong leading-none">{Math.round(historyTotals.kcal)}</span>
              <span className="text-[8px] font-bold uppercase text-ink-soft mt-1">kcal</span>
            </ProgressRing>
            <div className="flex-1 space-y-3">
              <p className="text-sm font-extrabold italic text-green-700">{stats.status}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-surface-soft rounded-2xl py-3">
                  <p className="text-lg font-extrabold italic text-green-700 leading-none">{historyTotals.p.toFixed(0)}g</p>
                  <p className="text-[8px] font-bold uppercase text-ink-soft mt-1">Proteína</p>
                </div>
                <div className="bg-surface-soft rounded-2xl py-3">
                  <p className="text-lg font-extrabold italic text-green-500 leading-none">{historyTotals.c.toFixed(0)}g</p>
                  <p className="text-[8px] font-bold uppercase text-ink-soft mt-1">Carbo</p>
                </div>
                <div className="bg-surface-soft rounded-2xl py-3">
                  <p className="text-lg font-extrabold italic text-accent-500 leading-none">{historyTotals.f.toFixed(0)}g</p>
                  <p className="text-[8px] font-bold uppercase text-ink-soft mt-1">Gordura</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <PillButton variant="accent" onClick={() => downloadCSV('current')}>Exportar vista</PillButton>
            <PillButton variant="outline" onClick={() => downloadCSV('all')}>Baixar tudo</PillButton>
          </div>
        </section>

        {/* TIMELINE / HISTÓRICO */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-extrabold text-ink-strong italic">Histórico detalhado</h3>
            <span className="text-[10px] font-extrabold text-ink-soft/50 uppercase tracking-wider">{filteredHistory.length} registros</span>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="card-fresh p-10 flex flex-col items-center text-center gap-3">
              <CapsuleImage emoji="📭" size={64} />
              <p className="font-extrabold text-ink-strong">Sem registros no período</p>
              <p className="text-[12px] text-ink-soft font-medium">Escolha outra data ou registre refeições na aba Hoje.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredHistory.map(meal => (
                <div key={meal.id} className="relative">
                  <span className="absolute -top-2 left-5 z-10 px-3 py-1 rounded-pill bg-green-900 text-white text-[8px] font-extrabold uppercase tracking-wider" style={{ borderRadius: 999 }}>
                    {new Date(meal.timestamp).toLocaleDateString('pt-BR')} · {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <MealCard meal={meal} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
