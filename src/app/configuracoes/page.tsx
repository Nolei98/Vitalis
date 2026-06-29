import React from 'react';
import fs from 'fs';
import path from 'path';
import { saveGoogleKeys } from '@/app/actions/settings';
import ThemePicker from '@/components/ThemePicker';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const envPath = path.join(process.cwd(), '.env');
  let clientId = '';
  let clientSecret = '';
  
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    const idMatch = env.match(/GOOGLE_CLIENT_ID="?([^"\n]+)"?/);
    const secretMatch = env.match(/GOOGLE_CLIENT_SECRET="?([^"\n]+)"?/);
    if (idMatch) clientId = idMatch[1];
    if (secretMatch) clientSecret = secretMatch[1];
  }

  return (
    <div className="space-y-6 page-enter h-full flex flex-col">
      <header className="flex items-center gap-3 pt-2">
        <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: 'var(--mod-config-bg)' }}>⚙️</span>
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>Vitalis Config</h1>
          <p className="text-sm font-bold" style={{ color: 'var(--mod-config-strong)' }}>Configurações do sistema</p>
        </div>
      </header>

      <ThemePicker />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        
        <div className="clay-card p-6 border-2 border-emerald-400 h-fit">
          <h2 className="text-xl font-bold text-[#4a3f72] mb-2">Credenciais do Google (OAuth)</h2>
          <p className="text-sm font-medium text-gray-500 mb-6">Configure o Client ID e Secret do Google Cloud Console para ativar o Login e as APIs (Calendar/Drive).</p>
          
          <form action={saveGoogleKeys} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Google Client ID</label>
              <input name="clientId" type="text" defaultValue={clientId} required className="w-full clay-card px-4 py-2 outline-none font-mono text-sm" placeholder="Ex: 12345678-xxx.apps.googleusercontent.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Google Client Secret</label>
              <input name="clientSecret" type="password" defaultValue={clientSecret} required className="w-full clay-card px-4 py-2 outline-none font-mono text-sm" placeholder="Ex: GOCSPX-xxxx" />
            </div>
            
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-bold border border-blue-200">
               ℹ️ Atenção: Ao salvar, as credenciais são gravadas no seu arquivo <code className="bg-white/50 px-1 rounded">.env</code>. Como o NextAuth só carrega essas variáveis na inicialização, você precisará derrubar o terminal e rodar <code className="bg-white/50 px-1 rounded">npm run dev</code> novamente após salvar.
            </div>

            <button type="submit" className="clay-btn bg-[#9871F5] text-white w-full py-3 rounded-xl font-extrabold mt-2 hover:scale-95 transition-transform">
              Salvar Credenciais
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
