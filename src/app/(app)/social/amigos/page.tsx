import { getCurrentUser } from '@/lib/user';
import { getFriends, getPendingRequests, getSentRequests } from '@/lib/social';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import FriendActions from '@/components/social/FriendActions';
import SearchUsers from '@/components/social/SearchUsers';
import PageFrame from '@/components/PageFrame';

export const dynamic = 'force-dynamic';

export default async function AmigosPage() {
  const user = await getCurrentUser();
  const [friends, pending, sent] = await Promise.all([
    getFriends(user.id),
    getPendingRequests(user.id),
    getSentRequests(user.id),
  ]);

  return (
    <PageFrame>
      <header className="flex-shrink-0 flex items-center gap-3 pt-2">
        <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: 'var(--mod-social-bg)' }}>👥</span>
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>Amigos</h1>
          <p className="text-sm font-bold" style={{ color: 'var(--mod-social)' }}>
            {friends.length} amigo{friends.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/social" className="ml-auto clay-btn px-4 py-2 text-sm font-bold"
          style={{ background: 'var(--mod-social-bg)', color: 'var(--mod-social-strong)' }}>
          ← Social
        </Link>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Pedidos recebidos */}
          {pending.length > 0 && (
            <div className="clay-card p-5" style={{ borderTop: '3px solid var(--mod-social)' }}>
              <h2 className="text-base font-extrabold mb-3" style={{ color: 'var(--text-strong)' }}>
                Pedidos recebidos ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: 'var(--mod-social-bg)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                      style={{ background: 'var(--mod-social)' }}>
                      {(f.requester.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-sm truncate" style={{ color: 'var(--text-strong)' }}>
                        {f.requester.name}
                      </p>
                      {f.requester.handle && (
                        <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>@{f.requester.handle}</p>
                      )}
                    </div>
                    <FriendActions friendshipId={f.id} type="received" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amigos */}
          <div className="clay-card p-5">
            <h2 className="text-base font-extrabold mb-3" style={{ color: 'var(--text-strong)' }}>
              Meus amigos
            </h2>
            {friends.length === 0 && (
              <p className="text-sm font-bold text-center py-6" style={{ color: 'var(--text-soft)' }}>
                Nenhum amigo ainda. Adicione alguém! 👋
              </p>
            )}
            <div className="space-y-3">
              {friends.map(({ friend, friendshipId }) => (
                <div key={friendshipId} className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: '#F9F8FF' }}>
                  <Link href={`/social/perfil/${friend.id}`}
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                    style={{ background: 'var(--mod-social)' }}>
                    {(friend.name || '?')[0].toUpperCase()}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/social/perfil/${friend.id}`}
                      className="font-extrabold text-sm block truncate hover:underline"
                      style={{ color: 'var(--text-strong)' }}>
                      {friend.name}
                    </Link>
                    {friend.handle && (
                      <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>@{friend.handle}</p>
                    )}
                    {friend.bio && (
                      <p className="text-xs truncate" style={{ color: 'var(--text-soft)' }}>{friend.bio}</p>
                    )}
                  </div>
                  <div className="flex gap-2 items-center shrink-0">
                    <Link href={`/social/chat/dm-${[user.id, friend.id].sort().join('_')}`}
                      className="clay-btn px-3 py-1.5 text-xs font-bold text-white"
                      style={{ background: 'var(--mod-social)' }}>
                      💬
                    </Link>
                    <FriendActions friendshipId={friendshipId} type="friend" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pedidos enviados */}
          {sent.length > 0 && (
            <div className="clay-card p-5">
              <h2 className="text-base font-extrabold mb-3" style={{ color: 'var(--text-strong)' }}>
                Pedidos enviados
              </h2>
              <div className="space-y-2">
                {sent.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'var(--text-soft)' }}>
                      {(f.addressee.name || '?')[0]}
                    </div>
                    <span className="text-sm font-bold flex-1" style={{ color: 'var(--text-soft)' }}>
                      {f.addressee.name}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#F4F2FE', color: 'var(--text-soft)' }}>pendente</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Busca */}
        <div>
          <SearchUsers currentUserId={user.id} />
        </div>
      </div>
      </div>
    </PageFrame>
  );
}
