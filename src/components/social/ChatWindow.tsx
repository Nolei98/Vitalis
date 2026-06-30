'use client';

import { useEffect, useRef, useState, useTransition, useCallback } from 'react';
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
  _optimistic?: boolean;
}

const QUICK_EMOJIS = ['👍','❤️','😂','🔥','💪','🎉'];

interface Props {
  chatKey: string;
  squadId?: string;
  toUserId?: string;
  currentUserId: string;
  currentUserName: string;
  initialMessages: Msg[];
  title: string;
}

export default function ChatWindow({ chatKey, squadId, toUserId, currentUserId, currentUserName, initialMessages, title }: Props) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [, startReact] = useTransition();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadPending, setUploadPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // track the latest real message timestamp for SSE query
  const sinceRef = useRef<Date>(
    initialMessages.length > 0
      ? new Date(initialMessages.at(-1)!.createdAt)
      : new Date(Date.now() - 120_000)
  );

  // ── SSE ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let es: EventSource | null = null;
    let destroyed = false;

    function connect() {
      if (destroyed) return;
      const url = `/api/social/stream?key=${encodeURIComponent(chatKey)}&since=${sinceRef.current.toISOString()}`;
      es = new EventSource(url);

      es.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type !== 'messages' || !payload.data?.length) return;
          const incoming = payload.data as Msg[];

          setMessages((prev) => {
            const realIds = new Set(prev.filter(m => !m._optimistic).map(m => m.id));
            const fresh = incoming.filter(m => !realIds.has(m.id));
            if (fresh.length === 0) return prev;

            // advance sinceRef to latest real message
            sinceRef.current = new Date(fresh.at(-1)!.createdAt);

            // remove optimistic messages whose text matches fresh messages from me
            const myFreshTexts = new Set(
              fresh.filter(m => m.senderId === currentUserId).map(m => m.text)
            );
            const withoutStaleOptimistic = prev.filter(
              m => !m._optimistic || !myFreshTexts.has(m.text)
            );
            return [...withoutStaleOptimistic, ...fresh];
          });
        } catch { /* skip malformed */ }
      };

      es.onerror = () => {
        es?.close();
        if (!destroyed) setTimeout(connect, 3000);
      };
    }

    connect();
    return () => {
      destroyed = true;
      es?.close();
    };
  }, [chatKey, currentUserId]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    const t = text;
    const rpy = replyTo;
    setText('');
    setReplyTo(null);
    setSending(true);

    // Optimistic insert
    const optimisticMsg: Msg = {
      id: `opt-${Date.now()}`,
      senderId: currentUserId,
      text: t,
      createdAt: new Date().toISOString(),
      sender: { id: currentUserId, name: currentUserName, avatarUrl: null, handle: null },
      attachments: [],
      reactions: [],
      replyTo: rpy ? { id: rpy.id, text: rpy.text, sender: rpy.sender } : null,
      _optimistic: true,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const fd = new FormData();
      fd.set('text', t);
      if (squadId) fd.set('squadId', squadId);
      if (toUserId) fd.set('toUserId', toUserId);
      if (rpy) fd.set('replyToId', rpy.id);
      await sendMessage(null, fd);
    } catch {
      // on failure, remove optimistic and restore text
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setText(t);
    } finally {
      setSending(false);
    }
    inputRef.current?.focus();
  }, [text, replyTo, sending, squadId, toUserId, currentUserId, currentUserName]);

  async function uploadFile(file: File) {
    setUploadPending(true);
    try {
      const fd = new FormData();
      fd.set('text', '');
      fd.set('hasAttachment', '1');
      if (squadId) fd.set('squadId', squadId);
      if (toUserId) fd.set('toUserId', toUserId);
      await sendMessage(null, fd);

      const upFd = new FormData();
      upFd.set('file', file);
      await fetch('/api/social/upload', { method: 'POST', body: upFd });
    } finally {
      setUploadPending(false);
    }
  }

  function reactToMsg(msgId: string, emoji: string) {
    if (msgId.startsWith('opt-')) return;
    startReact(() => { void toggleReaction(msgId, emoji); });
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
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0 self-end"
                style={{ background: isMe ? 'var(--mod-social)' : '#9871F5' }}>
                {(msg.sender.name || '?')[0].toUpperCase()}
              </div>

              <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isMe && (
                  <span className="text-[11px] font-bold px-1" style={{ color: 'var(--text-soft)' }}>
                    {msg.sender.name}
                  </span>
                )}

                {msg.replyTo && (
                  <div className="px-3 py-1.5 rounded-xl text-xs font-bold border-l-2"
                    style={{ borderColor: 'var(--mod-social)', background: 'var(--mod-social-bg)', color: 'var(--mod-social-strong)' }}>
                    ↩ {msg.replyTo.sender.name}: {msg.replyTo.text?.slice(0, 60)}
                  </div>
                )}

                <div
                  className="px-4 py-2.5 rounded-2xl text-sm font-medium break-words transition-opacity"
                  style={isMe
                    ? {
                        background: 'linear-gradient(135deg, var(--mod-social), var(--brand-500))',
                        color: 'white',
                        borderBottomRightRadius: 4,
                        opacity: msg._optimistic ? 0.65 : 1,
                      }
                    : {
                        background: 'white',
                        color: 'var(--text-strong)',
                        boxShadow: 'var(--shadow-card)',
                        borderBottomLeftRadius: 4,
                      }
                  }
                >
                  {msg.text}
                  {msg.attachments.map((a) => (
                    <img key={a.id} src={a.url} alt="attachment"
                      className="mt-2 rounded-xl max-w-full max-h-48 object-cover" />
                  ))}
                  {msg._optimistic && (
                    <span className="ml-2 text-[10px] opacity-70">⏳</span>
                  )}
                </div>

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

                {!msg._optimistic && (
                  <div className={`flex gap-1 opacity-0 group-hover:opacity-100 ${isMe ? 'flex-row-reverse' : ''}`}>
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
                )}

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
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { submit(e); } }}
          placeholder="Mensagem..."
          className="clay-card flex-1 px-4 py-2.5 text-sm outline-none"
        />
        <button type="submit" disabled={sending || (!text.trim() && !uploadPending)}
          className="clay-btn w-10 h-10 flex items-center justify-center text-white disabled:opacity-50 transition-opacity"
          style={{ background: 'var(--mod-social)' }}>
          {sending ? '⌛' : '➤'}
        </button>
      </form>
    </div>
  );
}
