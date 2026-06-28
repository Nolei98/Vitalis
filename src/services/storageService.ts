import { FoodItem, MealGroup } from '../types';
import { getCurrentUser } from './authService';
import { scheduleSync } from './syncService';

// Dados separados por usuário: nutriflow_foods_<email> / nutriflow_meals_<email>.
// Mantém um fallback global para o caso (raro) de não haver sessão ativa.

function userSuffix(): string {
  const user = getCurrentUser();
  return user?.email ? `_${user.email}` : '';
}

const foodsKey = () => `nutriflow_foods${userSuffix()}`;
const mealsKey = () => `nutriflow_meals${userSuffix()}`;

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export function getFoods(): FoodItem[] {
  return read<FoodItem>(foodsKey());
}

export function setFoods(foods: FoodItem[]): void {
  localStorage.setItem(foodsKey(), JSON.stringify(foods));
  scheduleSync();
}

export function getMeals(): MealGroup[] {
  return read<MealGroup>(mealsKey());
}

export function setMeals(meals: MealGroup[]): void {
  localStorage.setItem(mealsKey(), JSON.stringify(meals));
  scheduleSync();
}
