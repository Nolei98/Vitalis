import React from 'react';
import { FoodItem } from '../../types';
import { foodEmoji } from '../../utils/foodEmoji';
import CapsuleImage from './CapsuleImage';
import FAB from './FAB';

interface FoodCardProps {
  food: FoodItem;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  locked?: boolean; // alimento em uso: exclusão bloqueada
  reason?: string;
}

/** Card de alimento: avatar circular + nome + macros + badge de kcal + ações. */
const FoodCard: React.FC<FoodCardProps> = ({ food, onAdd, onEdit, onDelete, locked, reason }) => (
  <div className="card-fresh p-5 flex flex-col gap-3 animate-fadeInUp">
    <div className="flex items-center gap-4">
      <CapsuleImage emoji={foodEmoji(food.name, food.category)} size={56} />
      <div className="flex-1 min-w-0">
        <h4 className="font-extrabold text-ink-strong leading-tight truncate">{food.name}</h4>
        <p className="text-[9px] font-semibold text-ink-soft uppercase tracking-wider truncate">{food.brand}</p>
      </div>
      <span className="px-3 py-1.5 rounded-pill bg-accent-500/12 text-accent-500 text-[11px] font-extrabold whitespace-nowrap" style={{ borderRadius: 999 }}>
        {food.energyKcal} kcal
      </span>
    </div>

    <div className="flex gap-2 text-[8px] font-extrabold uppercase">
      <span className="bg-green-500/10 px-2.5 py-1 rounded-pill text-green-700" style={{ borderRadius: 999 }}>{food.proteinG}g P</span>
      <span className="bg-lime-400/15 px-2.5 py-1 rounded-pill text-green-700" style={{ borderRadius: 999 }}>{food.carbsG}g C</span>
      <span className="bg-accent-400/15 px-2.5 py-1 rounded-pill text-accent-500" style={{ borderRadius: 999 }}>{food.fatG}g G</span>
    </div>

    {reason && <p className="text-[11px] font-medium text-ink-soft italic border-t border-green-500/8 pt-2.5">{reason}</p>}

    {(onAdd || onEdit || onDelete) && (
      <div className="flex items-center justify-end gap-2 pt-1">
        {onEdit && (
          <button onClick={onEdit} aria-label={`Editar ${food.name}`} className="w-9 h-9 flex items-center justify-center rounded-full bg-green-500/8 text-green-700 hover:bg-green-700 hover:text-white transition press">✎</button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            aria-label={`Excluir ${food.name}`}
            disabled={locked}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition press ${locked ? 'bg-gray-100 text-gray-300' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'}`}
          >
            {locked ? '🔒' : '✕'}
          </button>
        )}
        {onAdd && <FAB label={`Adicionar ${food.name}`} size={40} onClick={onAdd} />}
      </div>
    )}
  </div>
);

export default FoodCard;
