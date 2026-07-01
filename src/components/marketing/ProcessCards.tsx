import React from 'react';
import { PlusCircle, TrendingUp, Sparkles } from 'lucide-react';

export default function ProcessCards() {
  const steps = [
    {
      step: '01',
      title: 'REGISTRE',
      subtitle: 'Entrada instantânea',
      desc: 'Adicione suas refeições, copos d\'água, transações financeiras e tarefas do dia em segundos. Menos burocracia, mais hábito.',
      icon: PlusCircle,
      tag: 'Rotina Simples',
      color: 'bg-gradient-to-br from-[#B7C48E] to-[#8A9A5B] text-[#F4F5F1] shadow-[0_8px_16px_rgba(138,154,91,0.35)]',
    },
    {
      step: '02',
      title: 'ACOMPANHE',
      subtitle: 'Gráficos e tendências',
      desc: 'Visualize o seu progresso semanal de calorias, consumo de água, tarefas cumpridas e saldo financeiro. Entenda suas oscilações.',
      icon: TrendingUp,
      tag: 'Insights Rápidos',
      color: 'bg-gradient-to-br from-[#5B8DEF] to-[#3A6BCF] text-[#F4F5F1] shadow-[0_8px_16px_rgba(58,107,207,0.35)]',
    },
    {
      step: '03',
      title: 'EVOLUA',
      subtitle: 'Metas consistentes',
      desc: 'Alcance seus objetivos de saúde e produtividade de forma contínua. Mantenha as barras de progresso cheias e construa sua melhor versão.',
      icon: Sparkles,
      tag: 'Vida Saudável',
      color: 'bg-gradient-to-br from-[#FFD700] via-[#FF8C00] to-[#FF6FB5] text-[#F4F5F1] shadow-[0_8px_16px_rgba(217,76,145,0.35)]',
    },
  ];

  return (
    <section id="como-funciona" className="py-24 px-6 md:px-12 bg-[#F4F5F1] relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute right-[-10%] top-[20%] w-96 h-96 bg-[#B7C48E]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-[-5%] bottom-[10%] w-96 h-96 bg-[#8A9A5B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-16 text-center md:text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8A9A5B] mb-2">Fluxo de evolução</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#14150F] uppercase">
            Equilíbrio em três passos
          </h2>
          <p className="text-base text-[#6B6F63] mt-3 max-w-xl">
            Uma abordagem integrada para consolidar seus hábitos saudáveis e financeiros sem perder o foco na produtividade diária.
          </p>
        </div>

        {/* Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="m-glass-card p-8 flex flex-col justify-between min-h-[380px] hover:translate-y-[-4px] transition-all duration-300 group"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex justify-between items-start">
                    <span className="text-5xl font-extrabold text-[#8A9A5B]/30 group-hover:text-[#8A9A5B]/50 transition-colors duration-300">
                      {item.step}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-[#B7C48E]/30 text-[#14150F] px-3 py-1 rounded-full">
                      {item.tag}
                    </span>
                  </div>

                  {/* Step Content */}
                  <div className="mt-8">
                    <h3 className="text-xl font-black text-[#14150F] uppercase tracking-wide">
                      {item.title}
                    </h3>
                    <p className="text-xs font-bold text-[#8A9A5B] uppercase tracking-wider mt-1">
                      {item.subtitle}
                    </p>
                    <p className="text-sm text-[#6B6F63] mt-4 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Step Icon */}
                <div className="mt-8 flex justify-end">
                  <div className={`w-12 h-12 rounded-2xl border border-white/20 flex items-center justify-center ${item.color} transition-all duration-300 group-hover:scale-110`}>
                    <Icon size={20} strokeWidth={2.2} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle botanical watermarks */}
      <LeafBranch className="absolute top-[5%] left-[-8%] w-80 h-80 text-[#8A9A5B] opacity-[0.05] pointer-events-none select-none z-0 rotate-[45deg]" />
      <LeafMonstera className="absolute bottom-[5%] right-[-8%] w-72 h-72 text-[#8A9A5B] opacity-[0.05] pointer-events-none select-none z-0 rotate-[-15deg]" />

    </section>
  );
}

// Decorative leaf helpers
function LeafMonstera({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="currentColor" className={className}>
      <path d="M100,20 C140,20 170,50 170,90 C170,120 150,150 100,180 C50,150 30,120 30,90 C30,50 60,20 100,20 M100,40 C95,55 85,70 70,80 C85,85 95,95 100,110 C105,95 115,85 130,80 C115,70 105,55 100,40 M60,60 C70,75 80,85 95,90 C80,95 70,105 60,120 C65,105 65,95 60,60 M140,60 C135,95 135,105 140,120 C130,105 120,95 105,90 C120,85 130,75 140,60 Z" />
    </svg>
  );
}

function LeafBranch({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="currentColor" className={className}>
      <path d="M100,180 C100,120 120,60 170,30 C130,50 110,80 100,110 C90,80 70,50 30,30 C80,60 100,120 100,180 Z" />
      <path d="M100,150 C115,135 135,125 155,120 C135,120 118,125 107,135 Z" />
      <path d="M100,150 C85,135 65,125 45,120 C65,120 82,125 93,135 Z" />
      <path d="M100,110 C115,95 135,85 155,80 C135,80 118,85 107,95 Z" />
      <path d="M100,110 C85,95 65,85 45,80 C65,80 82,85 93,95 Z" />
    </svg>
  );
}
