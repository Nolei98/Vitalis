import React from 'react';
import { Apple, Droplet, DollarSign, Calendar, CheckSquare, Target, BookOpen, Bell } from 'lucide-react';

export default function FeatureGrid() {
  const features = [
    {
      title: 'Nutrição e Dieta',
      desc: 'Monitore calorias, macronutrientes (como proteínas) e controle o seu consumo calórico diário de forma simples.',
      icon: Apple,
      color: 'bg-gradient-to-br from-[#FFA07A] to-[#D96030] text-white border border-white/20 shadow-[0_8px_16px_rgba(217,96,48,0.35)]',
    },
    {
      title: 'Hidratação e Água',
      desc: 'Registre a ingestão diária de água e acompanhe seu progresso em direção à meta recomendada para sua saúde.',
      icon: Droplet,
      color: 'bg-gradient-to-br from-[#36C5F0] to-[#1AA3CC] text-white border border-white/20 shadow-[0_8px_16px_rgba(26,163,204,0.35)]',
    },
    {
      title: 'Finanças Pessoais',
      desc: 'Gerencie saldo de contas, configure orçamentos por categoria e receba alertas se exceder o limite mensal de gastos.',
      icon: DollarSign,
      color: 'bg-gradient-to-br from-[#A78BFA] to-[#6A3DD6] text-white border border-white/20 shadow-[0_8px_16px_rgba(106,61,214,0.35)]',
    },
    {
      title: 'Agenda Unificada',
      desc: 'Visualize eventos agendados, reuniões e rotinas diárias integradas ao seu painel geral de vida.',
      icon: Calendar,
      color: 'bg-gradient-to-br from-[#5B8DEF] to-[#3A6BCF] text-white border border-white/20 shadow-[0_8px_16px_rgba(58,107,207,0.35)]',
    },
    {
      title: 'Foco e Produtividade',
      desc: 'Mantenha um checklist das suas tarefas pendentes organizadas por prioridade para não esquecer de nada importante.',
      icon: CheckSquare,
      color: 'bg-gradient-to-br from-[#2BC48A] to-[#1A9E6E] text-white border border-white/20 shadow-[0_8px_16px_rgba(26,158,110,0.35)]',
    },
    {
      title: 'Metas e Hábitos',
      desc: 'Acompanhe objetivos de médio/longo prazo com barras de progresso dinâmicas associadas ao seu estilo de vida.',
      icon: Target,
      color: 'bg-gradient-to-br from-[#FF6FB5] to-[#D94C91] text-white border border-white/20 shadow-[0_8px_16px_rgba(217,76,145,0.35)]',
    },
    {
      title: 'Foco YPT',
      desc: 'Monitore seu foco diário acumulando minutos de estudo, trabalho, leitura ou qualquer atividade concentrada.',
      icon: BookOpen,
      color: 'bg-gradient-to-br from-[#818CF8] to-[#4338CA] text-white border border-white/20 shadow-[0_8px_16px_rgba(67,56,202,0.35)]',
    },
    {
      title: 'Notificações e Alertas',
      desc: 'Centralize todos os lembretes, metas batidas e prazos do dia em um só hub prático.',
      icon: Bell,
      color: 'bg-gradient-to-br from-[#FB7185] to-[#D94060] text-white border border-white/20 shadow-[0_8px_16px_rgba(217,64,96,0.35)]',
    },
  ];

  return (
    <section id="recursos" className="py-24 px-6 md:px-12 bg-[#EAECE5] relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8A9A5B] mb-2">Ecossistema Completo</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#14150F] uppercase">
            MÓDULOS INTEGRADOS
          </h2>
          <p className="text-base text-[#6B6F63] mt-3 font-semibold">
            Esqueça ter um app para cada área. O Vitalis conecta sua vida física, profissional e financeira em um só lugar.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="m-glass-card p-6 bg-white/40 border border-white/50 hover:bg-white/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Icon Block */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feat.color}`}>
                    <Icon size={18} strokeWidth={2.4} />
                  </div>

                  {/* Text Details */}
                  <h3 className="text-lg font-extrabold text-[#14150F] mt-4 uppercase tracking-wide">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[#6B6F63] mt-2 leading-relaxed font-semibold">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center text-[10px] font-black uppercase tracking-widest text-[#8A9A5B]">
                  Explorar módulo &rarr;
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle botanical watermarks */}
      <LeafMonstera className="absolute top-[30%] right-[-5%] w-80 h-80 text-[#8A9A5B] opacity-[0.04] pointer-events-none select-none z-0 rotate-[60deg]" />
      <LeafBranch className="absolute bottom-[10%] left-[-5%] w-72 h-72 text-[#8A9A5B] opacity-[0.04] pointer-events-none select-none z-0 rotate-[-45deg]" />

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
