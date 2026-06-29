import { getCurrentUser } from '@/lib/user';
import { getPublicProfile, BADGE_LABEL, SQUAD_TYPE_META } from '@/lib/social';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SendRequestButton from '@/components/social/SendRequestButton';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [me, profile] = await Promise.all([
    getCurrentUser(),
    getPublicProfile(id),
  ]);

  if (!profile.user) notFound();
  const { user, sessions, totalMin, badges, squads } = profile;
  const isMe = me.id === id;

  // Check friendship status
  const friendship = !isMe ? await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: me.id, addresseeId: id },
        { requesterId: id, addresseeId: me.id },
      ],
    },
  }) : null;

  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;

  return (
    <div className="space-y-6 page-enter pb-8">
      <header className="flex items-center gap-3 pt-2">
        <Link href="/social/amigos" className="clay-btn px-3 py-2 text-sm font-bold"
          style={{ background: 'var(--mod-social-bg)', color: 'var(--mod-social-strong)' }}>← Amigos</Link>
      </header>

      {/* Profile card */}
      <div className="clay-card p-6 flex gap-5 items-start">
        <div className="w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--mod-social), var(--brand-500))' }}>
          {(user.name || user.handle || '?')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black truncate" style={{ color: 'var(--text-strong)' }}>
            {user.name ?? user.handle ?? 'Usuário'}
          </h1>
          {user.handle && (
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--mod-social)' }}>@{user.handle}</p>
          )}
          {user.bio && (
            <p className="text-sm" style={{ color: 'var(--text-soft)' }}>{user.bio}</p>
          )}
          <div className="flex gap-4 mt-3 text-sm font-bold flex-wrap">
            <span style={{ color: 'var(--text-soft)' }}>
              ⏱️ <span style={{ color: 'var(--text-strong)' }}>{hours}h{mins > 0 ? ` ${mins}min` : ''}</span> registradas
            </span>
            <span style={{ color: 'var(--text-soft)' }}>
              📋 <span style={{ color: 'var(--text-strong)' }}>{sessions}</span> sessões
            </span>
            <span style={{ color: 'var(--text-soft)' }}>
              🏆 <span style={{ color: 'var(--text-strong)' }}>{squads.length}</span> squads
            </span>
          </div>
        </div>

        {!isMe && (
          <div className="flex flex-col gap-2 shrink-0">
            {friendship?.status === 'accepted' ? (
              <Link href={`/social/chat/dm-${[me.id, id].sort().join('_')}`}
                className="clay-btn px-4 py-2 text-sm font-bold text-white"
                style={{ background: 'var(--mod-social)' }}>
                💬 Mensagem
              </Link>
            ) : friendship?.status === 'pending' ? (
              <span className="text-xs font-bold px-3 py-2 rounded-xl"
                style={{ background: 'var(--mod-social-bg)', color: 'var(--mod-social)' }}>
                Pendente
              </span>
            ) : (
              <SendRequestButton targetId={id} />
            )}
          </div>
        )}

        {isMe && (
          <Link href="/social/configurar-perfil"
            className="clay-btn px-4 py-2 text-sm font-bold"
            style={{ background: 'var(--mod-social-bg)', color: 'var(--mod-social-strong)' }}>
            ✏️ Editar
          </Link>
        )}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="clay-card p-5">
          <h2 className="text-base font-extrabold mb-3" style={{ color: 'var(--text-strong)' }}>Conquistas</h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span key={b.id} className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'var(--mod-social-bg)', color: 'var(--mod-social-strong)' }}>
                {BADGE_LABEL[b.type] ?? b.type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Squads em comum ou próprios */}
      {squads.length > 0 && (
        <div className="clay-card p-5">
          <h2 className="text-base font-extrabold mb-3" style={{ color: 'var(--text-strong)' }}>
            {isMe ? 'Meus Squads' : 'Squads em comum'}
          </h2>
          <div className="flex flex-wrap gap-3">
            {squads.map((sq) => {
              const meta = SQUAD_TYPE_META[sq.type] ?? { emoji: '🏆', label: sq.type, color: '#9871F5' };
              return (
                <Link key={sq.id} href={`/social/squad/${sq.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-bold hover:opacity-80 transition-opacity"
                  style={{ background: `${meta.color}18`, color: meta.color }}>
                  <span>{sq.coverEmoji}</span>
                  <span>{sq.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
