
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { FoodItem, FoodCategory, MealGroup } from '../../types';
import { getFoods, setFoods, getMeals, setMeals } from '../../services/storageService';
import { kcalFromMacros } from '../../utils/nutrition';
import { FOOD_DATABASE } from '../../data/foodDatabase';
import SearchBar from '../ui/SearchBar';
import FoodCard from '../ui/FoodCard';
import PillButton from '../ui/PillButton';
import FloatingDecor from '../ui/FloatingDecor';
import BlobDivider from '../ui/BlobDivider';

const CATEGORIES: (FoodCategory | 'Todos')[] = ['Todos', 'Proteína', 'Carboidrato', 'Fruta', 'Vegetal', 'Gordura', 'Laticínio', 'Bebida', 'Outro'];

interface AddFoodFormProps {
  onAdd: () => void;
  onCancel: () => void;
}

const AddFoodForm: React.FC<AddFoodFormProps> = ({ onAdd, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [registeredFoods, setRegisteredFoods] = useState<FoodItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    fatG: '',
    carbsG: '',
    proteinG: '',
  });

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FoodCategory | 'Todos'>('Todos');
  const [showForm, setShowForm] = useState(false);

  // Lista unificada (base curada + alimentos do usuário), usada no navegador de alimentos.
  const customIds = useMemo(() => new Set(registeredFoods.map(f => String(f.id))), [registeredFoods]);
  const unifiedFoods = useMemo(() => {
    const unified: FoodItem[] = [...registeredFoods];
    FOOD_DATABASE.forEach(base => {
      const exists = unified.some(f => f.name.toLowerCase() === base.name.toLowerCase() && f.brand === base.brand);
      if (!exists) unified.push(base);
    });
    return unified;
  }, [registeredFoods]);

  const filteredFoods = useMemo(() => {
    const q = query.trim().toLowerCase();
    return unifiedFoods.filter(f => {
      const matchQ = !q || f.name.toLowerCase().includes(q) || (f.brand || '').toLowerCase().includes(q);
      const matchC = category === 'Todos' || (f.category || 'Outro') === category;
      return matchQ && matchC;
    });
  }, [unifiedFoods, query, category]);

  const loadData = () => {
    const storedFoods = getFoods();
    setRegisteredFoods(storedFoods);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const calculatedKcal = useMemo(() => {
    const p = Number(formData.proteinG) || 0;
    const c = Number(formData.carbsG) || 0;
    const g = Number(formData.fatG) || 0;
    return kcalFromMacros(p, c, g);
  }, [formData.proteinG, formData.carbsG, formData.fatG]);

  const isFoodInUse = (foodId: string) => {
    const currentMeals: MealGroup[] = getMeals();
    return currentMeals.some(meal => 
      meal.items.some(item => String(item.foodId) === String(foodId))
    );
  };

  const syncHistoryWithUpdatedFood = (updatedFood: FoodItem) => {
    const storedMeals: MealGroup[] = getMeals();
    
    const updatedMeals = storedMeals.map(meal => {
      let mealChanged = false;
      const updatedItems = meal.items.map(item => {
        if (String(item.foodId) === String(updatedFood.id)) {
          mealChanged = true;
          const ratio = item.amountGrams / 100;
          const p = Number(parseFloat((Number(updatedFood.proteinG) * ratio).toFixed(1)));
          const c = Number(parseFloat((Number(updatedFood.carbsG) * ratio).toFixed(1)));
          const g = Number(parseFloat((Number(updatedFood.fatG) * ratio).toFixed(1)));
          const energy = kcalFromMacros(p, c, g);

          return {
            ...item,
            foodName: updatedFood.name,
            protein: p,
            carbs: c,
            fat: g,
            calories: energy
          };
        }
        return item;
      });

      if (mealChanged) {
        const totals = updatedItems.reduce((acc, curr) => ({
          kcal: acc.kcal + curr.calories,
          p: acc.p + curr.protein,
          c: acc.c + curr.carbs,
          f: acc.f + curr.fat
        }), { kcal: 0, p: 0, c: 0, f: 0 });

        return {
          ...meal,
          items: updatedItems,
          totalCalories: Math.round(totals.kcal),
          totalProtein: Number(totals.p.toFixed(1)),
          totalCarbs: Number(totals.c.toFixed(1)),
          totalFat: Number(totals.f.toFixed(1))
        };
      }
      return meal;
    });

    setMeals(updatedMeals);
  };

  const handleEdit = (food: FoodItem) => {
    setEditingId(food.id);
    setShowForm(true);
    setFormData({
      name: food.name,
      brand: food.brand || '',
      proteinG: food.proteinG.toString(),
      carbsG: food.carbsG.toString(),
      fatG: food.fatG.toString(),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (foodId: string) => {
    if (isFoodInUse(foodId)) {
      alert("⚠️ Bloqueado: Este alimento está registrado em seu histórico de refeições. Remova as refeições que o utilizam antes de excluí-lo da biblioteca.");
      return;
    }
    
    if (confirm("Deseja remover permanentemente este alimento da sua biblioteca?")) {
      const storedFoods: FoodItem[] = getFoods();
      const updated = storedFoods.filter(f => String(f.id) !== String(foodId));
      setFoods(updated);
      setRegisteredFoods(updated);
    }
  };

  const downloadTemplate = () => {
    const headers = ["Nome", "Marca", "Proteina", "Carboidrato", "Gordura"];
    const dataRows = registeredFoods.map((f: FoodItem) => [
      `"${f.name.replace(/"/g, '""')}"`,
      `"${(f.brand || '').replace(/"/g, '""')}"`,
      f.proteinG,
      f.carbsG,
      f.fatG
    ]);

    const finalData = dataRows.length > 0 ? dataRows : [
      ["Ex: Frango Grelhado", "Caseiro", "32", "0", "2.5"]
    ];
    
    const csvContent = "\uFEFF" + [headers.join(','), ...finalData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `Vitalis_Biblioteca_${new Date().toISOString().slice(0,10)}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const p = Math.max(0, Number(formData.proteinG) || 0);
    const c = Math.max(0, Number(formData.carbsG) || 0);
    const g = Math.max(0, Number(formData.fatG) || 0);
    const energy = kcalFromMacros(p, c, g);

    const storedFoods: FoodItem[] = getFoods();
    let updatedList: FoodItem[] = [];

    if (editingId) {
      const updatedFood: FoodItem = {
        ...storedFoods.find(f => String(f.id) === String(editingId))!,
        name: formData.name,
        brand: formData.brand,
        proteinG: p,
        carbsG: c,
        fatG: g,
        energyKcal: energy
      };

      updatedList = storedFoods.map(f => String(f.id) === String(editingId) ? updatedFood : f);
      syncHistoryWithUpdatedFood(updatedFood);
      setEditingId(null);
      alert("Alimento atualizado! O histórico e relatórios foram recalculados com sucesso.");
    } else {
      const newFood: FoodItem = {
        id: `FOOD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        name: formData.name,
        brand: formData.brand || 'Personalizado',
        energyKcal: energy,
        fatG: g,
        carbsG: c,
        proteinG: p,
        createdAt: Date.now(),
      };
      updatedList = [newFood, ...storedFoods];
    }

    setFoods(updatedList);
    setRegisteredFoods(updatedList);
    setFormData({ name: '', brand: '', fatG: '', carbsG: '', proteinG: '' });
    
    if (!editingId) {
      onAdd();
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/);
      const newFoods: FoodItem[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Split simples considerando vírgula como delimitador
        // Para suporte a aspas, uma lógica mais complexa seria ideal, mas para este caso o split resolve
        const cols = line.split(',').map(c => c.replace(/^"(.*)"$/, '$1').trim());
        
        if (cols && cols.length >= 4) {
          const name = cols[0];
          const brand = cols[1] || 'Importado';
          const p = Number(parseFloat(cols[2]) || 0);
          const c = Number(parseFloat(cols[3]) || 0);
          const g = Number(parseFloat(cols[4]) || 0);
          
          if (name) {
            newFoods.push({
              id: `IMP-${Date.now()}-${i}`,
              name, 
              brand, 
              proteinG: p, 
              carbsG: c, 
              fatG: g, 
              energyKcal: kcalFromMacros(p, c, g),
              createdAt: Date.now()
            });
          }
        }
      }

      if (newFoods.length > 0) {
        const storedFoods: FoodItem[] = getFoods();
        // Unificar evitando duplicidade de nome e marca
        const updated = [...newFoods, ...storedFoods].filter((v, i, a) => 
          a.findIndex(t => (t.name.toLowerCase() === v.name.toLowerCase() && t.brand.toLowerCase() === v.brand.toLowerCase())) === i
        );
        setFoods(updated);
        setRegisteredFoods(updated);
        alert(`${newFoods.length} novos itens processados e unificados!`);
      }
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const inputClasses = "w-full px-6 py-4 rounded-[22px] bg-surface-soft font-semibold text-ink-strong outline-none placeholder:text-ink-soft/50";
  const labelClasses = "block text-[10px] font-extrabold text-ink-soft mb-1.5 ml-2 uppercase tracking-[0.15em]";

  return (
    <div className="animate-fadeIn">
      {/* HEADER */}
      <header className="relative -mx-4 sm:-mx-6 bg-signature text-white pt-12 pb-2 px-6 overflow-hidden rounded-b-[44px]">
        <FloatingDecor variant="dark" />
        <div className="relative z-10 pb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Alimentos</h1>
          <p className="text-sm font-medium text-lime-300/90 mt-1">Busque na base, filtre por categoria ou cadastre o seu.</p>
          <div className="mt-6">
            <SearchBar value={query} onChange={setQuery} placeholder="Buscar alimento ou marca..." />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0"><BlobDivider color="#F2F8F4" /></div>
      </header>

      <div className="pt-6 space-y-8">
        {/* AÇÕES: cadastrar / importar / exportar */}
        <div className="flex flex-wrap gap-3">
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
          <PillButton variant="accent" onClick={() => { setShowForm(s => !s); setEditingId(null); setFormData({ name: '', brand: '', fatG: '', carbsG: '', proteinG: '' }); }}>
            {showForm ? 'Fechar' : '+ Novo alimento'}
          </PillButton>
          <PillButton variant="outline" onClick={() => fileInputRef.current?.click()}>Importar CSV</PillButton>
          <PillButton variant="outline" onClick={downloadTemplate}>Exportar CSV</PillButton>
        </div>

        {/* FORM (colapsável) */}
        {(showForm || editingId) && (
          <form onSubmit={handleSubmit} className="card-fresh p-7 space-y-6 animate-pop">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-ink-strong italic">{editingId ? 'Editar alimento' : 'Cadastrar alimento'}</h3>
              <span className="text-2xl font-extrabold text-green-700 italic">{calculatedKcal}<span className="text-[10px] not-italic text-ink-soft/40"> kcal/100g</span></span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>Nome do item</label>
                <input type="text" placeholder="Ex: Patinho moído..." className={inputClasses} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className={labelClasses}>Marca ou origem</label>
                <input type="text" placeholder="Ex: Caseiro..." className={inputClasses} value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClasses}>Proteínas (g)</label>
                <input type="number" step="0.1" className={inputClasses} value={formData.proteinG} onChange={e => setFormData({ ...formData, proteinG: e.target.value })} />
              </div>
              <div>
                <label className={labelClasses}>Carbos (g)</label>
                <input type="number" step="0.1" className={inputClasses} value={formData.carbsG} onChange={e => setFormData({ ...formData, carbsG: e.target.value })} />
              </div>
              <div>
                <label className={labelClasses}>Gorduras (g)</label>
                <input type="number" step="0.1" className={inputClasses} value={formData.fatG} onChange={e => setFormData({ ...formData, fatG: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3">
              <PillButton type="submit" variant="primary" fullWidth>{editingId ? 'Salvar alterações' : 'Salvar na base'}</PillButton>
              <PillButton type="button" variant="outline" onClick={() => { setEditingId(null); setShowForm(false); setFormData({ name: '', brand: '', fatG: '', carbsG: '', proteinG: '' }); }}>Cancelar</PillButton>
            </div>
          </form>
        )}

        {/* ABAS DE CATEGORIA */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-1 px-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-pill text-[11px] font-extrabold uppercase tracking-wider transition press ${category === cat ? 'bg-green-700 text-white shadow-soft' : 'bg-white text-ink-soft hover:text-green-700'}`}
              style={{ borderRadius: 999 }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID DE ALIMENTOS */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-extrabold text-ink-strong italic">{filteredFoods.length} alimentos</h3>
        </div>

        {filteredFoods.length === 0 ? (
          <div className="card-fresh p-10 flex flex-col items-center text-center gap-3">
            <span className="text-5xl">🔍</span>
            <p className="font-extrabold text-ink-strong">Nada encontrado</p>
            <p className="text-[12px] text-ink-soft font-medium">Tente outra busca ou cadastre um novo alimento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFoods.map(food => {
              const isCustom = customIds.has(String(food.id));
              return (
                <FoodCard
                  key={food.id}
                  food={food}
                  onEdit={isCustom ? () => handleEdit(food) : undefined}
                  onDelete={isCustom ? () => handleDelete(food.id) : undefined}
                  locked={isCustom ? isFoodInUse(food.id) : undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

};

export default AddFoodForm;
