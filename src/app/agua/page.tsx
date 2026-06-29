import React from 'react';
import { prisma } from '@/lib/prisma';
import WaterButtons from '@/components/WaterButtons';

export const dynamic = 'force-dynamic';

export default async function AguaPage() {
  const user = await prisma.user.findFirst({
    include: {
      waterLogs: {
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) return <div>Carregando...</div>;

  const totalWater = user.waterLogs.reduce((acc, log) => acc + log.amount, 0);
  const goal = 2000;
  const percent = Math.min(Math.round((totalWater / goal) * 100), 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-[#4a3f72]">Vitalis <span className="text-[#9871F5]">Hidro</span></h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Left Column: Progress and Quick Add */}
        <div className="clay-card p-8 h-fit flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold text-[#4a3f72] mb-8 w-full">Progresso Diário</h2>
          
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="110" fill="none" stroke="currentColor" strokeWidth="20" className="text-gray-100" />
            </svg>
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
              <circle 
                cx="50%" cy="50%" r="110" 
                fill="none" stroke="currentColor" 
                strokeWidth="20" 
                className="text-sky-400" 
                strokeDasharray="691" 
                strokeDashoffset={691 - (691 * percent) / 100} 
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div className="text-center">
              <span className="text-5xl font-extrabold text-[#4a3f72]">{percent}%</span>
              <p className="text-sm text-gray-500 font-bold mt-2">{totalWater} / {goal}ml</p>
            </div>
          </div>

          <div className="w-full mt-10">
            <h3 className="font-bold text-gray-500 text-sm mb-2 uppercase tracking-wider text-center">Registro Rápido</h3>
            <WaterButtons />
          </div>
        </div>

        {/* Right Column: History */}
        <div className="clay-panel !bg-[#e0d4fc] p-8 h-[700px] flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-[#4a3f72]">Histórico de Hoje</h2>
          
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 no-scrollbar">
            {user.waterLogs.map((log) => (
              <div key={log.id} className="clay-card p-4 flex justify-between items-center bg-white/60">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{log.amount >= 500 ? '🌊' : '💧'}</span>
                  <div>
                    <p className="font-extrabold text-[#4a3f72]">+{log.amount}ml</p>
                    <p className="text-xs font-bold text-gray-500">{log.createdAt.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {user.waterLogs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-purple-900/50">
                <span className="text-4xl mb-4">🌵</span>
                <p className="font-bold">Nenhum registro ainda.</p>
                <p className="text-sm">Beba água para começar!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
