'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { sendMessage, toggleReaction } from '@/app/actions/social';

interface Sender { id: string; name: string | null; avatarUrl: string | null; handle: string | null; }
interface Attach { id: string; url: string; mime: string; width: number | null; height: number | null; }
interface RxMap { [emoji: string]: { count: number; myReact: boolean } }
interface Msg {
  id: string;
  senderId: string;
  text: string | null;
  createdAt: string;
  sender: Sender;
  attachments: Attach[];
  reactions: { emoji: string; userId: string; user: { id: string; name: string | null } }[];
  replyTo: { id: string; text: string | null; sender: { id: string; name: string | null } } | null;
}

const QUICK_EMOJIS = ['👍','❤️','😂','🔥','💪','🎉'];

interface Props {
  chatKey: string;    // "squad-<id>" or "dm-<uid1><uid2>"
  squadId?: string;
  toUserId?: string;
  currentUserId: string;
  initialMessages: Msg[];
  title: string;
}

export default function ChatWindow({ chatKey, squadId, toUserId, currentUserId, initialMessages, title }: Props) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [pendingMsg, startMsg] = useTransition();
  const [text, setText] = useState('');
  const [uploadPending, setUploadPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const since = useRef(initialMessages.length > 0 ? new Date(initialMessages.at(-1)!.createdAt) : new Date(Date.now() - 60000));

  // SSE
  useEffect(() => {
    const url = `/api/social/stream?key=${encodeURIComponent(chatKey)}&since=${since.current.toISOString()}`;
    const es = new EventSource(url);
    es.onmessage = (e) => {
      const payload = JSON.parse(e.data);
      if (payload.type === 'messages' && payload.data?.length) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const fresh = (payload.data as Msg[]).filter((m) => !ids.has(m.id));
          if (fresh.length === 0) return prev;
          since.current = new Date(fresh.at(-1)!.createdAt);
          return [...prev, ...fresh];
        });
      }
    };
    return () => es.close();
  }, [chatKey]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !uploadPending) return;
    const t = text;
    setText('');
    const rpy = replyTo;
    setReplyTo(null);

    const fd = new FormData();
    fd.set('text', t);
    if (squadId) fd.set('squadId', squadId);
    if (toUserId) fd.set('toUserId', toUserId);
    if (rpy) fd.set('replyToId', rpy.id);

    startMsg(() => { void sendMessage(null, fd); });
    inputRef.current?.focus();
  }

  async function uploadFile(file: File) {
    setUploadPending(true);
    // First create a placeholder message to attach to
    const fd = new FormData();
    fd.set('text', '');
    fd.set('hasAttachment', '1');
    if (squadId) fd.set('squadId', squadId);
    if (toUserId) fd.set('toUserId', toUserId);
    await sendMessage(null, fd);

    // Then fetch the new message id and upload
    // Simplified: just upload image then re-fetch messages via SSE
    const upFd = new FormData();
    upFd.set('file', file);
    await fetch('/api/social/upload', { method: 'POST', body: upFd });
    setUploadPending(false);
  }

  function reactToMsg(msgId: string, emoji: string) {
    startMsg(() => { void toggleReaction(msgId, emoji); });
  }

  function groupReactions(reactions: Msg['reactions']): RxMap {
    const map: RxMap = {};
    for (const r of reactions) {
      if (!map[r.emoji]) map[r.emoji] = { count: 0, myReact: false };
      map[r.emoji].count++;
      if (r.userId === currentUserId) map[r.emoji].myReact = true;
    }
    return map;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100/80">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
          style={{ background: 'var(--mod-social)' }}>
          {title[0].toUpperCase()}
        </div>
        <span className="font-extrabold text-sm" style={{ color: 'var(--text-strong)' }}>{title}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2"
            style={{ color: 'var(--text-soft)' }}>
            <span className="text-4xl">💬</span>
            <p className="font-bold text-sm">Nenhuma mensagem ainda.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          const rxMap = groupReactions(msg.reactions);
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0 self-end"
                style={{ background: isMe ? 'var(--mod-social)' : 'var(--brand-300)' }}>
                {(msg.sender.name || '?')[0].toUpperCase()}
              </div>

              <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isMe && (
                  <span className="text-[11px] font-bold px-1" style={{ color: 'var(--text-soft)' }}>
                    {msg.sender.name}
                  </span>
                )}

                {/* Reply preview */}
                {msg.replyTo && (
                  <div className="px-3 py-1.5 rounded-xl text-xs font-bold border-l-2"
                    style={{ borderColor: 'var(--mod-social)', background: 'var(--mod-social-bg)', color: 'var(--mod-social-strong)' }}>
                    ↩ {msg.replyTo.sender.name}: {msg.replyTo.text?.slice(0, 60)}
                  </div>
                )}

                {/* Bubble */}
                <div
                  className="px-4 py-2.5 rounded-2xl text-sm font-medium break-words"
                  style={isMe
                    ? { background: 'linear-gradient(135deg, var(--mod-social), var(--brand-500))', color: 'white', borderBottomRightRadius: 4 }
                    : { background: 'white', color: 'var(--text-strong)', boxShadow: 'var(--shadow-card)', borderBottomLeftRadius: 4 }
                  }
                >
                  {msg.text}
                  {msg.attachments.map((a) => (
                    <img key={a.id} src={a.url} alt="attachment"
                      className="mt-2 rounded-xl max-w-full max-h-48 object-cover" />
                  ))}
                </div>

                {/* Reactions */}
                {Object.keys(rxMap).length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {Object.entries(rxMap).map(([emoji, { count, myReact }]) => (
                      <button key={emoji} onClick={() => reactToMsg(msg.id, emoji)}
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full transition-all"
                        style={{
                          background: myReact ? 'var(--mod-social-bg)' : '#F4F2FE',
                          color: myReact ? 'var(--mod-social-strong)' : 'var(--text-soft)',
                          outline: myReact ? '1.5px solid var(--mod-social)' : 'none',
                        }}>
                        {emoji} {count}
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick actions */}
                <div className={`flex gap-1 opacity-0 hover:opacity-100 transition-opacity ${isMe ? 'flex-row-reverse' : ''}`}>
                  {QUICK_EMOJIS.map((e) => (
                    <button key={e} onClick={() => reactToMsg(msg.id, e)}
                      className="text-sm hover:scale-125 transition-transform">
                      {e}
                    </button>
                  ))}
                  <button onClick={() => setReplyTo(msg)}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#F4F2FE', color: 'var(--text-soft)' }}>
                    ↩
                  </button>
                </div>

                <span className="text-[10px]" style={{ color: 'var(--text-soft)' }}>
                  {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply banner */}
      {replyTo && (
        <div className="px-4 py-2 flex items-center gap-2 text-xs font-bold"
          style={{ background: 'var(--mod-social-bg)', color: 'var(--mod-social-strong)' }}>
          <span className="flex-1 truncate">↩ {replyTo.sender.name}: {replyTo.text?.slice(0, 60)}</span>
          <button onClick={() => setReplyTo(null)}>✕</button>
        </div>
      )}

      {/* Composer */}
      <form onSubmit={submit} className="flex items-center gap-2 px-4 py-3 border-t border-gray-100/80">
        <input type="file" ref={fileRef} accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
        <button type="button" onClick={() => fileRef.current?.click()}
          className="clay-btn w-9 h-9 flex items-center justify-center text-base"
          style={{ background: 'var(--mod-social-bg)', color: 'var(--mod-social)' }}>
          📎
        </button>
        <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Mensagem..."
          className="clay-card flex-1 px-4 py-2.5 text-sm outline-none" />
        <button type="submit" disabled={pendingMsg || (!text.trim() && !uploadPending)}
          className="clay-btn w-10 h-10 flex items-center justify-center text-white disabled:opacity-50"
          style={{ background: 'var(--mod-social)' }}>
          {pendingMsg ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
}
