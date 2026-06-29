'use client'
import { useTransition } from 'react'
import { toggleTask } from '@/app/actions/tasks'

export default function TaskCheckbox({ task }: { task: any }) {
  const [isPending, startTransition] = useTransition()
  
  return (
    <label className={`flex items-center gap-4 cursor-pointer p-3 hover:bg-gray-50 rounded-2xl transition-colors group ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="relative flex items-center justify-center">
        <input 
          type="checkbox" 
          checked={task.status === 'completed'}
          onChange={(e) => {
            startTransition(() => {
              toggleTask(task.id, e.target.checked)
            })
          }}
          className="appearance-none w-6 h-6 rounded-lg bg-gray-200 border-none peer checked:bg-[#9871F5]" 
        />
        <span className={`absolute text-white font-bold pointer-events-none ${task.status === 'completed' ? 'opacity-100' : 'opacity-0'}`}>✓</span>
      </div>
      <div className="flex-1">
        <span className={`font-bold block transition-colors ${task.status === 'completed' ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-700'}`}>
          {task.title}
        </span>
        <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full inline-block mt-1">
          {task.project || 'Sem projeto'}
        </span>
      </div>
    </label>
  )
}
