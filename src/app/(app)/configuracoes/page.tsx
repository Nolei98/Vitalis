import React from 'react';
import fs from 'fs';
import path from 'path';
import { saveGoogleKeys } from '@/app/actions/settings';
import ThemePicker from '@/components/ThemePicker';
import PageFrame from '@/components/PageFrame';
import ModIcon from '@/components/ModIcon';

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
    <PageFrame>
      <header className="flex-shrink-0 flex items-center gap-4 pt-4 pb-6 border-b border-black/5 mb-6">
        <ModIcon mod="config" size="lg" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#14150F]">
            Vitalis Config
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-[#8A9A5B]">
            Configurações e Personalização
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-10 space-y-8">
        
        {/* Seção 1: Aparência */}
        <ThemePicker />

        {/* Seção 2: Integrações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="clay-card p-8 border border-white/60 bg-white/45 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide mb-1 text-[#14150F]">
                Credenciais Google (OAuth)
              </h2>
              <p className="text-xs font-semibold mb-6 leading-relaxed text-[#6B6F63]">
                Configure o Client ID e Secret do Google Cloud Console para ativar o Login Social e sincronizar as APIs de Calendário e Drive.
              </p>
              
              <form action={saveGoogleKeys} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-[#6B6F63]">
                    Google Client ID
                  </label>
                  <input
                    name="clientId"
                    type="text"
                    defaultValue={clientId}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 text-[#14150F] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] focus:bg-white transition-all font-mono"
                    placeholder="Ex: 12345678-xxx.apps.googleusercontent.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-[#6B6F63]">
                    Google Client Secret
                  </label>
                  <input
                    name="clientSecret"
                    type="password"
                    defaultValue={clientSecret}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 text-[#14150F] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] focus:bg-white transition-all font-mono"
                    placeholder="Ex: GOCSPX-xxxx"
                  />
                </div>
                
                <div className="bg-[#B7C48E]/15 text-[#14150F] p-4 rounded-2xl text-[11px] font-semibold border border-[#8A9A5B]/30 leading-relaxed shadow-sm">
                  💡 <strong>Importante:</strong> As chaves são salvas no arquivo <code className="bg-white/50 px-1 rounded font-mono text-[10px]">.env</code> local. Como as chaves do NextAuth são lidas na inicialização, você precisará reiniciar o servidor (<code className="bg-white/50 px-1 rounded font-mono text-[10px]">npm run dev</code>) para carregar as alterações.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#14150F] hover:bg-[#8A9A5B] active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition-all duration-300 shadow-md mt-4 cursor-pointer"
                >
                  Salvar Credenciais
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </PageFrame>
  );
}
