import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { dayRangeInTimezone } from '@/lib/timezone';
import WaterTracker from '@/components/WaterTracker';
import WaterReminder from '@/components/WaterReminder';
import PageFrame from '@/components/PageFrame';
import ModIcon from '@/components/ModIcon';

export const dynamic = 'force-dynamic';

export default async function AguaPage() {
  const user = await getCurrentUser();
  const { start } = dayRangeInTimezone(user.timezone);
  const waterLogs = await prisma.waterLog.findMany({
    where: { userId: user.id, createdAt: { gte: start } },
    orderBy: { createdAt: 'desc' },
  });

  const goal = 2000;

  return (
    <PageFrame>
      <header className="flex-shrink-0 flex items-center gap-3 pt-2">
        <ModIcon mod="agua" size="lg" />
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>Vitalis Hidro</h1>
          <p className="text-sm font-bold" style={{ color: 'var(--mod-agua)' }}>Acompanhe sua ingestão de água</p>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <WaterTracker
          goal={goal}
          logs={waterLogs.map((l) => ({ id: l.id, amount: l.amount, createdAt: l.createdAt.toISOString() }))}
        />
        <div className="mt-6">
          <WaterReminder
            initialWakeTime={user.wakeTime}
            initialInterval={user.waterReminderInterval}
            initialEnabled={user.waterReminderEnabled}
            goal={goal}
          />
        </div>
      </div>
    </PageFrame>
  );
}
