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
  goals?: Goal[]; // objetivos para os quais o alimento é indicado
  createdAt: number;
}

export interface MealItem {
  id: string;
  foodId: string;
  foodName: string;
  amountGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealGroup {
  id: string;
  name: string; // ex.: "Café da manhã"
  icon?: string;
  items: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  email: string;
  passwordHash?: string;
  // Dados físicos para cálculo de TMB/GET
  sex?: Sex;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  activityLevel?: ActivityLevel;
  goal?: Goal;
  // Metas calculadas automaticamente (editáveis manualmente)
  targets?: MacroTargets;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export type AppView =
  | 'login'
  | 'register'
  | 'onboarding'
  | 'dashboard'
  | 'add-food'
  | 'recommendations'
  | 'profile';
