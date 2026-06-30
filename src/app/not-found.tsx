export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
      <span className="text-6xl">🔍</span>
      <h1 className="text-3xl font-black" style={{ color: 'var(--text-strong)' }}>404</h1>
      <p className="font-bold" style={{ color: 'var(--text-soft)' }}>Página não encontrada</p>
      <a
        href="/"
        className="clay-btn px-6 py-2 font-bold text-white text-sm"
        style={{ background: 'var(--brand-500)' }}
      >
        Voltar ao início
      </a>
    </div>
  );
}
