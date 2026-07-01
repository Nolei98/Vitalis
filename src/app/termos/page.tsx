import React from 'react';
import Link from 'next/link';
import PageFrame from '@/components/PageFrame';

export const metadata = { title: 'Termos de Uso — Vitalis' };

export default function TermosPage() {
  const updated = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());

  const sections = [
    {
      title: '1. Aceitação dos Termos',
      body: `Ao utilizar o Vitalis (doravante "Plataforma"), desenvolvido por Eu da parte visual, você concorda integralmente com estes Termos de Uso e com a Política de Privacidade descrita abaixo. Caso não concorde com qualquer disposição aqui contida, pedimos que interrompa imediatamente o uso da Plataforma.`,
    },
    {
      title: '2. Descrição do Serviço',
      body: `O Vitalis é um sistema pessoal de bem-estar que reúne funcionalidades de agenda, tarefas, dieta e nutrição, hidratação, estudos, finanças, metas, alarmes, relatórios e social em uma única plataforma. O serviço é fornecido no estado em que se encontra ("as is"), podendo ser atualizado, modificado ou descontinuado a qualquer momento, é de uso pessoal e não substitui acompanhamento médico, nutricional ou financeiro profissional.`,
    },
    {
      title: '3. Dados Coletados e Finalidade',
      body: `Para funcionar, a Plataforma coleta e armazena os dados que você mesmo insere: informações de perfil (nome, e-mail, foto), dados de saúde e nutrição (peso, altura, refeições, hidratação, metas de dieta), dados financeiros (contas, transações, orçamentos), agenda e tarefas, e conteúdo social (mensagens, posts, conexões de amizade).\n\nEsses dados são usados exclusivamente para operar as funcionalidades da própria Plataforma em seu benefício (cálculo de metas, geração de relatórios, planos de dieta, lembretes, etc.). Não usamos seus dados para publicidade, não os vendemos e não os compartilhamos com parceiros comerciais.`,
    },
    {
      title: '4. Base Legal e Dados Sensíveis (LGPD)',
      body: `O tratamento de dados segue a Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD). A base legal é a execução do próprio serviço solicitado por você (art. 7º, V) e, quando aplicável, seu consentimento explícito (art. 7º, I).\n\nDados de saúde (peso, hidratação, refeições, metas nutricionais) são considerados dados sensíveis pela LGPD (art. 11) e são tratados com o mesmo cuidado: usados apenas para as funcionalidades que você ativa (ex.: calcular kcal/macros, gerar plano de dieta), nunca para fins diferentes do que foi solicitado.`,
    },
    {
      title: '5. Inteligência Artificial (Gemini)',
      body: `Algumas funcionalidades (estimativa de macros por descrição, geração de plano de dieta) usam a API do Google Gemini para processar o texto/dados que você fornece e gerar sugestões. Essas sugestões são educativas, não constituem prescrição médica ou nutricional, e não devem substituir orientação de um profissional de saúde — a Plataforma inclui avisos nesse sentido nas telas relevantes. Os dados enviados ao Gemini são apenas os necessários para gerar a resposta (metas calculadas, preferências alimentares) e não incluem identificadores pessoais como nome ou e-mail.`,
    },
    {
      title: '6. Compartilhamento de Dados e Integrações',
      body: `Não compartilhamos, vendemos ou cedemos seus dados a terceiros para fins comerciais. Alguns dados só saem da Plataforma quando você mesmo configura uma integração opcional (ex.: sincronizar agenda do Google/Canvas, backup no Google Sheets, notificações no Discord, tarefas no ClickUp) — nesses casos, os dados trafegam diretamente para o serviço que você escolheu conectar, sob os termos daquele serviço. Você pode desconectar qualquer integração a qualquer momento na tela de Conexões.\n\nTokens de acesso a integrações são armazenados de forma criptografada (AES-256-GCM) e nunca ficam expostos ao navegador.`,
    },
    {
      title: '7. Seus Direitos (LGPD, art. 18)',
      body: `Você pode, a qualquer momento e mediante solicitação: confirmar a existência de tratamento de dados; acessar seus dados; corrigir dados incompletos, inexatos ou desatualizados; solicitar anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei; solicitar a portabilidade dos seus dados a outro fornecedor; solicitar a eliminação dos dados tratados com base no seu consentimento; obter informação sobre entidades com as quais compartilhamos dados; e revogar seu consentimento.\n\nMuitas dessas ações já estão disponíveis diretamente na Plataforma (editar perfil, remover registros, desconectar integrações, apagar a conta). Para o que não estiver disponível na tela, entre em contato pelo canal informado na seção 11.`,
    },
    {
      title: '8. Retenção e Exclusão de Dados',
      body: `Seus dados ficam armazenados enquanto sua conta existir. Ao excluir a conta, os dados pessoais associados são removidos do banco de dados principal. Se você configurou backup no Google Sheets, o backup fica na sua própria planilha do Google, fora do nosso controle — a exclusão da conta na Plataforma não apaga automaticamente esse backup, que você pode remover diretamente no Google Drive.`,
    },
    {
      title: '9. Segurança dos Dados',
      body: `Empregamos medidas técnicas razoáveis para proteger seus dados: senhas armazenadas de forma criptografada, tokens de integrações protegidos com criptografia AES-256-GCM, e conexão do banco de dados via canal seguro. Nenhum sistema é 100% imune a falhas — recomendamos usar uma senha forte e exclusiva para sua conta.`,
    },
    {
      title: '10. Responsabilidades do Usuário',
      body: `Você é responsável pela veracidade das informações inseridas na Plataforma, pela segurança de suas credenciais de acesso e pelo uso adequado de todas as funcionalidades. É vedado o uso da Plataforma para fins ilícitos, fraudulentos ou que violem direitos de terceiros.`,
    },
    {
      title: '11. Propriedade Intelectual',
      body: `Todo o conteúdo da Plataforma — incluindo código-fonte, design, marca, logotipo e textos — é propriedade de Eu da parte visual, protegido pelas leis de direitos autorais e propriedade intelectual aplicáveis. É proibida a reprodução, distribuição ou modificação sem autorização prévia por escrito.`,
    },
    {
      title: '12. Limitação de Responsabilidade',
      body: `A Plataforma não se responsabiliza por danos diretos, indiretos, incidentais ou consequentes decorrentes do uso ou impossibilidade de uso, perda de dados, interrupção de serviço, ou decisões de saúde/financeiras tomadas com base em sugestões geradas pela Plataforma (incluindo planos de dieta e recomendações por IA), que são sempre educativas e não substituem acompanhamento profissional.`,
    },
    {
      title: '13. Alterações nos Termos',
      body: `Estes Termos podem ser modificados a qualquer momento. Alterações significativas serão comunicadas por meio da Plataforma. O uso continuado após a publicação das alterações implica aceitação dos novos Termos.`,
    },
    {
      title: '14. Lei Aplicável e Foro',
      body: `Estes Termos são regidos pelas leis da República Federativa do Brasil, incluindo a Lei Geral de Proteção de Dados (Lei 13.709/2018).`,
    },
    {
      title: '15. Contato',
      body: `Em caso de dúvidas sobre estes Termos ou para exercer seus direitos sobre seus dados (acesso, correção, exclusão, portabilidade), entre em contato através do portfólio: https://portfolio-jr-lilac.vercel.app/?lang=pt`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F1] text-[#14150F] py-12 px-4 md:px-8 relative overflow-hidden flex flex-col items-center">
      {/* Background Glows */}
      <div className="absolute left-[-10%] top-[-10%] w-96 h-96 bg-[#8A9A5B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[-10%] w-96 h-96 bg-[#B7C48E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl flex flex-col gap-6 relative z-10">
        
        {/* Header Block */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-6 mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 border border-black/10 hover:border-black/25 bg-white/40 hover:bg-white/60 active:scale-95 text-[#14150F] text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5"
            >
              ← Voltar
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[#14150F]">
                Termos & Privacidade
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6F63]">
                Última atualização: {updated}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-[9px] uppercase font-bold tracking-widest bg-[#B7C48E]/30 text-[#14150F] px-2.5 py-1 rounded-full">
              LGPD Compliance
            </span>
          </div>
        </header>

        {/* Content list of glass cards */}
        <main className="space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="clay-card p-6 md:p-8 border border-white/60 bg-white/40 shadow-xl">
              <h2 className="text-base font-black uppercase tracking-wide mb-3 text-[#14150F] border-b border-black/5 pb-2">
                {s.title}
              </h2>
              {s.body.split('\n\n').map((p, i) => (
                <p key={i} className="text-xs md:text-sm leading-relaxed mb-3 last:mb-0 text-[#6B6F63] font-semibold">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </main>

        {/* Footer info card */}
        <footer className="clay-card p-6 text-center border border-white/60 bg-white/45 shadow-md mt-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#6B6F63]">
            © {new Date().getFullYear()} <span className="text-[#8A9A5B]">Vitalis</span> — desenvolvido por{' '}
            <a
              href="https://portfolio-jr-lilac.vercel.app/?lang=pt"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#14150F]"
            >
              João Rodrigues
            </a>
          </p>
        </footer>

      </div>
    </div>
  );
}
