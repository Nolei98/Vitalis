/**
 * Scheduler de backup automático (só runtime Node). Importado por instrumentation.ts
 * sob o guard NEXT_RUNTIME === 'nodejs'. Todo domingo 23:00 (America/Sao_Paulo) faz
 * push de TODOS os usuários para a planilha. Roda enquanto o servidor estiver de pé.
 */
import cron from 'node-cron';
import { syncAllUsersToSheets, sheetsConfigured } from '@/lib/integrations/sheets';

const g = globalThis as unknown as { __lifeosBackupCron?: boolean };

if (!g.__lifeosBackupCron) {
  g.__lifeosBackupCron = true;

  if (!sheetsConfigured()) {
    console.log('[backup] SHEETS_API_URL ausente — scheduler de domingo não registrado.');
  } else {
    // '0 23 * * 0' = aos domingos, 23:00.
    cron.schedule(
      '0 23 * * 0',
      async () => {
        try {
          const r = await syncAllUsersToSheets();
          console.log(`[backup] domingo 23:00 — ${r.succeeded}/${r.users} ok, ${r.failed} falha(s)`, r.errors);
        } catch (e) {
          console.error('[backup] falhou:', e);
        }
      },
      { timezone: 'America/Sao_Paulo' },
    );
    console.log('[backup] scheduler registrado: domingo 23:00 (America/Sao_Paulo).');
  }
}
