// Seed do catálogo de alimentos (FoodCatalogItem) — subconjunto curado inspirado na
// TACO (Tabela Brasileira de Composição de Alimentos), valores por 100g.
// Script isolado e ADITIVO: só mexe em FoodCatalogItem (source='taco'), não toca
// em nenhuma outra tabela nem em dados de usuário. Rode com: node prisma/seedFoodCatalog.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// [name, kcal, proteinG, carbG, fatG, tags]
const TACO_FOODS = [
  ['Arroz branco cozido', 128, 2.5, 28.1, 0.2, 'onivoro,vegetariano,vegano'],
  ['Arroz integral cozido', 124, 2.6, 25.8, 1.0, 'onivoro,vegetariano,vegano'],
  ['Feijão carioca cozido', 76, 4.8, 13.6, 0.5, 'onivoro,vegetariano,vegano'],
  ['Feijão preto cozido', 77, 4.5, 14.0, 0.5, 'onivoro,vegetariano,vegano'],
  ['Peito de frango grelhado', 159, 32.0, 0, 2.5, 'onivoro,low_carb,cetogenica'],
  ['Coxa de frango assada', 215, 26.0, 0, 12.0, 'onivoro,low_carb,cetogenica'],
  ['Carne bovina patinho grelhado', 219, 35.9, 0, 7.3, 'onivoro,low_carb,cetogenica'],
  ['Carne moída refogada', 212, 26.0, 0, 11.0, 'onivoro,low_carb,cetogenica'],
  ['Tilápia grelhada', 128, 26.0, 0, 2.0, 'onivoro,low_carb,cetogenica'],
  ['Salmão grelhado', 208, 25.0, 0, 12.0, 'onivoro,low_carb,cetogenica'],
  ['Ovo cozido', 155, 13.0, 1.1, 11.0, 'onivoro,vegetariano,low_carb,cetogenica'],
  ['Ovo mexido', 168, 12.0, 1.6, 12.5, 'onivoro,vegetariano,low_carb,cetogenica'],
  ['Tofu grelhado', 144, 15.0, 3.0, 9.0, 'vegetariano,vegano,low_carb'],
  ['Batata inglesa cozida', 87, 1.9, 20.1, 0.1, 'onivoro,vegetariano,vegano'],
  ['Batata doce cozida', 118, 1.6, 27.1, 0.2, 'onivoro,vegetariano,vegano'],
  ['Mandioca cozida', 125, 0.6, 30.1, 0.3, 'onivoro,vegetariano,vegano'],
  ['Macarrão cozido', 158, 5.8, 30.9, 1.0, 'onivoro,vegetariano,vegano'],
  ['Pão francês', 300, 8.0, 58.6, 3.1, 'onivoro,vegetariano'],
  ['Pão integral', 253, 9.4, 49.9, 3.3, 'onivoro,vegetariano'],
  ['Tapioca', 240, 0.2, 59.3, 0, 'onivoro,vegetariano,vegano'],
  ['Aveia em flocos', 394, 13.9, 67.7, 8.5, 'onivoro,vegetariano,vegano'],
  ['Quinoa cozida', 120, 4.4, 21.3, 1.9, 'onivoro,vegetariano,vegano'],
  ['Brócolis cozido', 25, 2.1, 4.4, 0.3, 'onivoro,vegetariano,vegano,low_carb'],
  ['Cenoura crua', 41, 0.9, 9.6, 0.2, 'onivoro,vegetariano,vegano,low_carb'],
  ['Alface', 15, 1.4, 2.4, 0.2, 'onivoro,vegetariano,vegano,low_carb,cetogenica'],
  ['Tomate', 18, 0.9, 3.9, 0.2, 'onivoro,vegetariano,vegano,low_carb'],
  ['Abobrinha refogada', 20, 1.2, 4.0, 0.2, 'onivoro,vegetariano,vegano,low_carb'],
  ['Couve refogada', 39, 2.9, 6.0, 0.9, 'onivoro,vegetariano,vegano,low_carb'],
  ['Espinafre refogado', 23, 2.9, 3.6, 0.4, 'onivoro,vegetariano,vegano,low_carb,cetogenica'],
  ['Abacate', 96, 1.2, 6.0, 8.4, 'onivoro,vegetariano,vegano,low_carb,cetogenica'],
  ['Banana', 92, 1.4, 23.8, 0.1, 'onivoro,vegetariano,vegano'],
  ['Maçã', 56, 0.3, 15.2, 0.4, 'onivoro,vegetariano,vegano'],
  ['Mamão', 40, 0.6, 10.4, 0.1, 'onivoro,vegetariano,vegano'],
  ['Laranja', 45, 1.0, 11.5, 0.2, 'onivoro,vegetariano,vegano'],
  ['Morango', 30, 0.9, 6.8, 0.3, 'onivoro,vegetariano,vegano'],
  ['Manga', 64, 0.4, 16.7, 0.2, 'onivoro,vegetariano,vegano'],
  ['Leite integral', 61, 2.9, 4.3, 3.2, 'onivoro,vegetariano'],
  ['Leite desnatado', 35, 3.4, 5.0, 0.2, 'onivoro,vegetariano'],
  ['Iogurte natural', 51, 4.0, 4.9, 1.5, 'onivoro,vegetariano'],
  ['Queijo minas frescal', 264, 17.4, 3.2, 20.2, 'onivoro,vegetariano,low_carb'],
  ['Queijo muçarela', 330, 22.6, 3.0, 25.2, 'onivoro,vegetariano,low_carb'],
  ['Requeijão', 257, 9.6, 3.0, 23.4, 'onivoro,vegetariano,low_carb'],
  ['Whey protein (pó)', 400, 80.0, 8.0, 6.0, 'onivoro,vegetariano,low_carb'],
  ['Amendoim torrado', 590, 27.2, 20.3, 47.0, 'onivoro,vegetariano,vegano,low_carb,cetogenica'],
  ['Castanha do pará', 656, 14.5, 12.3, 63.5, 'onivoro,vegetariano,vegano,low_carb,cetogenica'],
  ['Azeite de oliva', 884, 0, 0, 100.0, 'onivoro,vegetariano,vegano,low_carb,cetogenica'],
  ['Feijão preto com arroz (mix)', 100, 3.5, 20.0, 0.5, 'onivoro,vegetariano,vegano'],
  ['Lentilha cozida', 93, 6.3, 16.3, 0.5, 'onivoro,vegetariano,vegano'],
  ['Grão-de-bico cozido', 121, 6.5, 20.0, 1.8, 'onivoro,vegetariano,vegano'],
  ['Peixe (bacalhau) cozido', 105, 23.0, 0, 0.9, 'onivoro,low_carb,cetogenica'],
  ['Camarão cozido', 99, 20.9, 0.2, 1.1, 'onivoro,low_carb,cetogenica'],
  ['Granola', 471, 10.0, 64.0, 20.0, 'onivoro,vegetariano,vegano'],
  ['Chocolate amargo 70%', 598, 7.8, 45.9, 42.6, 'onivoro,vegetariano,vegano'],
];

async function main() {
  console.log('Seedando catálogo de alimentos (source=taco)...');
  await prisma.foodCatalogItem.deleteMany({ where: { source: 'taco' } });
  await prisma.foodCatalogItem.createMany({
    data: TACO_FOODS.map(([name, kcal, p, c, f, tags]) => ({
      source: 'taco',
      name,
      per100Kcal: kcal,
      per100P: p,
      per100C: c,
      per100F: f,
      tags,
    })),
  });
  const count = await prisma.foodCatalogItem.count({ where: { source: 'taco' } });
  console.log(`Catálogo semeado: ${count} alimentos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
