import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { redirect } from 'next/navigation';
import AdminUserCard from '@/components/users/AdminUserCard';
import { sheetsConfigured } from '@/lib/integrations/sheets';
import BackupAllButton from '@/components/users/BackupAllButton';

export const dynamic = 'force-dynamic';

export default async function UsuariosPage() {
  const current = await getCurrentUser();

  const isAdmin =
    current.role === 'admin' ||
    (process.env.ADMIN_EMAIL && current.email === process.env.ADMIN_EMAIL);

  if (!isAdmin) redirect('/');

  const users = await prisma.user.findMany({
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    include: { _count: { select: { meals: true, foods: true, waterLogs: true } } },
  });

  const configured = sheetsConfigured();
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="h-full flex flex-col gap-3 page-enter">

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between pt-1 px-1">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: 'var(--brand-100)' }}>👥</span>
          <div>
            <h1 className="text-xl font-black" style={{ color: 'var(--text-strong)' }}>Vitalis Usuários</h1>
            <p className="text-[11px] font-bold" style={{ color: 'var(--text-soft)' }}>
              {users.length} cadastrados · {adminCount} admin · apenas admins veem esta página
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {!configured && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-xl">
              ⚠️ Backup off
            </span>
          )}
          {configured && <BackupAllButton />}
        </div>
      </header>

      {/* Estatísticas rápidas */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-2 px-1">
        {[
          { label: 'Total', value: users.length, icon: '👥' },
          { label: 'Admins', value: adminCount, icon: '👑' },
          { label: 'Com senha', value: users.filter((u) => u.passwordHash).length, icon: '🔒' },
          { label: 'Com backup', value: users.filter((u) => u.lastBackupAt).length, icon: '☁️' },
        ].map((s) => (
          <div key={s.label} className="clay-card p-3 text-center">
            <p className="text-lg">{s.icon}</p>
            <p className="text-xl font-black" style={{ color: 'var(--text-strong)' }}>{s.value}</p>
            <p className="text-[10px] font-bold" style={{ color: 'var(--text-soft)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lista de usuários — scroll interno */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 px-1 pb-2">
        {users.map((u) => (
          <AdminUserCard
            key={u.id}
            user={{ ...u, role: u.role ?? 'user' }}
            isSelf={u.id === current.id}
          />
        ))}
      </div>

    </div>
  );
}
