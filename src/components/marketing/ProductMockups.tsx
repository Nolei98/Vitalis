'use client';

import React from 'react';
import { 
  Apple, Droplet, DollarSign, Calendar, CheckSquare, Sun, MessageCircle, Bell, Plug, BookOpen, Target, LayoutDashboard, CalendarDays, AlarmClock, BarChart2, ShieldCheck, Settings
} from 'lucide-react';

export default function ProductMockups() {
  return (
    <section id="mockups" className="py-24 px-6 md:px-12 bg-[#F4F5F1] relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute left-[-10%] top-[30%] w-[450px] h-[450px] bg-[#8A9A5B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[10%] w-[500px] h-[500px] bg-[#B7C48E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8A9A5B] mb-2">Visual do Produto</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#14150F] uppercase">
            A Interface em Ação
          </h2>
          <p className="text-sm md:text-base text-[#6B6F63] mt-3 font-semibold">
            Protótipos de alta fidelidade mostrando a versão exata do painel de controle e o fluxo mobile com o tema de vidro e acentos de oliva.
          </p>
        </div>

        {/* Mockups Container */}
        <div className="relative flex flex-col xl:flex-row items-center justify-center gap-12 xl:gap-6 mt-8">
          
          {/* 1. Desktop Laptop Mockup */}
          <div className="w-full max-w-[850px] bg-[#14150F] rounded-[32px] p-3 shadow-[0_50px_100px_-20px_rgba(20,21,15,0.3)] border border-white/10 relative hover:scale-[1.01] transition-transform duration-500 animate-[float_8s_ease-in-out_infinite]">
            
            {/* Screen Inner Container */}
            <div className="w-full h-full bg-[#F4F5F1] rounded-[22px] overflow-hidden flex flex-col p-4 relative text-[#14150F] select-none">
              
              {/* Top Bar OS Controls */}
              <div className="flex items-center justify-between border-b border-black/5 pb-2.5 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
                  <span className="text-[10px] font-black text-[#6B6F63] tracking-wider ml-2 uppercase">VITALIS WEB APP</span>
                </div>
                <div className="px-3 py-0.5 rounded-full bg-white/60 border border-black/5 text-[9px] font-bold text-[#6B6F63]">
                  https://app.vitalis.com/dashboard
                </div>
              </div>

              {/* Application Structure Layout */}
              <div className="flex gap-4 items-stretch h-[440px] overflow-hidden">
                
                {/* Real-style Sidebar */}
                <div className="w-40 bg-gradient-to-b from-[#5D6A3C] to-[#8A9A5B] rounded-2xl p-3 flex flex-col justify-between shadow-md text-white">
                  <div>
                    {/* Sidebar Logo */}
                    <div className="flex items-center gap-2 mb-6 px-1">
                      <img src="/images/vitalis-logo.png" alt="Vitalis Logo" className="w-7 h-7 object-contain" />
                      <span className="font-extrabold text-xs tracking-wider uppercase">Vitalis</span>
                    </div>
                    {/* Sidebar Navigation Links */}
                    <div className="flex flex-col gap-1.5 text-[10px] font-bold text-white/70">
                      <div className="flex items-center gap-2 text-white bg-white/15 px-2 py-1.5 rounded-xl shadow-sm">
                        <LayoutDashboard size={12} />
                        <span>Painel</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-xl"><CalendarDays size={12} /><span>Agenda</span></div>
                      <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-xl"><CheckSquare size={12} /><span>Tarefas</span></div>
                      <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-xl"><Target size={12} /><span>Metas</span></div>
                      <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-xl"><AlarmClock size={12} /><span>Alarmes</span></div>
                      <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-xl"><BarChart2 size={12} /><span>Insights</span></div>
                      <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-xl"><MessageCircle size={12} /><span>Social</span></div>
                    </div>
                  </div>

                  {/* Sidebar Bottom */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-white/10 text-[9px] font-bold text-white/60">
                    <div className="flex items-center gap-2 px-2 py-1"><Settings size={11} /><span>Config</span></div>
                    <div className="flex items-center gap-2 px-2 py-1"><span>Olá, eu! 🌿</span></div>
                  </div>
                </div>

                {/* Main Content Dashboard Area */}
                <div className="flex-1 flex flex-col gap-3 overflow-hidden text-[9px]">
                  
                  {/* Header Dashboard */}
                  <header className="flex justify-between items-center bg-white/40 backdrop-blur-md p-2.5 px-3 rounded-2xl border border-white/60 shadow-sm flex-shrink-0">
                    <div>
                      <h3 className="font-black text-xs text-[#14150F] uppercase tracking-tight">Vitalis <span className="text-[#8A9A5B]">Hub</span></h3>
                      <p className="text-[8px] text-[#6B6F63] font-bold">Seu painel de vida</p>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#B020C8] to-[#D946EF] text-white shadow-sm hover:scale-105 transition-transform"><MessageCircle size={12} /></div>
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#D94060] to-[#FB7185] text-white shadow-sm hover:scale-105 transition-transform relative">
                        <Bell size={12} />
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border border-white text-[7px] font-black text-white flex items-center justify-center">2</span>
                      </div>
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#475569] to-[#64748B] text-white shadow-sm hover:scale-105 transition-transform"><Plug size={12} /></div>
                    </div>
                  </header>

                  {/* Row 2: Hero Kcal & Stats */}
                  <div className="flex gap-3 flex-shrink-0">
                    
                    {/* Welcome / Kcal Chart card */}
                    <div className="w-[45%] bg-gradient-to-br from-[#8A9A5B] to-[#76844e] p-3 text-white rounded-2xl shadow-md flex flex-col justify-between h-28 relative overflow-hidden">
                      <div className="flex justify-between items-start z-10">
                        <div>
                          <p className="text-[8px] opacity-80">Bom dia,</p>
                          <h4 className="font-black text-xs flex items-center gap-1">eu <Sun size={12} className="text-yellow-200" /></h4>
                          <p className="text-[8px] opacity-90 truncate mt-0.5">11:00 — Reunião Semanal</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[7px] uppercase opacity-75 font-black">Kcal semana</p>
                          <p className="font-black text-sm">12.450</p>
                        </div>
                      </div>
                      
                      {/* Micro vector chart */}
                      <div className="h-10 mt-1 z-10">
                        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <path d="M0,25 Q15,10 30,18 T60,5 T90,12 T100,8" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
                          <path d="M0,25 Q15,10 30,18 T60,5 T90,12 T100,8 L100,30 L0,30 Z" fill="rgba(255,255,255,0.15)" />
                        </svg>
                      </div>
                      <div className="absolute right-[-10%] top-[-20%] w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    </div>

                    {/* Stats Grid (5 Cards) */}
                    <div className="flex-1 grid grid-cols-5 gap-2">
                      
                      {/* Card Saldo */}
                      <div className="bg-white/40 border border-white/60 p-2 rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
                        <span className="w-6 h-6 rounded-lg bg-[#8B5CF6]/15 text-[#6A3DD6] flex items-center justify-center"><DollarSign size={11} /></span>
                        <div>
                          <p className="text-[7px] text-[#6B6F63] font-bold">Saldo</p>
                          <p className="font-black text-[9px] truncate">R$ 5.420</p>
                        </div>
                        <svg className="w-full h-4" viewBox="0 0 40 10"><path d="M0,8 L8,6 L16,9 L24,5 L32,7 L40,3" fill="none" stroke="#8B5CF6" strokeWidth="1" /></svg>
                      </div>

                      {/* Card Agenda */}
                      <div className="bg-white/40 border border-white/60 p-2 rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
                        <span className="w-6 h-6 rounded-lg bg-[#5B8DEF]/15 text-[#3A6BCF] flex items-center justify-center"><Calendar size={11} /></span>
                        <div>
                          <p className="text-[7px] text-[#6B6F63] font-bold">Eventos</p>
                          <p className="font-black text-xs">3 hoje</p>
                        </div>
                        <svg className="w-full h-4" viewBox="0 0 40 10"><path d="M0,9 L10,5 L20,9 L30,4 L40,7" fill="none" stroke="#5B8DEF" strokeWidth="1" /></svg>
                      </div>

                      {/* Card Tarefas */}
                      <div className="bg-white/40 border border-white/60 p-2 rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
                        <span className="w-6 h-6 rounded-lg bg-[#2BC48A]/15 text-[#1A9E6E] flex items-center justify-center"><CheckSquare size={11} /></span>
                        <div>
                          <p className="text-[7px] text-[#6B6F63] font-bold">Pendentes</p>
                          <p className="font-black text-xs">5</p>
                        </div>
                        <svg className="w-full h-4" viewBox="0 0 40 10"><path d="M0,3 L10,7 L20,4 L30,8 L40,2" fill="none" stroke="#2BC48A" strokeWidth="1" /></svg>
                      </div>

                      {/* Card Agua */}
                      <div className="bg-white/40 border border-white/60 p-2 rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
                        <span className="w-6 h-6 rounded-lg bg-[#36C5F0]/15 text-[#1AA3CC] flex items-center justify-center"><Droplet size={11} /></span>
                        <div>
                          <p className="text-[7px] text-[#6B6F63] font-bold">Água</p>
                          <p className="font-black text-[9px] truncate">1500ml</p>
                        </div>
                        <svg className="w-full h-4" viewBox="0 0 40 10"><path d="M0,9 L8,8 L16,6 L24,4 L32,3 L40,2" fill="none" stroke="#36C5F0" strokeWidth="1" /></svg>
                      </div>

                      {/* Card Dieta */}
                      <div className="bg-white/40 border border-white/60 p-2 rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
                        <span className="w-6 h-6 rounded-lg bg-[#FF8A5B]/15 text-[#D96030] flex items-center justify-center"><Apple size={11} /></span>
                        <div>
                          <p className="text-[7px] text-[#6B6F63] font-bold">Refeições</p>
                          <p className="font-black text-[8px] text-[#FF8A5B] font-bold">1850 kcal</p>
                        </div>
                        <svg className="w-full h-4" viewBox="0 0 40 10"><path d="M0,5 L10,8 L20,3 L30,6 L40,4" fill="none" stroke="#FF8A5B" strokeWidth="1" /></svg>
                      </div>

                    </div>

                  </div>

                  {/* Row 3: Bottom Widgets (Agenda, Hidratação, Foco) */}
                  <div className="flex-1 grid grid-cols-3 gap-3 overflow-hidden">
                    
                    {/* Widget 1: Agenda */}
                    <div className="bg-white/40 border border-white/60 p-3 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                      <div className="flex justify-between items-center mb-2 border-b border-black/5 pb-1 flex-shrink-0">
                        <span className="font-black uppercase tracking-wider text-[#14150F]">Agenda de Hoje</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-[#5B8DEF]/10 text-[#3A6BCF] font-bold text-[7px]">Ver mais</span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
                        <div className="bg-[#5B8DEF]/10 text-[#3A6BCF] p-1.5 rounded-lg flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#3A6BCF] rounded-full" />
                          <span className="font-bold w-6 text-[7px] opacity-75">11:00</span>
                          <span className="font-extrabold truncate">Reunião de Alinhamento</span>
                        </div>
                        <div className="bg-[#5B8DEF]/5 text-[#3A6BCF] p-1.5 rounded-lg flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#3A6BCF] opacity-50 rounded-full" />
                          <span className="font-bold w-6 text-[7px] opacity-75">14:30</span>
                          <span className="font-extrabold truncate">Treino Funcional</span>
                        </div>
                        <div className="bg-[#5B8DEF]/5 text-[#3A6BCF] p-1.5 rounded-lg flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#3A6BCF] opacity-50 rounded-full" />
                          <span className="font-bold w-6 text-[7px] opacity-75">18:00</span>
                          <span className="font-extrabold truncate">Estudo: Next.js</span>
                        </div>
                      </div>
                    </div>

                    {/* Widget 2: Hidratação */}
                    <div className="bg-white/40 border border-white/60 p-3 rounded-2xl shadow-sm flex flex-col items-center justify-between text-center">
                      <div className="flex justify-between items-center w-full mb-1 border-b border-black/5 pb-1 flex-shrink-0">
                        <span className="font-black uppercase tracking-wider text-[#14150F]">Hidratação</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-[#36C5F0]/10 text-[#1AA3CC] font-bold text-[7px]">75%</span>
                      </div>
                      {/* Donut progress ring */}
                      <div className="relative w-16 h-16 rounded-full border-[6px] border-[#EAECE5] flex items-center justify-center my-1.5">
                        <div className="absolute inset-0 rounded-full border-[6px] border-[#36C5F0] border-t-transparent border-l-transparent" style={{ transform: 'rotate(45deg)' }} />
                        <div className="flex flex-col">
                          <span className="font-black text-[10px]">1500ml</span>
                          <span className="text-[6px] text-[#6B6F63] font-bold">Meta 2L</span>
                        </div>
                      </div>
                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-1 w-full mt-1.5">
                        <div className="bg-[#36C5F0] text-white p-1 rounded-lg font-extrabold text-[7px] hover:scale-95 transition-transform cursor-pointer">+250ml</div>
                        <div className="bg-[#36C5F0] text-white p-1 rounded-lg font-extrabold text-[7px] hover:scale-95 transition-transform cursor-pointer">+500ml</div>
                      </div>
                    </div>

                    {/* Widget 3: Foco & Metas */}
                    <div className="bg-white/40 border border-white/60 p-3 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                      <div className="flex justify-between items-center mb-1.5 border-b border-black/5 pb-1 flex-shrink-0">
                        <span className="font-black uppercase tracking-wider text-[#14150F]">Foco do Dia</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-[#2BC48A]/10 text-[#1A9E6E] font-bold text-[7px]">Ver tudo</span>
                      </div>
                      {/* Study minutes */}
                      <div className="flex items-center gap-1.5 mb-1.5 px-2 py-0.5 bg-[#6366F1]/10 text-[#4338CA] rounded-lg w-fit">
                        <BookOpen size={9} />
                        <span className="font-black text-[7px]">Estudo hoje: 45min</span>
                      </div>
                      {/* Tasks Checkbox */}
                      <div className="flex-1 overflow-y-auto space-y-1.5">
                        <div className="flex items-center gap-1.5 bg-[#2BC48A]/5 p-1 rounded">
                          <span className="w-3 h-3 bg-white border border-black/10 rounded flex items-center justify-center text-emerald-600 font-extrabold text-[8px]">&#x2713;</span>
                          <span className="line-through text-[#6B6F63] truncate font-semibold">Beber 2L de água hoje</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/40 p-1 rounded">
                          <span className="w-3 h-3 bg-white border border-black/10 rounded" />
                          <span className="truncate font-semibold">Finalizar relatório de despesas</span>
                        </div>
                        {/* Goal Progress bar */}
                        <div className="mt-2.5 pt-1.5 border-t border-black/5 space-y-1">
                          <div className="flex justify-between text-[7px] text-[#6B6F63] font-bold">
                            <span className="truncate">Meta: Guardar R$ 1.000</span>
                            <span className="text-[#FF6FB5] font-black">65%</span>
                          </div>
                          <div className="w-full h-1 bg-[#EAECE5] rounded-full overflow-hidden">
                            <div className="h-full bg-[#FF6FB5] rounded-full" style={{ width: '65%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* 2. Mobile Phone Mockup */}
          <div className="w-56 aspect-[9/18] bg-[#14150F] rounded-[38px] p-2.5 shadow-[0_40px_80px_-15px_rgba(20,21,15,0.4)] border border-white/25 xl:absolute bottom-12 right-2 hover:scale-105 hover:-rotate-1 transition-all duration-500 animate-[float_6s_ease-in-out_2s_infinite]">
            
            {/* Screen Inner Phone Container */}
            <div className="w-full h-full bg-[#F4F5F1] rounded-[30px] overflow-hidden flex flex-col p-3.5 relative text-[#14150F] select-none">
              
              {/* Phone Notch */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-18 h-4 bg-[#14150F] rounded-full flex items-center justify-between px-3 z-30">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="w-5 h-1 bg-white/10 rounded-full" />
              </div>

              {/* Status Bar */}
              <div className="flex justify-between items-center pt-1.5 mb-2.5 px-1.5 text-[8px] font-bold text-[#6B6F63] z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <span className="w-3.5 h-2 border border-[#6B6F63] rounded flex items-center p-0.5"><span className="w-2 h-full bg-[#6B6F63] block rounded-sm" /></span>
                </div>
              </div>

              {/* Mobile Mobile Hub Screen Layout */}
              <div className="flex flex-col gap-2.5 flex-1 overflow-hidden text-[8px]">
                
                {/* Header Mockup */}
                <div className="flex justify-between items-center bg-white/40 border border-white/60 p-2 rounded-xl shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <img src="/images/vitalis-logo.png" alt="Vitalis Logo" className="w-5 h-5 object-contain" />
                    <span className="font-extrabold text-[9px] tracking-wide">Vitalis</span>
                  </div>
                  <div className="w-5 h-5 rounded-lg bg-[#FB7185]/20 flex items-center justify-center text-[#D94060]"><Bell size={10} /></div>
                </div>

                {/* Mobile Welcome Box */}
                <div className="bg-gradient-to-br from-[#8A9A5B] to-[#76844e] p-2.5 rounded-xl text-white shadow-sm flex flex-col justify-between h-16">
                  <div>
                    <p className="text-[6px] opacity-80">Bom dia,</p>
                    <h5 className="font-black text-[9px] flex items-center gap-1">eu <Sun size={9} className="text-yellow-100" /></h5>
                  </div>
                  <p className="text-[6px] opacity-90 truncate">Reunião de Alinhamento às 11:00</p>
                </div>

                {/* Mobile Hydration Ring */}
                <div className="bg-white/40 border border-white/60 p-2.5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center gap-1">
                  <span className="font-black text-[7px] uppercase tracking-wider text-[#8A9A5B]">Hidratação Diária</span>
                  <div className="relative w-16 h-16 rounded-full border-[5px] border-[#EAECE5] flex items-center justify-center mt-1">
                    <div className="absolute inset-0 rounded-full border-[5px] border-[#36C5F0] border-t-transparent border-l-transparent" style={{ transform: 'rotate(45deg)' }} />
                    <div className="flex flex-col items-center">
                      <span className="font-black text-[10px]">1500ml</span>
                      <span className="text-[5px] text-[#6B6F63] font-bold">Meta 2000ml</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Quick Add Log */}
                <div className="grid grid-cols-3 gap-1">
                  <div className="bg-[#36C5F0] text-white p-1 rounded-md text-center font-black text-[6px] cursor-pointer">+250ml</div>
                  <div className="bg-[#36C5F0] text-white p-1 rounded-md text-center font-black text-[6px] cursor-pointer">+500ml</div>
                  <div className="bg-[#36C5F0] text-white p-1 rounded-md text-center font-black text-[6px] cursor-pointer">+750ml</div>
                </div>

                {/* Mobile Tasks List */}
                <div className="bg-white/40 border border-white/60 p-2 rounded-xl flex-1 flex flex-col justify-between overflow-hidden">
                  <span className="font-black uppercase tracking-wider text-[#14150F] border-b border-black/5 pb-1 mb-1">Tarefas de Hoje</span>
                  <div className="flex flex-col gap-1 overflow-y-auto">
                    <div className="flex items-center gap-1 bg-[#2BC48A]/5 p-0.5 px-1 rounded"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> <span className="text-[6px] font-semibold text-emerald-800 line-through">Água 1500ml</span></div>
                    <div className="flex items-center gap-1 bg-white/50 p-0.5 px-1 rounded"><span className="w-1.5 h-1.5 bg-[#6B6F63] rounded-full" /> <span className="text-[6px] font-semibold text-[#14150F] truncate">Relatório Financeiro</span></div>
                    <div className="flex items-center gap-1 bg-white/50 p-0.5 px-1 rounded"><span className="w-1.5 h-1.5 bg-[#6B6F63] rounded-full" /> <span className="text-[6px] font-semibold text-[#14150F] truncate">30min Funcional</span></div>
                  </div>
                </div>

              </div>

            </div>
            
          </div>

        </div>
      </div>

      {/* Floating Mockup Animation Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }
      `}</style>
    </section>
  );
}
