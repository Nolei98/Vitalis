import { Goal } from '../types';

export interface SuggestionItem {
  foodName: string;
  defaultGrams: number;
}

export interface Suggestion {
  id: string;
  title: string;
  items: SuggestionItem[];
  energyKcal?: number;
  goal?: Goal;
}

// Refeições-modelo segmentadas por objetivo. Os nomes batem com a base em foodDatabase.ts.
export const SUGGESTIONS_BY_GOAL: Record<Goal, Suggestion[]> = {
  hipertrofia: [
    {
      id: 'h1', title: 'Café Reforçado', goal: 'hipertrofia', energyKcal: 620,
      items: [
        { foodName: 'Aveia em Flocos', defaultGrams: 60 },
        { foodName: 'Banana Nanica', defaultGrams: 100 },
        { foodName: 'Pasta de Amendoim Integral', defaultGrams: 20 },
        { foodName: 'Whey Protein (concentrado)', defaultGrams: 30 },
      ],
    },
    {
      id: 'h2', title: 'Almoço Bulking', goal: 'hipertrofia', energyKcal: 720,
      items: [
        { foodName: 'Arroz Branco Cozido', defaultGrams: 200 },
        { foodName: 'Feijão Carioca Cozido', defaultGrams: 120 },
        { foodName: 'Patinho Moído', defaultGrams: 150 },
      ],
    },
    {
      id: 'h3', title: 'Pós-treino', goal: 'hipertrofia', energyKcal: 480,
      items: [
        { foodName: 'Batata Doce Cozida', defaultGrams: 200 },
        { foodName: 'Filé de Frango Grelhado', defaultGrams: 150 },
      ],
    },
  ],
  emagrecimento: [
    {
      id: 'e1', title: 'Café Leve', goal: 'emagrecimento', energyKcal: 230,
      items: [
        { foodName: 'Ovo Cozido', defaultGrams: 100 },
        { foodName: 'Mamão Papaia', defaultGrams: 150 },
      ],
    },
    {
      id: 'e2', title: 'Almoço Cutting', goal: 'emagrecimento', energyKcal: 360,
      items: [
        { foodName: 'Tilápia Grelhada', defaultGrams: 150 },
        { foodName: 'Arroz Integral Cozido', defaultGrams: 100 },
        { foodName: 'Brócolis Cozido', defaultGrams: 100 },
      ],
    },
    {
      id: 'e3', title: 'Jantar Proteico', goal: 'emagrecimento', energyKcal: 250,
      items: [
        { foodName: 'Peito de Frango Cozido', defaultGrams: 120 },
        { foodName: 'Alface', defaultGrams: 50 },
        { foodName: 'Tomate', defaultGrams: 80 },
      ],
    },
  ],
  manutencao: [
    {
      id: 'm1', title: 'Café da Manhã Equilibrado', goal: 'manutencao', energyKcal: 385,
      items: [
        { foodName: 'Pão Integral', defaultGrams: 50 },
        { foodName: 'Ovo Frito', defaultGrams: 50 },
        { foodName: 'Leite Integral', defaultGrams: 200 },
      ],
    },
    {
      id: 'm2', title: 'Almoço Clássico', goal: 'manutencao', energyKcal: 460,
      items: [
        { foodName: 'Arroz Branco Cozido', defaultGrams: 150 },
        { foodName: 'Feijão Carioca Cozido', defaultGrams: 100 },
        { foodName: 'Filé de Frango Grelhado', defaultGrams: 120 },
      ],
    },
    {
      id: 'm3', title: 'Lanche da Tarde', goal: 'manutencao', energyKcal: 210,
      items: [
        { foodName: 'Banana Nanica', defaultGrams: 100 },
        { foodName: 'Iogurte Grego', defaultGrams: 150 },
      ],
    },
  ],
};

export const getSuggestionsForGoal = (goal?: Goal): Suggestion[] =>
  SUGGESTIONS_BY_GOAL[goal || 'manutencao'];
