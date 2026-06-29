// Tipos de nutrição (portados do Vitalis, adaptados ao LifeOS).

export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'hipertrofia' | 'emagrecimento' | 'manutencao';

export type FoodCategory =
  | 'Proteína'
  | 'Carboidrato'
  | 'Gordura'
  | 'Vegetal'
  | 'Fruta'
  | 'Laticínio'
  | 'Bebida'
  | 'Outro';

export interface MacroTargets {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  energyKcal: number; // por 100g
  fatG: number;
  carbsG: number;
  proteinG: number;
  category?: FoodCategory;
  goals?: Goal[];
  createdAt?: number;
  isCustom?: boolean;
}

// Subconjunto do User do LifeOS necessário para os cálculos.
export interface NutritionProfile {
  sex?: Sex | string | null;
  age?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  activityLevel?: ActivityLevel | string | null;
  goal?: Goal | string | null;
}
