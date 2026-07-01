export default function Loading() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse"
        style={{ background: 'rgba(255,255,255,0.6)', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
        <img src="/images/vitalis-logo.png" alt="Vitalis" width={40} height={40} />
      </div>
      <p className="text-sm font-bold" style={{ color: 'var(--text-soft)' }}>Carregando…</p>
    </div>
  );
}
