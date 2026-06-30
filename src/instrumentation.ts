/**
 * Hook de inicialização do servidor Next. A lógica node (node-cron + Prisma) fica
 * em ./instrumentation-node e só é importada no runtime Node — assim o webpack não
 * tenta empacotar node:crypto/Prisma para o runtime edge.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation-node');
  }
}
