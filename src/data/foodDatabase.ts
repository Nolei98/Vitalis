import { FoodItem, FoodCategory, Goal } from '../types';
import { kcalFromMacros } from '../utils/nutrition';

// Base curada de alimentos brasileiros (valores aproximados por 100g, estilo tabela TACO).
// As calorias são derivadas dos macros (4-4-9) para manter consistência com o resto do app.

type Seed = [
  id: string,
  name: string,
  brand: string,
  category: FoodCategory,
  proteinG: number,
  carbsG: number,
  fatG: number,
  goals: Goal[]
];

const HIPER_EMA: Goal[] = ['hipertrofia', 'emagrecimento'];
const HIPER_MAN: Goal[] = ['hipertrofia', 'manutencao'];
const EMA_MAN: Goal[] = ['emagrecimento', 'manutencao'];
const ALL: Goal[] = ['hipertrofia', 'emagrecimento', 'manutencao'];

const SEEDS: Seed[] = [
  // ===== PROTEÍNAS =====
  ['p1', 'Filé de Frango Grelhado', 'Típico', 'Proteína', 32.0, 0, 2.5, HIPER_EMA],
  ['p2', 'Peito de Frango Cozido', 'Típico', 'Proteína', 31.0, 0, 3.0, HIPER_EMA],
  ['p3', 'Coxa de Frango (sem pele)', 'Típico', 'Proteína', 26.0, 0, 9.0, HIPER_MAN],
  ['p4', 'Patinho Moído', 'Típico', 'Proteína', 26.0, 0, 12.0, HIPER_MAN],
  ['p5', 'Acém Cozido', 'Típico', 'Proteína', 27.0, 0, 14.0, HIPER_MAN],
  ['p6', 'Filé Mignon Grelhado', 'Típico', 'Proteína', 32.0, 0, 8.0, HIPER_EMA],
  ['p7', 'Carne Moída (Patinho)', 'Típico', 'Proteína', 26.0, 0, 12.0, HIPER_MAN],
  ['p8', 'Lombo Suíno Assado', 'Típico', 'Proteína', 28.0, 0, 7.0, HIPER_EMA],
  ['p9', 'Tilápia Grelhada', 'Peixe', 'Proteína', 26.0, 0, 2.0, HIPER_EMA],
  ['p10', 'Salmão Grelhado', 'Peixe', 'Proteína', 25.0, 0, 13.0, HIPER_MAN],
  ['p11', 'Atum em Água (lata)', 'Peixe', 'Proteína', 26.0, 0, 1.0, HIPER_EMA],
  ['p12', 'Sardinha', 'Peixe', 'Proteína', 25.0, 0, 11.0, HIPER_MAN],
  ['p13', 'Camarão Cozido', 'Frutos do Mar', 'Proteína', 24.0, 0, 1.0, HIPER_EMA],
  ['p14', 'Ovo Cozido', 'Típico', 'Proteína', 13.0, 1.0, 11.0, ALL],
  ['p15', 'Ovo Frito', 'Típico', 'Proteína', 13.0, 1.0, 15.0, HIPER_MAN],
  ['p16', 'Clara de Ovo', 'Típico', 'Proteína', 11.0, 0.7, 0.2, HIPER_EMA],
  ['p17', 'Peito de Peru', 'Frios', 'Proteína', 22.0, 1.5, 3.0, HIPER_EMA],
  ['p18', 'Whey Protein (concentrado)', 'Suplemento', 'Proteína', 80.0, 8.0, 6.0, HIPER_EMA],
  ['p19', 'Carne Seca Dessalgada', 'Típico', 'Proteína', 30.0, 0, 10.0, HIPER_MAN],
  ['p20', 'Fígado Bovino', 'Típico', 'Proteína', 27.0, 4.0, 5.0, HIPER_EMA],

  // ===== CARBOIDRATOS =====
  ['c1', 'Arroz Branco Cozido', 'Típico', 'Carboidrato', 2.5, 28.1, 0.2, HIPER_MAN],
  ['c2', 'Arroz Integral Cozido', 'Típico', 'Carboidrato', 2.6, 25.8, 1.0, ALL],
  ['c3', 'Feijão Carioca Cozido', 'Típico', 'Carboidrato', 4.8, 13.6, 0.5, ALL],
  ['c4', 'Feijão Preto Cozido', 'Típico', 'Carboidrato', 5.0, 14.0, 0.5, ALL],
  ['c5', 'Lentilha Cozida', 'Leguminosa', 'Carboidrato', 9.0, 20.0, 0.4, ALL],
  ['c6', 'Grão de Bico Cozido', 'Leguminosa', 'Carboidrato', 8.9, 27.0, 2.6, ALL],
  ['c7', 'Batata Doce Cozida', 'Tubérculo', 'Carboidrato', 1.3, 28.2, 0.1, HIPER_MAN],
  ['c8', 'Batata Inglesa Cozida', 'Tubérculo', 'Carboidrato', 1.8, 20.0, 0.1, EMA_MAN],
  ['c9', 'Mandioca Cozida', 'Tubérculo', 'Carboidrato', 1.4, 30.1, 0.3, HIPER_MAN],
  ['c10', 'Inhame Cozido', 'Tubérculo', 'Carboidrato', 1.5, 23.0, 0.1, HIPER_MAN],
  ['c11', 'Macarrão Cozido', 'Massa', 'Carboidrato', 5.0, 30.0, 1.0, HIPER_MAN],
  ['c12', 'Macarrão Integral Cozido', 'Massa', 'Carboidrato', 6.0, 27.0, 1.2, ALL],
  ['c13', 'Pão Francês', 'Padaria', 'Carboidrato', 8.0, 58.0, 3.0, HIPER_MAN],
  ['c14', 'Pão Integral', 'Padaria', 'Carboidrato', 9.0, 49.0, 3.5, ALL],
  ['c15', 'Tapioca (Goma)', 'Típico', 'Carboidrato', 0, 60.0, 0, HIPER_MAN],
  ['c16', 'Cuscuz de Milho', 'Típico', 'Carboidrato', 2.2, 25.0, 0.5, HIPER_MAN],
  ['c17', 'Aveia em Flocos', 'Cereal', 'Carboidrato', 13.9, 66.6, 8.5, HIPER_MAN],
  ['c18', 'Granola', 'Cereal', 'Carboidrato', 10.0, 64.0, 12.0, HIPER_MAN],
  ['c19', 'Milho Cozido', 'Cereal', 'Carboidrato', 3.2, 19.0, 1.2, EMA_MAN],
  ['c20', 'Quinoa Cozida', 'Cereal', 'Carboidrato', 4.4, 21.3, 1.9, ALL],
  ['c21', 'Polenta', 'Típico', 'Carboidrato', 2.0, 17.0, 0.5, EMA_MAN],
  ['c22', 'Farofa Pronta', 'Típico', 'Carboidrato', 2.0, 70.0, 12.0, HIPER_MAN],
  ['c23', 'Pão de Queijo', 'Padaria', 'Carboidrato', 4.0, 38.0, 18.0, HIPER_MAN],
  ['c24', 'Biscoito de Arroz', 'Snack', 'Carboidrato', 8.0, 80.0, 3.0, EMA_MAN],

  // ===== GORDURAS BOAS =====
  ['g1', 'Azeite de Oliva', 'Óleo', 'Gordura', 0, 0, 100.0, HIPER_MAN],
  ['g2', 'Abacate', 'Fruta', 'Gordura', 1.2, 6.0, 8.4, HIPER_MAN],
  ['g3', 'Castanha do Pará', 'Oleaginosa', 'Gordura', 14.0, 12.0, 67.0, HIPER_MAN],
  ['g4', 'Castanha de Caju', 'Oleaginosa', 'Gordura', 18.0, 30.0, 44.0, HIPER_MAN],
  ['g5', 'Amêndoa', 'Oleaginosa', 'Gordura', 21.0, 22.0, 50.0, HIPER_MAN],
  ['g6', 'Noz', 'Oleaginosa', 'Gordura', 15.0, 14.0, 65.0, HIPER_MAN],
  ['g7', 'Amendoim Torrado', 'Oleaginosa', 'Gordura', 26.0, 16.0, 49.0, HIPER_MAN],
  ['g8', 'Pasta de Amendoim Integral', 'Oleaginosa', 'Gordura', 25.0, 20.0, 50.0, HIPER_MAN],
  ['g9', 'Chia (semente)', 'Semente', 'Gordura', 17.0, 42.0, 31.0, ALL],
  ['g10', 'Linhaça', 'Semente', 'Gordura', 18.0, 29.0, 42.0, ALL],
  ['g11', 'Óleo de Coco', 'Óleo', 'Gordura', 0, 0, 100.0, HIPER_MAN],
  ['g12', 'Coco Ralado', 'Fruta', 'Gordura', 3.5, 15.0, 33.0, HIPER_MAN],

  // ===== LATICÍNIOS =====
  ['l1', 'Leite Integral', 'Bebida', 'Laticínio', 3.2, 4.8, 3.3, HIPER_MAN],
  ['l2', 'Leite Desnatado', 'Bebida', 'Laticínio', 3.4, 5.0, 0.2, EMA_MAN],
  ['l3', 'Iogurte Natural Integral', 'Laticínio', 'Laticínio', 4.1, 4.7, 3.0, ALL],
  ['l4', 'Iogurte Natural Desnatado', 'Laticínio', 'Laticínio', 4.4, 5.0, 0.2, EMA_MAN],
  ['l5', 'Iogurte Grego', 'Laticínio', 'Laticínio', 9.0, 4.0, 5.0, ALL],
  ['l6', 'Queijo Minas Frescal', 'Laticínio', 'Laticínio', 17.0, 3.0, 20.0, HIPER_MAN],
  ['l7', 'Queijo Cottage', 'Laticínio', 'Laticínio', 11.0, 3.4, 4.3, HIPER_EMA],
  ['l8', 'Ricota', 'Laticínio', 'Laticínio', 11.0, 4.0, 8.0, ALL],
  ['l9', 'Queijo Mussarela', 'Laticínio', 'Laticínio', 22.0, 2.0, 22.0, HIPER_MAN],
  ['l10', 'Requeijão', 'Laticínio', 'Laticínio', 9.0, 3.0, 24.0, HIPER_MAN],

  // ===== FRUTAS =====
  ['f1', 'Banana Nanica', 'Fruta', 'Fruta', 1.4, 23.8, 0.1, ALL],
  ['f2', 'Maçã', 'Fruta', 'Fruta', 0.3, 14.0, 0.2, EMA_MAN],
  ['f3', 'Mamão Papaia', 'Fruta', 'Fruta', 0.5, 11.0, 0.1, EMA_MAN],
  ['f4', 'Laranja', 'Fruta', 'Fruta', 0.9, 11.5, 0.1, EMA_MAN],
  ['f5', 'Morango', 'Fruta', 'Fruta', 0.7, 7.7, 0.3, EMA_MAN],
  ['f6', 'Manga', 'Fruta', 'Fruta', 0.8, 15.0, 0.4, ALL],
  ['f7', 'Abacaxi', 'Fruta', 'Fruta', 0.5, 13.0, 0.1, EMA_MAN],
  ['f8', 'Uva', 'Fruta', 'Fruta', 0.7, 18.0, 0.2, HIPER_MAN],
  ['f9', 'Melancia', 'Fruta', 'Fruta', 0.6, 8.0, 0.2, EMA_MAN],
  ['f10', 'Pera', 'Fruta', 'Fruta', 0.4, 15.0, 0.1, EMA_MAN],
  ['f11', 'Kiwi', 'Fruta', 'Fruta', 1.1, 15.0, 0.5, EMA_MAN],
  ['f12', 'Açaí (polpa pura)', 'Fruta', 'Fruta', 1.0, 6.0, 5.0, HIPER_MAN],
  ['f13', 'Maracujá', 'Fruta', 'Fruta', 2.0, 13.0, 0.7, EMA_MAN],
  ['f14', 'Goiaba', 'Fruta', 'Fruta', 1.1, 13.0, 0.4, EMA_MAN],

  // ===== VEGETAIS =====
  ['v1', 'Brócolis Cozido', 'Vegetal', 'Vegetal', 2.8, 7.0, 0.4, EMA_MAN],
  ['v2', 'Couve Refogada', 'Vegetal', 'Vegetal', 2.9, 8.0, 0.5, EMA_MAN],
  ['v3', 'Espinafre Cozido', 'Vegetal', 'Vegetal', 2.7, 3.6, 0.4, EMA_MAN],
  ['v4', 'Alface', 'Vegetal', 'Vegetal', 1.4, 2.9, 0.2, EMA_MAN],
  ['v5', 'Tomate', 'Vegetal', 'Vegetal', 0.9, 3.9, 0.2, EMA_MAN],
  ['v6', 'Cenoura Crua', 'Vegetal', 'Vegetal', 0.9, 9.6, 0.2, EMA_MAN],
  ['v7', 'Abobrinha Cozida', 'Vegetal', 'Vegetal', 1.2, 3.0, 0.2, EMA_MAN],
  ['v8', 'Beterraba Cozida', 'Vegetal', 'Vegetal', 1.6, 9.0, 0.1, EMA_MAN],
  ['v9', 'Pepino', 'Vegetal', 'Vegetal', 0.7, 3.6, 0.1, EMA_MAN],
  ['v10', 'Couve-flor Cozida', 'Vegetal', 'Vegetal', 1.9, 5.0, 0.3, EMA_MAN],
  ['v11', 'Pimentão', 'Vegetal', 'Vegetal', 1.0, 6.0, 0.3, EMA_MAN],
  ['v12', 'Vagem Cozida', 'Vegetal', 'Vegetal', 1.8, 7.0, 0.2, EMA_MAN],
  ['v13', 'Berinjela Cozida', 'Vegetal', 'Vegetal', 1.0, 6.0, 0.2, EMA_MAN],
  ['v14', 'Abóbora Cozida', 'Vegetal', 'Vegetal', 1.0, 8.0, 0.1, EMA_MAN],
  ['v15', 'Quiabo', 'Vegetal', 'Vegetal', 1.9, 7.0, 0.2, EMA_MAN],

  // ===== BEBIDAS / OUTROS =====
  ['b1', 'Água de Coco', 'Bebida', 'Bebida', 0.7, 9.0, 0.2, EMA_MAN],
  ['b2', 'Suco de Laranja Natural', 'Bebida', 'Bebida', 0.7, 10.0, 0.2, EMA_MAN],
  ['b3', 'Café sem Açúcar', 'Bebida', 'Bebida', 0.1, 0, 0, ALL],
  ['o1', 'Mel', 'Adoçante', 'Outro', 0.3, 82.0, 0, HIPER_MAN],
  ['o2', 'Chocolate 70% Cacau', 'Doce', 'Outro', 9.0, 46.0, 42.0, HIPER_MAN],
];

export const FOOD_DATABASE: FoodItem[] = SEEDS.map(
  ([id, name, brand, category, proteinG, carbsG, fatG, goals]) => ({
    id,
    name,
    brand,
    category,
    proteinG,
    carbsG,
    fatG,
    goals,
    energyKcal: kcalFromMacros(proteinG, carbsG, fatG),
    createdAt: 0,
  })
);

// Compat: nome antigo usado por componentes existentes.
export const MOCK_FOODS = FOOD_DATABASE;
