import React, { useMemo, useState } from 'react';
import { FoodCategory, FoodItem, Goal, UserProfile } from '../../types';
import { FOOD_DATABASE } from '../../data/foodDatabase';
import { GOAL_LABELS } from '../../utils/nutrition';
import FoodCard from '../ui/FoodCard';
import FloatingDecor from '../ui/FloatingDecor';
import BlobDivider from '../ui/BlobDivider';

interface RecommendationsProps {
  user: UserProfile;
}

const GOALS: Goal[] = ['hipertrofia', 'emagrecimento', 'manutencao'];
const GOAL_SHORT: Record<Goal, string> = { hipertrofia: 'Hipertrofia', emagrecimento: 'Emagrecer', manutencao: 'Manutenção' };

const reasonFor = (food: FoodItem, goal: Goal): string => {
  const proteinDense = food.proteinG >= 15;
  const lowFat = food.fatG <= 3;
  const carbDense = food.carbsG >= 20;
  if (goal === 'emagrecimento') {
    if (proteinDense && lowFat) return 'Alta proteína, baixa gordura — saciedade com poucas calorias';
    if (food.category === 'Vegetal') return 'Baixa caloria e rico em fibras';
    if (food.category === 'Fruta') return 'Doce natural com poucas calorias';
    return 'Boa opção para déficit calórico';
  }
  if (goal === 'hipertrofia') {
    if (proteinDense) return 'Rico em proteína para construção muscular';
    if (carbDense) return 'Carboidrato denso para energia e superávit';
    if (food.category === 'Gordura') return 'Gordura boa, ótima densidade calórica';
    return 'Apoia o ganho de massa';
  }
  if (proteinDense) return 'Boa fonte de proteína';
  if (carbDense) return 'Energia equilibrada';
  return 'Alimento equilibrado para manutenção';
};

const Recommendations: React.FC<RecommendationsProps> = ({ user }) => {
  const [goal, setGoal] = useState<Goal>(user.goal || 'manutencao');

  const grouped = useMemo(() => {
    const recommended = FOOD_DATABASE.filter(f => f.goals?.includes(goal));
    const byCategory: Record<string, FoodItem[]> = {};
    recommended.forEach(f => {
      const cat = (f.category || 'Outro') as FoodCategory;
      (byCategory[cat] ||= []).push(f);
    });
    Object.values(byCategory).forEach(list => list.sort((a, b) => b.proteinG - a.proteinG));
    return byCategory;
  }, [goal]);

  const categories = Object.keys(grouped);

  return (
    <div className="animate-fadeIn">
      <header className="relative -mx-4 sm:-mx-6 bg-signature text-white pt-12 pb-2 px-6 overflow-hidden rounded-b-[44px]">
        <FloatingDecor variant="dark" />
        <div className="relative z-10 pb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Recomendados 🌿</h1>
          <p className="text-sm font-medium text-lime-300/90 mt-1">Alimentos ideais para o objetivo <span className="font-extrabold text-white">{GOAL_LABELS[goal]}</span></p>
          <div className="flex gap-2 mt-6 bg-white/12 p-1.5 rounded-pill backdrop-blur w-max" style={{ borderRadius: 999 }}>
            {GOALS.map(g => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`px-5 py-2.5 rounded-pill text-[11px] font-extrabold uppercase tracking-wider transition press ${goal === g ? 'bg-white text-green-900 shadow-soft' : 'text-white/70 hover:text-white'}`}
                style={{ borderRadius: 999 }}
              >
                {GOAL_SHORT[g]}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0"><BlobDivider color="#F2F8F4" /></div>
      </header>

      <div className="pt-8 space-y-10">
        {categories.map(cat => (
          <section key={cat} className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <div className="w-1.5 h-5 bg-accent-500 rounded-full" />
              <h3 className="text-[12px] font-extrabold text-ink-strong uppercase tracking-[0.2em]">{cat}</h3>
              <span className="text-[10px] font-extrabold text-ink-soft/50 uppercase">{grouped[cat].length} itens</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[cat].map(food => (
                <FoodCard key={food.id} food={food} reason={reasonFor(food, goal)} />
              ))}
            </div>
          </section>
        ))}

        <p className="text-center text-[10px] font-bold text-ink-soft/40 uppercase tracking-widest pt-2">
          Valores por 100g · Monte refeições na aba Hoje
        </p>
      </div>
    </div>
  );
};

export default Recommendations;
