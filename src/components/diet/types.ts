export interface PlannedItemRow {
  id: string;
  foodId: string | null;
  name: string;
  quantityG: number;
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
}

export interface PlannedMealRow {
  id: string;
  type: string;
  name: string;
  order: number;
  items: PlannedItemRow[];
}

export interface PlannedDayRow {
  id: string;
  weekday: number;
  meals: PlannedMealRow[];
}

export interface DietPlanRow {
  id: string;
  name: string;
  status: string;
  generatedBy: string;
  goalId: string | null;
  startDate: Date;
  endDate: Date | null;
  rotation: string;
  kcalTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  days: PlannedDayRow[];
}

export interface DietProfileRow {
  goal: string;
  sex: string;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: string;
  style: string;
  restrictions: string | null;
  mealsPerDay: number;
  preferred: string | null;
  disliked: string | null;
  available: string | null;
  kcalTarget: number | null;
  proteinTarget: number | null;
  carbTarget: number | null;
  fatTarget: number | null;
}

export interface NutritionGoalOption {
  id: string;
  title: string;
  deadline: string | null;
}

export const WEEKDAY_LABEL = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
export const MEAL_TYPE_LABEL: Record<string, string> = {
  cafe: 'Café da manhã',
  lanche_manha: 'Lanche da manhã',
  almoco: 'Almoço',
  lanche: 'Lanche da tarde',
  jantar: 'Jantar',
  ceia: 'Ceia',
};
