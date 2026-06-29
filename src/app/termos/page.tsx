import Link from 'next/link';

export const metadata = { title: 'Termos de Uso — LifeOS' };

export default function TermosPage() {
  const updated = '29 de junho de 2026';

  return (
    <div className="space-y-6 page-enter pb-12 max-w-3xl mx-auto">
      <header className="pt-4 flex items-center gap-3">
        <Link href="/" className="clay-btn px-3 py-2 text-sm font-bold"
          style={{ background: 'var(--mod-dash-bg)', color: 'var(--mod-dash-strong)' }}>
          ← Início
        </Link>
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>Termos de Uso</h1>
          <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>Última atualização: {updated}</p>
        </div>
      </header>

      {[
        {
          title: '1. Aceitação dos Termos',
          body: `Ao utilizar o LifeOS (doravante "Plataforma"), desenvolvido e operado pela Nolei Creative, você concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição aqui contida, pedimos que interrompa imediatamente o uso da Plataforma.`,
        },
        {
          title: '2. Descrição do Serviço',
          body: `O LifeOS é um sistema operacional pessoal integrado que reúne funcionalidades de agenda, tarefas, dieta, hidratação, finanças, metas, alarmes, relatórios e social em uma única plataforma. O serviço é fornecido no estado em que se encontra ("as is"), podendo ser atualizado, modificado ou descontinuado a qualquer momento.`,
        },
        {
          title: '3. Coleta e Uso de Dados',
          body: `Ao usar a Plataforma, você autoriza expressamente a Nolei Creative a coletar, armazenar e processar os dados inseridos, incluindo mas não se limitando a: informações pessoais (nome, e-mail), dados de saúde (calorias, hidratação), dados financeiros, metas e histórico de atividades.\n\nEsses dados poderão ser utilizados pela Nolei Creative e suas empresas parceiras para fins empresariais, incluindo: análise de produto, melhoria de serviços, pesquisa e desenvolvimento, elaboração de relatórios internos, e ações de marketing e inteligência de negócios. Os dados serão tratados de forma agregada e anonimizada sempre que possível.`,
        },
        {
          title: '4. Compartilhamento com Terceiros',
          body: `A Nolei Creative poderá compartilhar seus dados com parceiros comerciais, fornecedores de serviços e outras entidades do grupo empresarial para os fins descritos nestes Termos. Não vendemos dados individuais identificáveis a terceiros sem seu consentimento explícito, exceto quando exigido por lei.`,
        },
        {
          title: '5. Backup e Armazenamento',
          body: `A Plataforma realiza backups automáticos semanais (todo domingo às 23h, horário de Brasília) para garantir a integridade dos seus dados. Os dados são armazenados localmente em banco de dados SQLite e podem ser sincronizados com Google Sheets quando a integração estiver configurada. A Nolei Creative emprega medidas técnicas razoáveis para proteger seus dados, mas não garante segurança absoluta.`,
        },
        {
          title: '6. Responsabilidades do Usuário',
          body: `Você é responsável pela veracidade das informações inseridas na Plataforma, pela segurança de suas credenciais de acesso e pelo uso adequado de todas as funcionalidades. É vedado o uso da Plataforma para fins ilícitos, fraudulentos ou que violem direitos de terceiros.`,
        },
        {
          title: '7. Propriedade Intelectual',
          body: `Todo o conteúdo da Plataforma — incluindo código-fonte, design, marca, logotipo e textos — é propriedade exclusiva da Nolei Creative, protegido pelas leis de direitos autorais e propriedade intelectual aplicáveis. É proibida a reprodução, distribuição ou modificação sem autorização prévia por escrito.`,
        },
        {
          title: '8. Limitação de Responsabilidade',
          body: `A Nolei Creative não se responsabiliza por danos diretos, indiretos, incidentais ou consequentes decorrentes do uso ou impossibilidade de uso da Plataforma, perda de dados, interrupção de serviço ou qualquer outra circunstância fora de nosso controle razoável.`,
        },
        {
          title: '9. Alterações nos Termos',
          body: `Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas por meio da Plataforma. O uso continuado após a publicação das alterações implica aceitação dos novos Termos.`,
        },
        {
          title: '10. Lei Aplicável e Foro',
          body: `Estes Termos são regidos pelas leis da República Federativa do Brasil. Eventuais disputas serão submetidas ao foro da comarca de domicílio da Nolei Creative, com renúncia a qualquer outro, por mais privilegiado que seja.`,
        },
        {
          title: '11. Contato',
          body: `Em caso de dúvidas sobre estes Termos ou sobre o tratamento de seus dados, entre em contato com a Nolei Creative pelo e-mail: contato@noleicreative.com.`,
        },
      ].map((s) => (
        <div key={s.title} className="clay-card p-6">
          <h2 className="text-base font-extrabold mb-3" style={{ color: 'var(--text-strong)' }}>{s.title}</h2>
          {s.body.split('\n\n').map((p, i) => (
            <p key={i} className="text-sm leading-relaxed mb-2 last:mb-0" style={{ color: 'var(--text-soft)' }}>{p}</p>
          ))}
        </div>
      ))}

      <div className="clay-card p-5 text-center"
        style={{ borderTop: '3px solid var(--brand-500)' }}>
        <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>
          © {new Date().getFullYear()} <span style={{ color: 'var(--brand-500)' }}>Nolei Creative</span> — LifeOS · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
