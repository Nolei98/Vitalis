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
      title: 'Controle de Estudos',
      desc: 'Monitore seu foco diário acumulando minutos de leitura, estudo ou trabalho concentrado.',
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
    </section>
  );
}
