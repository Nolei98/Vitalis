import React, { useState, useEffect, useMemo } from 'react';
import { FoodItem, MealGroup, MealItem, UserProfile, MacroTargets } from '../../types';
import { FOOD_DATABASE } from '../../data/foodDatabase';
import { getSuggestionsForGoal, Suggestion } from '../../data/suggestions';
import { getFoods, getMeals, setMeals as persistMeals } from '../../services/storageService';
import { scheduleSync } from '../../services/syncService';
import { kcalFromMacros, computeTargets } from '../../utils/nutrition';
import { analyzeMeal } from '../../services/geminiService';
import { foodEmoji } from '../../utils/foodEmoji';
import ProgressRing from '../ui/ProgressRing';
import StatPill from '../ui/StatPill';
import FAB from '../ui/FAB';
import PillButton from '../ui/PillButton';
import MealCard from '../ui/MealCard';
import CapsuleImage from '../ui/CapsuleImage';
import FloatingDecor from '../ui/FloatingDecor';
import BlobDivider from '../ui/BlobDivider';

const MEAL_ICONS = ['🍳', '🥗', '🍱', '🍕', '🍏', '🥪', '🍜', '🍗', '🥛', '☕', '🍛', '🍤'];
const DEFAULT_TARGETS: MacroTargets = { kcal: 2000, protein: 150, carbs: 250, fat: 70 };
const WATER_STEP = 250;

const todayKey = () => {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
};

interface DashboardProps {
  user: UserProfile;
  onUserChange: (u: UserProfile) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onUserChange }) => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [meals, setMeals] = useState<MealGroup[]>([]);

  const targets = user.targets || DEFAULT_TARGETS;
  const firstName = (user.name || 'Atleta').split(' ')[0];

  // ===== Hidratação =====
  const waterTarget = user.weightKg ? Math.round(user.weightKg * 35) : 2000;
  const waterStorageKey = `nutriflow_water_${user.email}_${todayKey()}`;
  const [waterMl, setWaterMl] = useState(0);

  useEffect(() => {
    setWaterMl(Number(localStorage.getItem(waterStorageKey) || 0));
  }, [waterStorageKey]);

  const addWater = (delta: number) => {
    const next = Math.max(0, waterMl + delta);
    setWaterMl(next);
    localStorage.setItem(waterStorageKey, String(next));
    scheduleSync();
  };

  const dynamicSuggestions = useMemo(() => {
    const suggestions: Suggestion[] = [...getSuggestionsForGoal(user.goal)];
    meals.slice(0, 5).forEach(meal => {
      const histId = `HIST-${meal.id}`;
      if (!suggestions.some(s => s.id === histId)) {
        suggestions.push({
          id: histId,
          title: meal.name,
          energyKcal: meal.totalCalories,
          items: meal.items.map(i => ({ foodName: i.foodName, defaultGrams: i.amountGrams })),
        });
      }
    });
    return suggestions;
  }, [meals, user.goal]);

  const [groupName, setGroupName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🥗');
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [grams, setGrams] = useState<number>(100);
  const [currentGroupItems, setCurrentGroupItems] = useState<MealItem[]>([]);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempTargets, setTempTargets] = useState<MacroTargets>(targets);

  // IA
  const [mealDescription, setMealDescription] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiError, setAiError] = useState('');

  const loadUnifiedFoodDatabase = () => {
    const customFoods = getFoods();
    const unified: FoodItem[] = [...customFoods];
    FOOD_DATABASE.forEach((base: FoodItem) => {
      const exists = unified.some(
        f => String(f.id) === String(base.id) || (f.name.toLowerCase() === base.name.toLowerCase() && f.brand === base.brand)
      );
      if (!exists) unified.push(base);
    });
    setFoods(unified);
  };

  useEffect(() => {
    loadUnifiedFoodDatabase();
    setMeals(getMeals());
  }, []);

  useEffect(() => {
    setTempTargets(user.targets || DEFAULT_TARGETS);
  }, [user.targets]);

  const addToGroup = () => {
    const validGrams = Math.max(1, grams);
    if (!selectedFoodId || validGrams <= 0) return;
    const food = foods.find(f => String(f.id) === String(selectedFoodId));
    if (!food) return;

    const ratio = validGrams / 100;
    const p = Number(parseFloat((Number(food.proteinG || 0) * ratio).toFixed(1)));
    const c = Number(parseFloat((Number(food.carbsG || 0) * ratio).toFixed(1)));
    const g = Number(parseFloat((Number(food.fatG || 0) * ratio).toFixed(1)));

    const newItem: MealItem = {
      id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      foodId: food.id,
      foodName: food.name,
      amountGrams: validGrams,
      calories: kcalFromMacros(p, c, g),
      protein: p,
      carbs: c,
      fat: g,
    };

    setCurrentGroupItems([...currentGroupItems, newItem]);
    setSelectedFoodId('');
    setGrams(100);
  };

  const analyzeWithAI = async () => {
    if (!mealDescription.trim()) return;
    setAiLoading(true);
    setAiError('');
    setAiAdvice('');
    const result = await analyzeMeal(mealDescription.trim());
    setAiLoading(false);
    if (!result) {
      setAiError('Não foi possível analisar (verifique a chave Gemini em .env.local).');
      return;
    }
    const p = Number(result.proteinG) || 0;
    const c = Number(result.carbsG) || 0;
    const g = Number(result.fatG) || 0;
    const aiItem: MealItem = {
      id: `AI-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      foodId: 'ai',
      foodName: `${result.name} (estimativa IA)`,
      amountGrams: 0,
      calories: Math.round(Number(result.energyKcal) || kcalFromMacros(p, c, g)),
      protein: p,
      carbs: c,
      fat: g,
    };
    if (!groupName) setGroupName(result.name);
    setSelectedIcon('🤖');
    setCurrentGroupItems(prev => [...prev, aiItem]);
    if (result.advice) setAiAdvice(result.advice);
    setMealDescription('');
  };

  const removeItemFromPending = (id: string) => {
    setCurrentGroupItems(currentGroupItems.filter(item => item.id !== id));
  };

  const saveGroup = () => {
    if (currentGroupItems.length === 0) return;
    const totals = currentGroupItems.reduce(
      (acc, item) => ({ kcal: acc.kcal + item.calories, p: acc.p + item.protein, c: acc.c + item.carbs, f: acc.f + item.fat }),
      { kcal: 0, p: 0, c: 0, f: 0 }
    );
    const newGroup: MealGroup = {
      id: `REF-${Date.now()}`,
      name: groupName || `Refeição ${meals.length + 1}`,
      icon: selectedIcon,
      items: currentGroupItems,
      totalCalories: Math.round(totals.kcal),
      totalProtein: Number(totals.p.toFixed(1)),
      totalCarbs: Number(totals.c.toFixed(1)),
      totalFat: Number(totals.f.toFixed(1)),
      timestamp: Date.now(),
    };
    const updatedMeals = [newGroup, ...meals];
    setMeals(updatedMeals);
    persistMeals(updatedMeals);
    setCurrentGroupItems([]);
    setGroupName('');
    setSelectedIcon('🥗');
    setAiAdvice('');
  };

  const clearTodayHistory = () => {
    if (!confirm('⚠️ Reiniciar Fluxo Diário?\nIsso apagará todos os seus registros de hoje permanentemente.')) return;
    const now = new Date();
    const allMeals = getMeals();
    const updated = allMeals.filter(m => {
      const d = new Date(m.timestamp);
      return !(d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate());
    });
    persistMeals(updated);
    setMeals(updated);
  };

  const quickAddSuggestion = (suggestion: Suggestion) => {
    setGroupName(suggestion.title);
    setSelectedIcon('🍱');
    const newItems: MealItem[] = suggestion.items.map(sItem => {
      const food = foods.find(f => f.name === sItem.foodName) || FOOD_DATABASE.find(f => f.name === sItem.foodName);
      const ratio = sItem.defaultGrams / 100;
      const p = food ? Number(parseFloat((Number(food.proteinG || 0) * ratio).toFixed(1))) : 0;
      const c = food ? Number(parseFloat((Number(food.carbsG || 0) * ratio).toFixed(1))) : 0;
      const g = food ? Number(parseFloat((Number(food.fatG || 0) * ratio).toFixed(1))) : 0;
      return {
        id: `S-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        foodId: food?.id || 'manual',
        foodName: sItem.foodName,
        amountGrams: sItem.defaultGrams,
        calories: kcalFromMacros(p, c, g),
        protein: p,
        carbs: c,
        fat: g,
      };
    });
    setCurrentGroupItems(newItems);
    document.getElementById('meal-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const todayMeals = useMemo(() => {
    const now = new Date();
    return meals.filter(m => {
      const d = new Date(m.timestamp);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    });
  }, [meals]);

  const todayTotals = useMemo(() => {
    return todayMeals.reduce(
      (acc, m) => ({ kcal: acc.kcal + m.totalCalories, p: acc.p + m.totalProtein, c: acc.c + m.totalCarbs, f: acc.f + m.totalFat }),
      { kcal: 0, p: 0, c: 0, f: 0 }
    );
  }, [todayMeals]);

  const kcalPct = Math.min(100, (todayTotals.kcal / (targets.kcal || 1)) * 100);
  const waterPct = Math.min(100, (waterMl / (waterTarget || 1)) * 100);

  const statusText = useMemo(() => {
    const pct = (todayTotals.kcal / (targets.kcal || 1)) * 100;
    if (pct === 0) return 'Bora começar o dia 🌱';
    if (pct < 85) return 'Abastecendo o fluxo...';
    if (pct <= 100) return 'Alta performance! 🌿';
    if (pct <= 110) return 'Meta atingida 🏆';
    return 'Combustível completo 🛑';
  }, [todayTotals.kcal, targets.kcal]);

  const recalcTargets = () => {
    const auto = computeTargets(user);
    if (auto) setTempTargets(auto);
    else alert('Preencha seu perfil físico (Perfil → Editar) para calcular automaticamente.');
  };

  const saveTargets = () => {
    onUserChange({ ...user, targets: tempTargets });
    setShowGoalModal(false);
  };

  const dateLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const inputBase = 'w-full px-6 py-4 rounded-[22px] bg-surface-soft font-semibold text-ink-strong outline-none';

  return (
    <div className="animate-fadeIn">
      {/* ===== HEADER IMERSIVO ===== */}
      <header className="relative -mx-4 sm:-mx-6 bg-signature text-white pt-12 pb-2 px-6 overflow-hidden rounded-b-[44px]">
        <FloatingDecor variant="dark" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-lime-300/80 capitalize">{dateLabel}</p>
              <h1 className="text-3xl font-extrabold tracking-tight mt-1">Olá, {firstName} 👋</h1>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              aria-label="Configurar metas"
              className="w-12 h-12 rounded-pill bg-white/15 backdrop-blur flex items-center justify-center hover:bg-white/25 transition press"
              style={{ borderRadius: 999 }}
            >
              ⚙️
            </button>
          </div>

          <div className="flex flex-col items-center pb-8">
            <ProgressRing value={kcalPct} size={210} stroke={16}>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-lime-300/80">Calorias</span>
              <span className="text-6xl font-extrabold italic leading-none mt-1">{todayTotals.kcal}</span>
              <span className="text-[11px] font-semibold text-white/60 mt-1">de {targets.kcal} kcal</span>
            </ProgressRing>
            <p className="mt-5 text-sm font-bold italic text-lime-300">{statusText}</p>

            <div className="flex gap-3 mt-6">
              <StatPill value={`${todayTotals.p.toFixed(0)}g`} label="Proteína" color="#2D6A4F" />
              <StatPill value={`${todayTotals.c.toFixed(0)}g`} label="Carbo" color="#40916C" />
              <StatPill value={`${todayTotals.f.toFixed(0)}g`} label="Gordura" color="#FB8500" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <BlobDivider color="#F2F8F4" />
        </div>
      </header>

      <div className="space-y-10 pt-8">
        {/* ===== HIDRATAÇÃO ===== */}
        <section className="card-fresh p-6 flex items-center gap-6">
          <ProgressRing value={waterPct} size={92} stroke={9}>
            <span className="text-lg font-extrabold text-green-700 leading-none">{(waterMl / 1000).toFixed(1)}</span>
            <span className="text-[8px] font-bold uppercase text-ink-soft">litros</span>
          </ProgressRing>
          <div className="flex-1">
            <h3 className="font-extrabold text-ink-strong">Hidratação 💧</h3>
            <p className="text-[12px] font-medium text-ink-soft">Meta: {(waterTarget / 1000).toFixed(1)} L · faltam {Math.max(0, waterTarget - waterMl)} ml</p>
            <div className="flex gap-2 mt-3">
              {waterMl > 0 && (
                <button onClick={() => addWater(-WATER_STEP)} aria-label="Remover 250ml" className="px-4 py-2 rounded-pill bg-surface-soft text-ink-soft text-xs font-bold press" style={{ borderRadius: 999 }}>−250</button>
              )}
            </div>
          </div>
          <FAB label="Adicionar 250ml de água" size={52} onClick={() => addWater(WATER_STEP)}>
            <span className="text-[10px] font-extrabold">+250</span>
          </FAB>
        </section>

        {/* ===== SUGESTÕES ===== */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="w-1.5 h-5 bg-accent-500 rounded-full" />
            <h3 className="text-[12px] font-extrabold text-ink-strong uppercase tracking-[0.2em]">Sugestões para você</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 px-1 custom-scrollbar snap-x">
            {dynamicSuggestions.map(sugg => (
              <button
                key={sugg.id}
                onClick={() => quickAddSuggestion(sugg)}
                className="flex-shrink-0 w-64 p-5 card-fresh press flex items-center gap-4 snap-start text-left"
              >
                <CapsuleImage emoji={sugg.id.startsWith('HIST') ? '🔄' : '🍱'} size={48} />
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-extrabold text-ink-strong italic truncate leading-tight">{sugg.title}</h5>
                  <span className="text-[10px] font-bold text-accent-500 uppercase tracking-wider">
                    {sugg.id.startsWith('HIST') ? 'Do seu histórico' : `${sugg.energyKcal} kcal`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ===== CONSTRUTOR DE REFEIÇÃO ===== */}
        <section id="meal-builder" className="card-fresh p-7 space-y-6">
          <h2 className="text-2xl font-extrabold text-ink-strong italic tracking-tight">Preparar refeição</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-extrabold text-ink-soft uppercase ml-2 tracking-[0.15em]">Identificação</label>
              <input type="text" placeholder="Ex: Almoço..." className={`${inputBase} mt-1.5`} value={groupName} onChange={e => setGroupName(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-ink-soft uppercase tracking-[0.15em] block text-center">Ícone</label>
              <div className="flex bg-surface-soft p-2 rounded-[22px] gap-1.5 overflow-x-auto max-w-[230px] mt-1.5 custom-scrollbar">
                {MEAL_ICONS.map(ic => (
                  <button key={ic} onClick={() => setSelectedIcon(ic)} className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-xl press ${selectedIcon === ic ? 'bg-green-700 shadow-soft' : 'opacity-40'}`}>{ic}</button>
                ))}
              </div>
            </div>
          </div>

          {/* IA */}
          <div className="bg-accent-500/8 p-6 rounded-[26px] border border-accent-500/15 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <label className="text-[11px] font-extrabold text-ink-strong uppercase tracking-[0.15em]">Descrever refeição (IA)</label>
            </div>
            <textarea
              rows={2}
              placeholder="Ex: 2 ovos fritos, uma fatia de pão integral e um café..."
              className={`${inputBase} bg-white resize-none`}
              value={mealDescription}
              onChange={e => setMealDescription(e.target.value)}
            />
            <div className="flex items-center gap-3 flex-wrap">
              <PillButton variant="primary" onClick={analyzeWithAI} disabled={aiLoading || !mealDescription.trim()}>
                {aiLoading ? 'Analisando...' : 'Estimar macros'}
              </PillButton>
              {aiError && <span className="text-[11px] font-bold text-red-500">{aiError}</span>}
            </div>
            {aiAdvice && <p className="text-[12px] font-medium text-green-700 italic bg-white/70 rounded-2xl px-4 py-2.5">💡 {aiAdvice}</p>}
          </div>

          {/* Seleção manual */}
          <div className="flex flex-col sm:flex-row gap-3 items-end bg-surface-soft p-5 rounded-[26px]">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-extrabold text-ink-soft uppercase ml-2 tracking-wider">Escolher alimento</label>
              <select value={selectedFoodId} onChange={e => setSelectedFoodId(e.target.value)} className={`${inputBase} bg-white mt-1.5`}>
                <option value="">Selecione...</option>
                {foods.map(f => <option key={f.id} value={f.id}>{f.name} {f.brand ? `(${f.brand})` : ''}</option>)}
              </select>
            </div>
            <div className="w-full sm:w-28">
              <label className="text-[10px] font-extrabold text-ink-soft uppercase tracking-wider block text-center">Qtd (g/ml)</label>
              <input type="number" min="1" value={grams} onChange={e => setGrams(Math.max(1, Number(e.target.value)))} className={`${inputBase} bg-white text-center mt-1.5`} />
            </div>
            <FAB label="Adicionar alimento à refeição" size={56} onClick={addToGroup} />
          </div>

          {currentGroupItems.length > 0 && (
            <div className="bg-green-900 rounded-[30px] p-6 space-y-5 text-white animate-pop">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-extrabold italic">{groupName || 'Nova refeição'}</h3>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-lime-300 uppercase tracking-widest">Total</p>
                  <p className="text-2xl font-extrabold italic">{currentGroupItems.reduce((a, i) => a + i.calories, 0)} kcal</p>
                </div>
              </div>
              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                {currentGroupItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-white/8 p-4 rounded-[20px]">
                    <div className="flex-1 min-w-0">
                      <span className="font-extrabold block italic truncate">{item.foodName}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-white/70">
                        {item.amountGrams > 0 ? `${item.amountGrams}g · ` : ''}P{item.protein} C{item.carbs} G{item.fat}
                      </span>
                    </div>
                    <button onClick={() => removeItemFromPending(item.id)} aria-label="Remover item" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-500/30 text-white/50 hover:text-white transition press">✕</button>
                  </div>
                ))}
              </div>
              <PillButton variant="accent" fullWidth onClick={saveGroup}>Registrar no diário</PillButton>
            </div>
          )}
        </section>

        {/* ===== REFEIÇÕES DE HOJE ===== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-extrabold text-ink-strong italic">Refeições de hoje</h3>
            {todayMeals.length > 0 && (
              <button onClick={clearTodayHistory} className="px-4 py-2 rounded-pill bg-white text-red-500 text-[10px] font-extrabold uppercase tracking-wider shadow-soft press" style={{ borderRadius: 999 }}>Reiniciar</button>
            )}
          </div>

          {todayMeals.length === 0 ? (
            <div className="card-fresh p-10 flex flex-col items-center text-center gap-3">
              <CapsuleImage emoji="🍽️" size={72} />
              <p className="font-extrabold text-ink-strong">Nenhuma refeição ainda hoje</p>
              <p className="text-[12px] text-ink-soft font-medium max-w-xs">Use as sugestões acima ou o construtor para registrar sua primeira refeição do dia.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {todayMeals.map(meal => <MealCard key={meal.id} meal={meal} />)}
            </div>
          )}
        </section>
      </div>

      {/* ===== MODAL METAS ===== */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-green-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6" onClick={() => setShowGoalModal(false)}>
          <div className="bg-white rounded-[36px] p-8 max-w-md w-full shadow-2xl space-y-6 animate-pop" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="text-2xl font-extrabold text-ink-strong italic tracking-tight">Configurar metas</h3>
              <p className="text-[11px] font-semibold text-ink-soft mt-1">Calculadas pelo seu perfil — ajuste se quiser.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{ k: 'kcal', l: 'Calorias' }, { k: 'protein', l: 'Proteínas (g)' }, { k: 'carbs', l: 'Carbos (g)' }, { k: 'fat', l: 'Gorduras (g)' }].map(item => (
                <div key={item.k}>
                  <label className="text-[10px] font-extrabold uppercase text-ink-soft ml-2 tracking-wider">{item.l}</label>
                  <input type="number" value={(tempTargets as any)[item.k]} onChange={e => setTempTargets({ ...tempTargets, [item.k]: Number(e.target.value) })} className={`${inputBase} mt-1.5`} />
                </div>
              ))}
            </div>
            <PillButton variant="soft" fullWidth onClick={recalcTargets}>↻ Recalcular pelo perfil</PillButton>
            <PillButton variant="primary" fullWidth onClick={saveTargets}>Salvar metas</PillButton>
            <button onClick={() => setShowGoalModal(false)} className="w-full py-1 text-ink-soft/50 font-extrabold uppercase tracking-widest text-[10px]">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
