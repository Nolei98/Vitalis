const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Limpando banco...');
  await prisma.waterLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.user.deleteMany();

  console.log('Semeando dados...');
  const user = await prisma.user.create({
    data: {
      name: 'João',
      email: 'joao@example.com',
      tasks: {
        create: [
          { title: 'Revisar PR #42', project: 'LifeOS', priority: 3, status: 'pending', source: 'internal' },
          { title: 'Fazer exercícios (Perna)', project: 'Saúde', priority: 2, status: 'pending', source: 'internal' },
          { title: 'Ler 20 páginas do livro', project: 'Hábitos', priority: 1, status: 'pending', source: 'internal' }
        ]
      },
      waterLogs: {
        create: [
          { amount: 250 },
          { amount: 500 },
          { amount: 450 }
        ]
      },
      meals: {
        create: [
          { type: 'Café da Manhã', food: 'Pão de queijo e Café', calories: 280, protein: 10 },
          { type: 'Almoço', food: 'Frango Grelhado, Arroz, Salada', calories: 450, protein: 35 }
        ]
      },
      finAccounts: {
        create: [
          { name: 'Conta Corrente', type: 'checking', balance: 1500.50 }
        ]
      }
    }
  });
  console.log('Seed completo! Usuário ID:', user.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
