import { FoodItem, Goal } from './types';
import { FOOD_DATABASE } from './foods';

/** Motivo curto da indicação de um alimento conforme o objetivo. */
export const reasonFor = (food: FoodItem, goal: Goal): string => {
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

/** Alimentos recomendados para um objetivo, agrupados por categoria (ordenados por proteína). */
export const recommendedByCategory = (goal: Goal): Record<string, FoodItem[]> => {
  const recommended = FOOD_DATABASE.filter(f => f.goals?.includes(goal));
  const byCategory: Record<string, FoodItem[]> = {};
  recommended.forEach(f => {
    const cat = f.category || 'Outro';
    (byCategory[cat] ||= []).push(f);
  });
  Object.values(byCategory).forEach(list => list.sort((a, b) => b.proteinG - a.proteinG));
  return byCategory;
};
