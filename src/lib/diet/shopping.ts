export interface ShoppingItem {
  name: string;
  quantityG: number;
  category: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Hortifrúti': ['alface', 'tomate', 'cenoura', 'brócolis', 'brocolis', 'batata', 'cebola', 'banana', 'maçã', 'maca', 'laranja', 'mamão', 'mamao', 'abobrinha', 'couve', 'espinafre', 'pepino', 'limão', 'limao', 'morango', 'uva', 'manga', 'abacate'],
  'Proteínas': ['frango', 'carne', 'peixe', 'ovo', 'ovos', 'tilápia', 'tilapia', 'salmão', 'salmao', 'atum', 'tofu', 'peito', 'patinho', 'alcatra', 'linguiça', 'linguica'],
  'Laticínios': ['leite', 'queijo', 'iogurte', 'requeijão', 'requeijao', 'manteiga', 'whey'],
  'Grãos & Mercearia': ['arroz', 'feijão', 'feijao', 'macarrão', 'macarrao', 'aveia', 'pão', 'pao', 'farinha', 'quinoa', 'lentilha', 'grão-de-bico', 'grao-de-bico', 'granola', 'azeite', 'óleo', 'oleo'],
};

function categorize(name: string): string {
  const lower = name.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return category;
  }
  return 'Outros';
}

/** Agrega itens planejados (por nome) somando as gramas, agrupado por categoria. */
export function buildShoppingList(items: { name: string; quantityG: number }[]): Record<string, ShoppingItem[]> {
  const byName = new Map<string, number>();
  for (const item of items) {
    byName.set(item.name, (byName.get(item.name) ?? 0) + item.quantityG);
  }

  const grouped: Record<string, ShoppingItem[]> = {};
  for (const [name, quantityG] of byName.entries()) {
    const category = categorize(name);
    (grouped[category] ??= []).push({ name, quantityG: Math.round(quantityG), category });
  }
  for (const list of Object.values(grouped)) {
    list.sort((a, b) => b.quantityG - a.quantityG);
  }
  return grouped;
}
