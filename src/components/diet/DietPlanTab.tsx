'use client';

import ProfileWizard from './ProfileWizard';
import PlanView from './PlanView';
import type { DietPlanRow, DietProfileRow, NutritionGoalOption } from './types';

export default function DietPlanTab({
  dietProfile,
  dietPlan,
  nutritionGoals,
}: {
  dietProfile: DietProfileRow | null;
  dietPlan: DietPlanRow | null;
  nutritionGoals: NutritionGoalOption[];
}) {
  if (!dietPlan) {
    return <ProfileWizard nutritionGoals={nutritionGoals} />;
  }
  return <PlanView plan={dietPlan} mealsPerDay={dietProfile?.mealsPerDay ?? 4} />;
}
