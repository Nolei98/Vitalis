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
    </section>
  );
}
