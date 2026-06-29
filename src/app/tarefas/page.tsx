import React from 'react';
import { prisma } from '@/lib/prisma';
import TaskCheckbox from '@/components/TaskCheckbox';
import { createTaskForm, deleteTask } from '@/app/actions/tasks';

export const dynamic = 'force-dynamic';

const PRIORITY_LABEL: Record<number, string> = { 3: '🔴 Urgente', 2: '🟠 Alta', 1: '🟡 Média', 0: '⚪ Normal' };

export default async function TarefasPage() {
  const user = await prisma.user.findFirst({
    include: { tasks: { orderBy: [{ priority: 'desc' }, { due: 'asc' }] } }
  });

  if (!user) return <div>Carregando...</div>;

  const pendingTasks = user.tasks.filter(t => t.status === 'pending');
  const completedTasks = user.tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-[#4a3f72]">Vitalis <span className="text-[#9871F5]">Tasks</span></h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Left Column: Task List */}
        <div className="lg:col-span-2 clay-card p-6 h-[700px] flex flex-col">
          <h2 className="text-xl font-bold text-[#4a3f72] mb-6">Pendentes ({pendingTasks.length})</h2>
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
              <p className="text-gray-400 font-bold text-center py-8">Tudo limpo por aqui! 🎉</p>
            )}
          </div>

          <h2 className="text-xl font-bold text-[#4a3f72] mt-8 mb-4">Concluídas ({completedTasks.length})</h2>
          <div className="space-y-2 overflow-y-auto max-h-48 pr-2 no-scrollbar opacity-70">
            {completedTasks.map(task => (
              <TaskCheckbox key={task.id} task={task} />
            ))}
          </div>
        </div>

        {/* Right Column: Add Task */}
        <div className="clay-panel !bg-[#ffb6b9] p-8 h-fit text-pink-950">
          <h2 className="text-2xl font-bold mb-6">Nova Tarefa</h2>
          <form action={createTaskForm} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">O que você precisa fazer?</label>
              <input name="title" type="text" required className="w-full clay-card px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-pink-400" placeholder="Ex: Pagar a conta de luz" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Projeto / Categoria</label>
              <input name="project" type="text" className="w-full clay-card px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-pink-400" placeholder="Ex: Casa, Trabalho" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-2">Prioridade</label>
                <select name="priority" className="w-full clay-card px-3 py-3 text-gray-700 text-sm outline-none">
                  <option value="0">⚪ Normal</option>
                  <option value="1">🟡 Média</option>
                  <option value="2">🟠 Alta</option>
                  <option value="3">🔴 Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Prazo</label>
                <input name="due" type="date" className="w-full clay-card px-3 py-3 text-gray-700 text-sm outline-none" />
              </div>
            </div>
            <button type="submit" className="clay-btn bg-white w-full py-3 rounded-xl font-extrabold text-pink-600 mt-4 hover:scale-95 transition-transform">
              Adicionar Tarefa +
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
