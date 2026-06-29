import React from 'react';
import { MealGroup } from '../../types';
import CapsuleImage from './CapsuleImage';

interface MealCardProps {
  meal: MealGroup;
  onClick?: () => void;
}

/** Card de refeição: ícone em cápsula + nome + macros + calorias (acento). */
const MealCard: React.FC<MealCardProps> = ({ meal, onClick }) => (
  <button
    onClick={onClick}
    className="card-fresh press p-6 flex flex-col gap-5 text-left w-full animate-fadeInUp"
  >
    <div className="flex items-center gap-4">
      <CapsuleImage emoji={meal.icon || '🥗'} size={52} shape="capsule" />
      <div className="flex-1 min-w-0">
        <h4 className="font-extrabold text-ink-strong italic text-lg truncate">{meal.name}</h4>
        <p className="text-[9px] font-semibold text-ink-soft uppercase tracking-wider">{meal.items.length} itens</p>
      </div>
    </div>
    <div className="flex items-end justify-between border-t border-green-500/8 pt-4">
      <div className="flex gap-2.5 text-[9px] font-extrabold uppercase">
        <span className="text-green-700">P {meal.totalProtein}g</span>
        <span className="text-green-500">C {meal.totalCarbs}g</span>
        <span className="text-accent-500">G {meal.totalFat}g</span>
      </div>
      <span className="text-2xl font-extrabold italic text-ink-strong whitespace-nowrap">
        {meal.totalCalories}<span className="text-[9px] not-italic text-ink-soft/40"> kcal</span>
      </span>
    </div>
  </button>
);

export default MealCard;
