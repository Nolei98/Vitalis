import React from 'react';
import { prisma } from '@/lib/prisma';
import TaskCheckbox from '@/components/TaskCheckbox';
import { createTaskForm, deleteTask } from '@/app/actions/tasks';
import PageFrame from '@/components/PageFrame';
import ModIcon from '@/components/ModIcon';

export const dynamic = 'force-dynamic';

const PRIORITY_LABEL: Record<number, string> = { 3: '🔴 Urgente', 2: '🟠 Alta', 1: '🟡 Média', 0: '⚪ Normal' };

export default async function TarefasPage() {
  const user = await prisma.user.findFirst({
    include: { tasks: { orderBy: [{ priority: 'desc' }, { due: 'asc' }] } }
  });

  if (!user) return <div>Carregando...</div>;

  const pendingTasks = user.tasks.filter(t => t.status === 'pending');
  const completedTasks = user.tasks.filter(t => t.status === 'completed');

  const doneCount = completedTasks.length;
  const totalCount = user.tasks.length;
  const donePct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <PageFrame>
      <header className="flex-shrink-0 flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <ModIcon mod="tarefas" size="lg" />
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>Vitalis Tarefas</h1>
            <p className="text-sm font-bold" style={{ color: 'var(--mod-tarefas)' }}>{doneCount}/{totalCount} concluídas · {donePct}%</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--mod-tarefas-bg)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${donePct}%`, background: 'var(--mod-tarefas)' }} />
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Task List */}
        <div className="lg:col-span-2 clay-card p-5 h-[680px] flex flex-col">
          <h2 className="text-base font-extrabold mb-4" style={{ color: 'var(--text-strong)' }}>
            Pendentes <span className="ml-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'var(--mod-tarefas-bg)', color: 'var(--mod-tarefas-strong)' }}>
              {pendingTasks.length}
            </span>
          </h2>
          <div className="space-y-2 overflow-y-auto flex-1 pr-2 no-scrollbar">
            {pendingTasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 group">
                <div className="flex-1">
                  <TaskCheckbox task={task} />
                </div>
                <div className="flex items-center gap-2 pr-2">
                  {task.due && (
                    <span className="text-[10px] font-bold text-amber-500">
                      {task.due.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  )}
                  {task.priority > 0 && (
                    <span className="text-[10px] font-bold text-gray-400">{PRIORITY_LABEL[task.priority]}</span>
                  )}
                  {task.source !== 'internal' && (
                    <span className="text-[9px] font-bold bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded">{task.source}</span>
                  )}
                  <form action={deleteTask}>
                    <input type="hidden" name="id" value={task.id} />
                    <button className="text-xs text-red-300 hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </form>
                </div>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-center py-8 font-bold text-sm" style={{ color: 'var(--text-soft)' }}>
                Tudo limpo por aqui! 🎉
              </p>
            )}
          </div>

          <h2 className="text-base font-extrabold mt-6 mb-3" style={{ color: 'var(--text-strong)' }}>
            Concluídas <span className="ml-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'var(--mod-tarefas-bg)', color: 'var(--mod-tarefas-strong)' }}>
              {completedTasks.length}
            </span>
          </h2>
          <div className="space-y-2 overflow-y-auto max-h-40 no-scrollbar opacity-60">
            {completedTasks.map(task => (
              <TaskCheckbox key={task.id} task={task} />
            ))}
          </div>
        </div>

        {/* Right Column: Add Task */}
        <div className="clay-card p-5 h-fit" style={{ borderTop: '3px solid var(--mod-tarefas)' }}>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: 'var(--mod-tarefas-bg)' }}>➕</span>
            <h2 className="text-base font-extrabold" style={{ color: 'var(--text-strong)' }}>Nova Tarefa</h2>
          </div>
          <form action={createTaskForm} className="space-y-4">
            <input name="title" type="text" required className="w-full clay-card px-4 py-3 text-sm outline-none"
              placeholder="O que precisa fazer?" />
            <input name="project" type="text" className="w-full clay-card px-4 py-3 text-sm outline-none"
              placeholder="Projeto / Categoria" />
            <div className="grid grid-cols-2 gap-3">
              <select name="priority" className="clay-card px-3 py-2.5 text-sm outline-none">
                <option value="0">⚪ Normal</option>
                <option value="1">🟡 Média</option>
                <option value="2">🟠 Alta</option>
                <option value="3">🔴 Urgente</option>
              </select>
              <input name="due" type="date" className="clay-card px-3 py-2.5 text-sm outline-none" />
            </div>
            <button type="submit" className="clay-btn w-full py-3 rounded-xl font-extrabold text-white"
              style={{ background: 'var(--mod-tarefas)' }}>
              Adicionar +
            </button>
          </form>
        </div>
      </div>
      </div>
    </PageFrame>
  );
}
