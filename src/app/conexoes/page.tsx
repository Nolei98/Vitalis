import React from 'react';
import { listIntegrations, type Provider } from '@/lib/integrations/vault';
import {
  saveGoogleIcalUrl,
  saveCanvasUrl,
  saveDiscordWebhook,
  saveClickUpToken,
  disconnectProvider,
  testDiscord,
} from '@/app/actions/integrations';
import SyncButton from '@/components/SyncButton';
import PageFrame from '@/components/PageFrame';
import ModIcon from '@/components/ModIcon';
import HelpHint from '@/components/HelpHint';

export const dynamic = 'force-dynamic';

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    connected: 'bg-emerald-100 text-emerald-700',
    error: 'bg-red-100 text-red-700',
    revoked: 'bg-gray-100 text-gray-500',
  };
  const label: Record<string, string> = { connected: 'Conectado', error: 'Erro', revoked: 'Revogado' };
  const s = status ?? 'desconectado';
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full ${map[s] ?? 'bg-gray-100 text-gray-400'}`}>
      {label[s] ?? 'Desconectado'}
    </span>
  );
}

function Disconnect({ provider }: { provider: Provider }) {
  return (
    <form action={disconnectProvider}>
      <input type="hidden" name="provider" value={provider} />
      <button className="text-xs font-bold text-red-500 hover:underline">Desconectar</button>
    </form>
  );
}

export default async function ConexoesPage() {
  const integrations = await listIntegrations();
  const by = (p: Provider) => integrations.find((i) => i.provider === p);
  const google = by('google');
  const canvas = by('canvas');
  const discord = by('discord');
  const clickup = by('clickup');

  return (
    <PageFrame>
      <header className="flex-shrink-0 flex items-center gap-3 pt-2">
        <ModIcon mod="conexoes" size="lg" />
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>Vitalis Connect</h1>
          <p className="text-sm font-bold" style={{ color: 'var(--mod-conexoes)' }}>Integrações com serviços externos</p>
        </div>
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google */}
        <div className="clay-card p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-gray-100 font-black text-blue-600">G</div>
              <div>
                <h2 className="text-xl font-bold text-[#4a3f72] inline-flex items-center">
                  Google Calendar
                  <HelpHint
                    title="Como pegar o link iCal"
                    steps={[
                      'Abra o Google Calendar no navegador.',
                      'Passe o mouse na agenda desejada (menu à esquerda) → clique nos 3 pontinhos → "Configurações e compartilhamento".',
                      'Role até "Integrar agenda".',
                      'Copie o "Endereço secreto em formato iCal" (ou o público, se a agenda for pública).',
                    ]}
                  />
                </h2>
                <p className="text-sm font-bold text-gray-500">Leitura via link iCal</p>
              </div>
            </div>
            <StatusBadge status={google?.status} />
          </div>
          <p className="text-gray-600 text-sm mb-6 font-medium">
            Cole o link iCal da agenda (veja o &quot;?&quot; ao lado do título para o passo a passo).
          </p>
          <form action={saveGoogleIcalUrl} className="space-y-3">
            <input
              name="icalUrl"
              defaultValue={google?.hasIcal ? '•••••• (salvo)' : ''}
              placeholder="https://calendar.google.com/calendar/ical/....ics"
              className="clay-card w-full px-4 py-2 text-sm outline-none border-none"
            />
            <button className="clay-btn bg-blue-600 text-white font-bold py-2 px-5 text-sm">Salvar</button>
          </form>
          {google && <div className="mt-3 text-right"><Disconnect provider="google" /></div>}
        </div>

        {/* Canvas */}
        <div className="clay-card p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl shadow-sm font-black border border-red-200">C</div>
              <div>
                <h2 className="text-xl font-bold text-[#4a3f72] inline-flex items-center">
                  Canvas LMS
                  <HelpHint
                    title="Como pegar o feed iCal do Canvas"
                    steps={[
                      'Entre no Canvas e abra "Calendário" no menu lateral.',
                      'No canto inferior direito da tela, clique em "Feeds do calendário" (Calendar Feed).',
                      'Copie o link exibido (termina em .ics).',
                    ]}
                  />
                </h2>
                <p className="text-sm font-bold text-gray-500">Leitura via feed iCal</p>
              </div>
            </div>
            <StatusBadge status={canvas?.status} />
          </div>
          <form action={saveCanvasUrl} className="space-y-3">
            <input
              name="icalUrl"
              defaultValue={canvas?.hasIcal ? '•••••• (salvo)' : ''}
              placeholder="https://canvas.../feeds/calendars/....ics"
              className="clay-card w-full px-4 py-2 text-sm outline-none border-none"
            />
            <button className="clay-btn bg-[#9871F5] text-white font-bold py-2 px-5 text-sm">Salvar</button>
          </form>
          {canvas && <div className="mt-3 text-right"><Disconnect provider="canvas" /></div>}
        </div>

        {/* Discord */}
        <div className="clay-card p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl shadow-sm font-black border border-indigo-200">D</div>
              <div>
                <h2 className="text-xl font-bold text-[#4a3f72] inline-flex items-center">
                  Discord
                  <HelpHint
                    title="Como pegar o webhook do Discord"
                    steps={[
                      'No servidor, abra "Configurações do servidor" → "Integrações".',
                      'Clique em "Webhooks" → "Novo Webhook".',
                      'Escolha o canal, clique em "Copiar URL do Webhook".',
                    ]}
                  />
                </h2>
                <p className="text-sm font-bold text-gray-500">Notificações e digest</p>
              </div>
            </div>
            <StatusBadge status={discord?.status} />
          </div>
          <form action={saveDiscordWebhook} className="space-y-3">
            <input
              name="webhookUrl"
              defaultValue={discord?.hasWebhook ? '•••••• (salvo)' : ''}
              placeholder="https://discord.com/api/webhooks/..."
              className="clay-card w-full px-4 py-2 text-sm outline-none border-none"
            />
            <button className="clay-btn bg-[#9871F5] text-white font-bold py-2 px-5 text-sm">Salvar</button>
          </form>
          {discord?.hasWebhook && (
            <div className="flex items-center justify-between gap-2 mt-3">
              <form action={testDiscord}>
                <button className="clay-btn bg-indigo-500 text-white font-bold py-2 px-4 text-sm">Testar webhook</button>
              </form>
              <Disconnect provider="discord" />
            </div>
          )}
        </div>

        {/* ClickUp */}
        <div className="clay-card p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-2xl shadow-sm font-black border border-pink-200">U</div>
              <div>
                <h2 className="text-xl font-bold text-[#4a3f72] inline-flex items-center">
                  ClickUp
                  <HelpHint
                    title="Como pegar o token e o ID do projeto"
                    steps={[
                      'Token: clique no seu avatar (canto inferior esquerdo) → "Configurações" → "Apps" → "API Token" → "Gerar" e copie.',
                      'ID do projeto (Pasta): abra a Pasta desejada no ClickUp → clique nos "..." ao lado do nome → "Copiar ID".',
                      'Sem ID de projeto, o sync traz tarefas do workspace inteiro.',
                    ]}
                  />
                </h2>
                <p className="text-sm font-bold text-gray-500">Tarefas com data (bidirecional)</p>
              </div>
            </div>
            <StatusBadge status={clickup?.status} />
          </div>
          <form action={saveClickUpToken} className="space-y-3">
            <input
              name="token"
              defaultValue={clickup?.hasToken ? '•••••• (salvo)' : ''}
              placeholder="pk_xxxxx (Personal API Token)"
              className="clay-card w-full px-4 py-2 text-sm outline-none border-none"
            />
            <input
              name="projectId"
              defaultValue={clickup?.scopes ?? ''}
              placeholder="ID do projeto/pasta (opcional — vazio = workspace inteiro)"
              className="clay-card w-full px-4 py-2 text-sm outline-none border-none"
            />
            <button className="clay-btn bg-[#9871F5] text-white font-bold py-2 px-5 text-sm">Salvar</button>
          </form>
          {clickup && <div className="mt-3 text-right"><Disconnect provider="clickup" /></div>}
        </div>
      </div>
      </div>
    </PageFrame>
  );
}
