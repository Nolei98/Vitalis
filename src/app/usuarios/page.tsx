import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { sheetsConfigured } from '@/lib/integrations/sheets';
import UserBackupButton from '@/components/users/UserBackupButton';
import BackupAllButton from '@/components/users/BackupAllButton';

export const dynamic = 'force-dynamic';

function fmt(d: Date | null): string {
  if (!d) return 'nunca';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export default async function UsuariosPage() {
  const current = await getCurrentUser();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { meals: true, foods: true, waterLogs: true } } },
  });

  const configured = sheetsConfigured();

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Vitalis Usuários</h1>
          <p className="text-sm text-gray-500 font-semibold">
            Cada usuário é uma linha na planilha do Drive. Backup automático todo domingo 23:00.
          </p>
        </div>
        {configured && <BackupAllButton />}
      </div>

      {!configured && (
        <p className="mb-4 text-sm font-bold text-amber-600">
          ⚠️ SHEETS_API_URL não configurada — backup desabilitado.
        </p>
      )}

      <div className="space-y-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white rounded-3xl p-5 shadow-[0_4px_14px_rgba(0,0,0,0.06)] flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-gray-800 truncate">{u.name || '(sem nome)'}</span>
                {u.id === current.id && (
                  <span className="text-[10px] font-bold bg-[#9871F5] text-white rounded-full px-2 py-0.5">
                    você
                  </span>
                )}
                {!u.passwordHash && (
                  <span className="text-[10px] font-bold bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
                    sem senha
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 font-semibold truncate">{u.email || '—'}</div>
              <div className="text-xs text-gray-400 font-semibold mt-1">
                🥗 {u._count.meals} refeições · 🍎 {u._count.foods} alimentos · 💧 {u._count.waterLogs} regs ·
                ☁️ último backup: {fmt(u.lastBackupAt)}
              </div>
            </div>
            {configured && <UserBackupButton userId={u.id} />}
          </div>
        ))}
      </div>
    </div>
  );
}
