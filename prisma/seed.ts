import { WeekDay } from "../src/generated/prisma/enums.js";
import { prisma } from "../src/lib/db.js";

async function main() {
  console.log("🌱 Iniciando seed de alta performance em Português...");

  // 1. Limpando dados antigos para evitar duplicidade
  await prisma.templateExercise.deleteMany();
  await prisma.templateDay.deleteMany();
  await prisma.workoutTemplate.deleteMany();
  await prisma.exercise.deleteMany();

  // 2. Biblioteca Global de Exercícios (Expandida para ~100 exercícios)
  console.log("🏋️ Semeando Biblioteca de Exercícios...");
  const exercisesData = [
    // Peito
    { name: "Supino Reto com Barra", muscleGroup: "Peito", equipment: "Barra", difficulty: "Iniciante" },
    { name: "Supino Inclinado com Halteres", muscleGroup: "Peito", equipment: "Halteres", difficulty: "Intermediário" },
    { name: "Crucifixo Reto com Halteres", muscleGroup: "Peito", equipment: "Halteres", difficulty: "Iniciante" },
    { name: "Crossover Polia Alta", muscleGroup: "Peito", equipment: "Polia", difficulty: "Intermediário" },
    { name: "Peck Deck (Voador)", muscleGroup: "Peito", equipment: "Máquina", difficulty: "Iniciante" },
    { name: "Flexão de Braços", muscleGroup: "Peito", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Supino com Pausa", muscleGroup: "Peito", equipment: "Barra", difficulty: "Avançado" },
    { name: "Flexão Diamante", muscleGroup: "Peito", equipment: "Peso do Corpo", difficulty: "Intermediário" },

    // Costas
    { name: "Levantamento Terra", muscleGroup: "Costas", equipment: "Barra", difficulty: "Avançado" },
    { name: "Puxada Frontal Aberta", muscleGroup: "Costas", equipment: "Polia", difficulty: "Iniciante" },
    { name: "Remada Curvada com Barra", muscleGroup: "Costas", equipment: "Barra", difficulty: "Intermediário" },
    { name: "Remada Unilateral com Halter (Serrote)", muscleGroup: "Costas", equipment: "Halteres", difficulty: "Iniciante" },
    { name: "Puxada Triângulo", muscleGroup: "Costas", equipment: "Polia", difficulty: "Iniciante" },
    { name: "Barra Fixa", muscleGroup: "Costas", equipment: "Peso do Corpo", difficulty: "Intermediário" },
    { name: "Pulldown com Corda", muscleGroup: "Costas", equipment: "Polia", difficulty: "Intermediário" },
    { name: "Remada Baixa na Polia", muscleGroup: "Costas", equipment: "Polia", difficulty: "Iniciante" },
    { name: "Superman (Extensão Lombar)", muscleGroup: "Costas", equipment: "Peso do Corpo", difficulty: "Iniciante" },

    // Pernas
    { name: "Agachamento Livre com Barra", muscleGroup: "Pernas", equipment: "Barra", difficulty: "Avançado" },
    { name: "Leg Press 45 Graus", muscleGroup: "Pernas", equipment: "Máquina", difficulty: "Iniciante" },
    { name: "Cadeira Extensora", muscleGroup: "Pernas", equipment: "Máquina", difficulty: "Iniciante" },
    { name: "Mesa Flexora", muscleGroup: "Pernas", equipment: "Máquina", difficulty: "Iniciante" },
    { name: "Levantamento Terra Romeno", muscleGroup: "Pernas", equipment: "Barra", difficulty: "Intermediário" },
    { name: "Cadeira Abdutora", muscleGroup: "Pernas", equipment: "Máquina", difficulty: "Iniciante" },
    { name: "Afundo com Halteres", muscleGroup: "Pernas", equipment: "Halteres", difficulty: "Intermediário" },
    { name: "Elevação de Panturrilha em Pé", muscleGroup: "Pernas", equipment: "Máquina", difficulty: "Iniciante" },
    { name: "Agachamento Sumô", muscleGroup: "Pernas", equipment: "Halteres", difficulty: "Iniciante" },
    { name: "Elevação Pélvica", muscleGroup: "Pernas", equipment: "Barra", difficulty: "Intermediário" },
    { name: "Agachamento Low Bar", muscleGroup: "Pernas", equipment: "Barra", difficulty: "Avançado" },
    { name: "Cadeira Adutora", muscleGroup: "Pernas", equipment: "Máquina", difficulty: "Iniciante" },
    { name: "Lunge Reverso", muscleGroup: "Pernas", equipment: "Peso do Corpo", difficulty: "Iniciante" },

    // Ombros
    { name: "Desenvolvimento com Halteres", muscleGroup: "Ombros", equipment: "Halteres", difficulty: "Iniciante" },
    { name: "Elevação Lateral", muscleGroup: "Ombros", equipment: "Halteres", difficulty: "Iniciante" },
    { name: "Elevação Frontal", muscleGroup: "Ombros", equipment: "Halteres", difficulty: "Iniciante" },
    { name: "Face Pull", muscleGroup: "Ombros", equipment: "Polia", difficulty: "Iniciante" },
    { name: "Desenvolvimento Arnold", muscleGroup: "Ombros", equipment: "Halteres", difficulty: "Intermediário" },
    { name: "Encolhimento de Ombros", muscleGroup: "Ombros", equipment: "Halteres", difficulty: "Iniciante" },
    { name: "Desenvolvimento Militar", muscleGroup: "Ombros", equipment: "Barra", difficulty: "Intermediário" },

    // Braços
    { name: "Rosca Direta com Barra W", muscleGroup: "Braços", equipment: "Barra", difficulty: "Iniciante" },
    { name: "Rosca Martelo", muscleGroup: "Braços", equipment: "Halteres", difficulty: "Iniciante" },
    { name: "Rosca Concentrada", muscleGroup: "Braços", equipment: "Halteres", difficulty: "Intermediário" },
    { name: "Tríceps Corda na Polia", muscleGroup: "Braços", equipment: "Polia", difficulty: "Iniciante" },
    { name: "Tríceps Testa", muscleGroup: "Braços", equipment: "Barra", difficulty: "Intermediário" },
    { name: "Tríceps Coice", muscleGroup: "Braços", equipment: "Polia", difficulty: "Iniciante" },
    { name: "Paralelas", muscleGroup: "Braços", equipment: "Peso do Corpo", difficulty: "Intermediário" },
    { name: "Rosca Inversa", muscleGroup: "Braços", equipment: "Barra", difficulty: "Iniciante" },
    { name: "Mergulho no Banco", muscleGroup: "Braços", equipment: "Peso do Corpo", difficulty: "Iniciante" },

    // Core
    { name: "Prancha Abdominal", muscleGroup: "Abdômen", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Abdominal Supra (Crunch)", muscleGroup: "Abdômen", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Elevação de Pernas", muscleGroup: "Abdômen", equipment: "Peso do Corpo", difficulty: "Intermediário" },
    { name: "Abdominal Infra no Banco", muscleGroup: "Abdômen", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Prancha Lateral", muscleGroup: "Abdômen", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Abdominal Bicicleta", muscleGroup: "Abdômen", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Roda Abdominal", muscleGroup: "Abdômen", equipment: "Roda", difficulty: "Avançado" },

    // Funcional / Cardio / Performance
    { name: "Burpees", muscleGroup: "Corpo Inteiro", equipment: "Peso do Corpo", difficulty: "Intermediário" },
    { name: "Kettlebell Swing", muscleGroup: "Posterior e Core", equipment: "Kettlebell", difficulty: "Intermediário" },
    { name: "Wall Ball", muscleGroup: "Pernas e Ombros", equipment: "Medicine Ball", difficulty: "Intermediário" },
    { name: "Box Jump", muscleGroup: "Pernas", equipment: "Caixa", difficulty: "Intermediário" },
    { name: "Thrusters", muscleGroup: "Corpo Inteiro", equipment: "Barra", difficulty: "Avançado" },
    { name: "Mountain Climbers", muscleGroup: "Core e Cardio", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Polichinelos", muscleGroup: "Cardio", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Salto em Distância", muscleGroup: "Pernas", equipment: "Peso do Corpo", difficulty: "Intermediário" },
    { name: "Sombra de Boxe", muscleGroup: "Cardio", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Sprawl", muscleGroup: "Corpo Inteiro", equipment: "Peso do Corpo", difficulty: "Intermediário" },

    // Yoga / Mobilidade / Bem-Estar
    { name: "Saudação ao Sol", muscleGroup: "Corpo Inteiro", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Postura do Guerreiro I", muscleGroup: "Pernas e Core", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Cachorro Olhando para Baixo", muscleGroup: "Mobilidade", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Gato-Vaca", muscleGroup: "Mobilidade Coluna", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Mobilidade de Quadril 90/90", muscleGroup: "Mobilidade Quadril", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Postura da Criança", muscleGroup: "Mobilidade", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Alongamento Cobra", muscleGroup: "Mobilidade", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Sentar e Levantar da Cadeira", muscleGroup: "Pernas", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Marcha no Lugar", muscleGroup: "Cardio", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Equilíbrio Unipodal", muscleGroup: "Equilíbrio", equipment: "Peso do Corpo", difficulty: "Iniciante" },
    { name: "Rotação de Tronco Sentado", muscleGroup: "Mobilidade Coluna", equipment: "Peso do Corpo", difficulty: "Iniciante" },
  ];

  for (const ex of exercisesData) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {},
      create: ex,
    });
  }

  console.log("📝 Semeando 20 Modelos de Treino...");

  const templates = [
    // --- CATEGORIA: HIPERTROFIA ---
    {
      name: "Hipertrofia ABCDE: Divisão Avançada",
      description: "Um grupo muscular por dia para máxima intensidade e volume. Ideal para atletas avançados.",
      category: "Hipertrofia",
      difficulty: "Avançado",
      days: [
        { name: "Segunda: Peito e Abs", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Supino Reto com Barra", sets: 4, reps: 10, rest: 90 },
          { name: "Supino Inclinado com Halteres", sets: 4, reps: 12, rest: 60 },
          { name: "Peck Deck (Voador)", sets: 3, reps: 15, rest: 45 },
          { name: "Crossover Polia Alta", sets: 3, reps: 15, rest: 45 },
          { name: "Flexão de Braços", sets: 3, reps: 20, rest: 60 },
          { name: "Abdominal Supra (Crunch)", sets: 4, reps: 20, rest: 45 },
        ]},
        { name: "Terça: Costas e Lombar", weekDay: WeekDay.TUESDAY, exercises: [
          { name: "Levantamento Terra", sets: 3, reps: 8, rest: 120 },
          { name: "Puxada Frontal Aberta", sets: 4, reps: 10, rest: 90 },
          { name: "Remada Curvada com Barra", sets: 4, reps: 10, rest: 90 },
          { name: "Puxada Triângulo", sets: 3, reps: 12, rest: 60 },
          { name: "Remada Baixa na Polia", sets: 3, reps: 15, rest: 60 },
          { name: "Superman (Extensão Lombar)", sets: 3, reps: 15, rest: 45 },
        ]},
        { name: "Quarta: Pernas (Foco Anterior)", weekDay: WeekDay.WEDNESDAY, exercises: [
          { name: "Agachamento Livre com Barra", sets: 4, reps: 10, rest: 120 },
          { name: "Leg Press 45 Graus", sets: 4, reps: 12, rest: 90 },
          { name: "Cadeira Extensora", sets: 4, reps: 15, rest: 60 },
          { name: "Afundo com Halteres", sets: 3, reps: 12, rest: 90 },
          { name: "Cadeira Adutora", sets: 3, reps: 15, rest: 45 },
          { name: "Elevação de Panturrilha em Pé", sets: 4, reps: 20, rest: 45 },
        ]},
        { name: "Quinta: Ombros e Trapézio", weekDay: WeekDay.THURSDAY, exercises: [
          { name: "Desenvolvimento Militar", sets: 4, reps: 8, rest: 90 },
          { name: "Elevação Lateral", sets: 4, reps: 15, rest: 45 },
          { name: "Elevação Frontal", sets: 3, reps: 12, rest: 60 },
          { name: "Face Pull", sets: 4, reps: 15, rest: 60 },
          { name: "Encolhimento de Ombros", sets: 4, reps: 12, rest: 60 },
          { name: "Prancha Abdominal", sets: 3, reps: 60, rest: 60 },
        ]},
        { name: "Sexta: Braços (Bíceps/Tríceps)", weekDay: WeekDay.FRIDAY, exercises: [
          { name: "Rosca Direta com Barra W", sets: 4, reps: 10, rest: 60 },
          { name: "Tríceps Testa", sets: 4, reps: 10, rest: 60 },
          { name: "Rosca Martelo", sets: 3, reps: 12, rest: 60 },
          { name: "Tríceps Corda na Polia", sets: 3, reps: 12, rest: 60 },
          { name: "Rosca Concentrada", sets: 3, reps: 15, rest: 45 },
          { name: "Paralelas", sets: 3, reps: 12, rest: 60 },
        ]},
      ]
    },
    {
      name: "Hipertrofia PPL (Push/Pull/Legs)",
      description: "A clássica divisão de empurrar, puxar e pernas. Alta frequência e excelente recuperação.",
      category: "Hipertrofia",
      difficulty: "Intermediário",
      days: [
        { name: "Empurrar (Peito/Ombro/Tríceps)", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Supino Reto com Barra", sets: 3, reps: 10, rest: 90 },
          { name: "Desenvolvimento com Halteres", sets: 3, reps: 12, rest: 60 },
          { name: "Crucifixo Reto com Halteres", sets: 3, reps: 12, rest: 60 },
          { name: "Elevação Lateral", sets: 3, reps: 15, rest: 45 },
          { name: "Tríceps Corda na Polia", sets: 3, reps: 12, rest: 60 },
          { name: "Mergulho no Banco", sets: 3, reps: 15, rest: 45 },
        ]},
        { name: "Puxar (Costas/Bíceps/Lombar)", weekDay: WeekDay.TUESDAY, exercises: [
          { name: "Puxada Frontal Aberta", sets: 3, reps: 10, rest: 90 },
          { name: "Remada Curvada com Barra", sets: 3, reps: 12, rest: 90 },
          { name: "Face Pull", sets: 3, reps: 15, rest: 60 },
          { name: "Rosca Direta com Barra W", sets: 3, reps: 12, rest: 60 },
          { name: "Rosca Martelo", sets: 3, reps: 12, rest: 60 },
          { name: "Abdominal Supra (Crunch)", sets: 3, reps: 20, rest: 45 },
        ]},
        { name: "Pernas Completo", weekDay: WeekDay.WEDNESDAY, exercises: [
          { name: "Agachamento Livre com Barra", sets: 3, reps: 10, rest: 120 },
          { name: "Leg Press 45 Graus", sets: 3, reps: 12, rest: 90 },
          { name: "Mesa Flexora", sets: 3, reps: 12, rest: 60 },
          { name: "Levantamento Terra Romeno", sets: 3, reps: 12, rest: 90 },
          { name: "Elevação de Panturrilha em Pé", sets: 4, reps: 15, rest: 45 },
        ]},
      ]
    },
    {
      name: "Hipertrofia Upper/Lower (Superior/Inferior)",
      description: "Divisão eficiente de 4 dias. Foco em grandes grupos musculares com alta carga.",
      category: "Hipertrofia",
      difficulty: "Intermediário",
      days: [
        { name: "Superior A", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Supino Reto com Barra", sets: 4, reps: 8, rest: 90 },
          { name: "Remada Curvada com Barra", sets: 4, reps: 8, rest: 90 },
          { name: "Desenvolvimento Militar", sets: 3, reps: 10, rest: 90 },
          { name: "Barra Fixa", sets: 3, reps: 10, rest: 90 },
          { name: "Tríceps Testa", sets: 3, reps: 12, rest: 60 },
          { name: "Rosca Direta com Barra W", sets: 3, reps: 12, rest: 60 },
        ]},
        { name: "Inferior A", weekDay: WeekDay.TUESDAY, exercises: [
          { name: "Agachamento Livre com Barra", sets: 4, reps: 8, rest: 120 },
          { name: "Levantamento Terra Romeno", sets: 4, reps: 10, rest: 90 },
          { name: "Leg Press 45 Graus", sets: 3, reps: 12, rest: 90 },
          { name: "Mesa Flexora", sets: 3, reps: 12, rest: 60 },
          { name: "Elevação de Panturrilha em Pé", sets: 4, reps: 15, rest: 45 },
          { name: "Prancha Abdominal", sets: 3, reps: 60, rest: 60 },
        ]},
      ]
    },
    {
      name: "Arnold Split: Força e Volume",
      description: "A clássica divisão do mestre Arnold: Peito/Costas, Ombros/Braços e Pernas.",
      category: "Hipertrofia",
      difficulty: "Avançado",
      days: [
        { name: "Peito e Costas", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Supino Reto com Barra", sets: 4, reps: 10, rest: 90 },
          { name: "Remada Curvada com Barra", sets: 4, reps: 10, rest: 90 },
          { name: "Supino Inclinado com Halteres", sets: 3, reps: 12, rest: 60 },
          { name: "Puxada Frontal Aberta", sets: 3, reps: 12, rest: 60 },
          { name: "Crucifixo Reto com Halteres", sets: 3, reps: 15, rest: 45 },
          { name: "Remada Baixa na Polia", sets: 3, reps: 15, rest: 45 },
        ]},
        { name: "Ombros e Braços", weekDay: WeekDay.TUESDAY, exercises: [
          { name: "Desenvolvimento com Halteres", sets: 4, reps: 10, rest: 90 },
          { name: "Elevação Lateral", sets: 4, reps: 15, rest: 45 },
          { name: "Rosca Direta com Barra W", sets: 3, reps: 10, rest: 60 },
          { name: "Tríceps Testa", sets: 3, reps: 10, rest: 60 },
          { name: "Rosca Martelo", sets: 3, reps: 12, rest: 60 },
          { name: "Tríceps Corda na Polia", sets: 3, reps: 12, rest: 60 },
        ]},
        { name: "Pernas", weekDay: WeekDay.WEDNESDAY, exercises: [
          { name: "Agachamento Livre com Barra", sets: 4, reps: 10, rest: 120 },
          { name: "Leg Press 45 Graus", sets: 4, reps: 12, rest: 90 },
          { name: "Mesa Flexora", sets: 4, reps: 12, rest: 60 },
          { name: "Cadeira Extensora", sets: 3, reps: 15, rest: 60 },
          { name: "Elevação de Panturrilha em Pé", sets: 5, reps: 20, rest: 45 },
        ]},
      ]
    },

    // --- CATEGORIA: EMAGRECIMENTO ---
    {
      name: "HIIT: Queima Extrema",
      description: "Treino intervalado de alta intensidade para derreter gordura em pouco tempo.",
      category: "Emagrecimento",
      difficulty: "Intermediário",
      days: [
        { name: "Cardio Explosivo", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Burpees", sets: 5, reps: 15, rest: 30 },
          { name: "Mountain Climbers", sets: 5, reps: 30, rest: 30 },
          { name: "Polichinelos", sets: 5, reps: 50, rest: 30 },
          { name: "Box Jump", sets: 4, reps: 12, rest: 45 },
          { name: "Kettlebell Swing", sets: 4, reps: 20, rest: 45 },
          { name: "Prancha Abdominal", sets: 4, reps: 60, rest: 30 },
        ]},
      ]
    },
    {
      name: "Circuito de Força Metabólica",
      description: "Combine exercícios de força em circuito para manter o metabolismo acelerado.",
      category: "Emagrecimento",
      difficulty: "Intermediário",
      days: [
        { name: "Circuito Total Body", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Agachamento Sumô", sets: 4, reps: 20, rest: 30 },
          { name: "Flexão de Braços", sets: 4, reps: 15, rest: 30 },
          { name: "Remada Unilateral com Halter (Serrote)", sets: 4, reps: 15, rest: 30 },
          { name: "Desenvolvimento com Halteres", sets: 4, reps: 15, rest: 30 },
          { name: "Afundo com Halteres", sets: 4, reps: 15, rest: 30 },
          { name: "Elevação de Pernas", sets: 4, reps: 20, rest: 30 },
        ]},
      ]
    },
    {
      name: "Definição Funcional",
      description: "Treino focado em qualidade muscular e queima calórica com movimentos naturais.",
      category: "Emagrecimento",
      difficulty: "Iniciante",
      days: [
        { name: "Funcional e Core", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Wall Ball", sets: 4, reps: 15, rest: 60 },
          { name: "Remada Baixa na Polia", sets: 4, reps: 15, rest: 45 },
          { name: "Supino Inclinado com Halteres", sets: 4, reps: 15, rest: 45 },
          { name: "Cadeira Abdutora", sets: 4, reps: 20, rest: 30 },
          { name: "Abdominal Bicicleta", sets: 4, reps: 20, rest: 30 },
          { name: "Prancha Lateral", sets: 3, reps: 45, rest: 30 },
        ]},
      ]
    },

    // --- CATEGORIA: ESPECIALIZADO ---
    {
      name: "Powerlifting: Força Bruta",
      description: "Foco nos três grandes levantamentos: Agachamento, Supino e Terra.",
      category: "Especializado",
      difficulty: "Avançado",
      days: [
        { name: "Dia de Supino", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Supino com Pausa", sets: 5, reps: 5, rest: 180 },
          { name: "Desenvolvimento Militar", sets: 4, reps: 6, rest: 120 },
          { name: "Paralelas", sets: 3, reps: 8, rest: 90 },
          { name: "Crucifixo Reto com Halteres", sets: 3, reps: 12, rest: 60 },
          { name: "Tríceps Testa", sets: 4, reps: 10, rest: 60 },
          { name: "Encolhimento de Ombros", sets: 3, reps: 15, rest: 60 },
        ]},
        { name: "Dia de Agachamento", weekDay: WeekDay.WEDNESDAY, exercises: [
          { name: "Agachamento Low Bar", sets: 5, reps: 5, rest: 240 },
          { name: "Leg Press 45 Graus", sets: 4, reps: 8, rest: 120 },
          { name: "Levantamento Terra Romeno", sets: 3, reps: 10, rest: 90 },
          { name: "Cadeira Extensora", sets: 3, reps: 15, rest: 60 },
          { name: "Elevação de Panturrilha em Pé", sets: 4, reps: 15, rest: 45 },
        ]},
        { name: "Dia de Levantamento Terra", weekDay: WeekDay.FRIDAY, exercises: [
          { name: "Levantamento Terra", sets: 3, reps: 3, rest: 300 },
          { name: "Remada Curvada com Barra", sets: 4, reps: 8, rest: 120 },
          { name: "Barra Fixa", sets: 3, reps: 8, rest: 120 },
          { name: "Rosca Direta com Barra W", sets: 4, reps: 10, rest: 60 },
          { name: "Abdominal Infra no Banco", sets: 4, reps: 15, rest: 60 },
        ]},
      ]
    },
    {
      name: "Calistenia Intermediária",
      description: "Domine o peso do próprio corpo com exercícios desafiadores.",
      category: "Especializado",
      difficulty: "Intermediário",
      days: [
        { name: "Push/Pull Corporal", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Barra Fixa", sets: 4, reps: 8, rest: 90 },
          { name: "Flexão de Braços", sets: 4, reps: 15, rest: 60 },
          { name: "Flexão Diamante", sets: 3, reps: 12, rest: 60 },
          { name: "Mergulho no Banco", sets: 4, reps: 12, rest: 60 },
          { name: "Superman (Extensão Lombar)", sets: 3, reps: 15, rest: 45 },
          { name: "Elevação de Pernas", sets: 4, reps: 12, rest: 60 },
        ]},
      ]
    },
    {
      name: "Treino em Casa (Sem Equipamento)",
      description: "Mantenha-se em forma sem sair de casa. Apenas peso do corpo.",
      category: "Especializado",
      difficulty: "Iniciante",
      days: [
        { name: "Full Body Home", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Agachamento Livre com Barra", sets: 4, reps: 20, rest: 45 },
          { name: "Lunge Reverso", sets: 3, reps: 15, rest: 45 },
          { name: "Flexão de Braços", sets: 4, reps: 15, rest: 60 },
          { name: "Abdominal Supra (Crunch)", sets: 4, reps: 25, rest: 30 },
          { name: "Polichinelos", sets: 3, reps: 50, rest: 30 },
          { name: "Prancha Abdominal", sets: 3, reps: 45, rest: 30 },
        ]},
      ]
    },
    {
      name: "Foco em Glúteos (Booty Builder)",
      description: "Treino especializado para hipertrofia de glúteos e posterior de coxa.",
      category: "Especializado",
      difficulty: "Intermediário",
      days: [
        { name: "Foco Glúteo A", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Elevação Pélvica", sets: 4, reps: 12, rest: 90 },
          { name: "Agachamento Sumô", sets: 4, reps: 12, rest: 60 },
          { name: "Levantamento Terra Romeno", sets: 4, reps: 10, rest: 90 },
          { name: "Cadeira Abdutora", sets: 4, reps: 20, rest: 45 },
          { name: "Afundo com Halteres", sets: 3, reps: 12, rest: 60 },
          { name: "Cadeira Adutora", sets: 3, reps: 15, rest: 45 },
        ]},
      ]
    },
    {
      name: "Explosão de Braços (Arm Blast)",
      description: "Treino focado exclusivamente no aumento do diâmetro dos braços.",
      category: "Especializado",
      difficulty: "Intermediário",
      days: [
        { name: "Bíceps e Tríceps", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Rosca Direta com Barra W", sets: 4, reps: 10, rest: 60 },
          { name: "Tríceps Testa", sets: 4, reps: 10, rest: 60 },
          { name: "Rosca Martelo", sets: 3, reps: 12, rest: 60 },
          { name: "Tríceps Corda na Polia", sets: 3, reps: 12, rest: 60 },
          { name: "Rosca Concentrada", sets: 3, reps: 12, rest: 45 },
          { name: "Rosca Inversa", sets: 3, reps: 15, rest: 45 },
        ]},
      ]
    },

    // --- CATEGORIA: BEM-ESTAR ---
    {
      name: "Yoga e Mobilidade Ativa",
      description: "Melhore sua flexibilidade, consciência corporal e reduza o estresse.",
      category: "Bem-estar",
      difficulty: "Iniciante",
      days: [
        { name: "Fluxo de Mobilidade", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Saudação ao Sol", sets: 5, reps: 1, rest: 30 },
          { name: "Cachorro Olhando para Baixo", sets: 3, reps: 5, rest: 30 },
          { name: "Postura do Guerreiro I", sets: 3, reps: 5, rest: 30 },
          { name: "Gato-Vaca", sets: 3, reps: 10, rest: 0 },
          { name: "Mobilidade de Quadril 90/90", sets: 3, reps: 10, rest: 0 },
          { name: "Alongamento Cobra", sets: 3, reps: 5, rest: 30 },
          { name: "Postura da Criança", sets: 1, reps: 1, rest: 120 },
        ]},
      ]
    },
    {
      name: "Sênior Ativo (Terceira Idade)",
      description: "Treino seguro focado em independência, equilíbrio e força básica.",
      category: "Bem-estar",
      difficulty: "Iniciante",
      days: [
        { name: "Força e Equilíbrio", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Sentar e Levantar da Cadeira", sets: 3, reps: 12, rest: 60 },
          { name: "Marcha no Lugar", sets: 3, reps: 30, rest: 60 },
          { name: "Equilíbrio Unipodal", sets: 3, reps: 1, rest: 30 },
          { name: "Rosca Direta com Barra W", sets: 3, reps: 12, rest: 60 },
          { name: "Desenvolvimento com Halteres", sets: 3, reps: 10, rest: 60 },
          { name: "Rotação de Tronco Sentado", sets: 3, reps: 15, rest: 30 },
        ]},
      ]
    },
    {
      name: "Correção de Postura e Core",
      description: "Fortaleça a musculatura estabilizadora e melhore sua postura diária.",
      category: "Bem-estar",
      difficulty: "Iniciante",
      days: [
        { name: "Estabilização", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Prancha Abdominal", sets: 4, reps: 45, rest: 45 },
          { name: "Superman (Extensão Lombar)", sets: 4, reps: 15, rest: 45 },
          { name: "Face Pull", sets: 4, reps: 15, rest: 45 },
          { name: "Puxada Triângulo", sets: 3, reps: 12, rest: 60 },
          { name: "Remada Baixa na Polia", sets: 3, reps: 15, rest: 45 },
          { name: "Gato-Vaca", sets: 3, reps: 10, rest: 30 },
        ]},
      ]
    },

    // --- CATEGORIA: PERFORMANCE ---
    {
      name: "Artes Marciais: Condicionamento",
      description: "Treino focado em resistência cardiovascular e potência para lutadores.",
      category: "Performance",
      difficulty: "Intermediário",
      days: [
        { name: "Condicionamento de Luta", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Sombra de Boxe", sets: 3, reps: 1, rest: 60 },
          { name: "Burpees", sets: 4, reps: 20, rest: 45 },
          { name: "Sprawl", sets: 4, reps: 15, rest: 45 },
          { name: "Mountain Climbers", sets: 4, reps: 40, rest: 30 },
          { name: "Flexão de Braços", sets: 4, reps: 20, rest: 60 },
          { name: "Elevação de Pernas", sets: 4, reps: 20, rest: 45 },
        ]},
      ]
    },
    {
      name: "Cross Training: WOD Style",
      description: "Otimize sua performance geral com treinos variados e alta intensidade.",
      category: "Performance",
      difficulty: "Avançado",
      days: [
        { name: "Metcon", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Thrusters", sets: 5, reps: 10, rest: 60 },
          { name: "Wall Ball", sets: 5, reps: 15, rest: 60 },
          { name: "Box Jump", sets: 5, reps: 12, rest: 60 },
          { name: "Kettlebell Swing", sets: 5, reps: 20, rest: 60 },
          { name: "Barra Fixa", sets: 3, reps: 10, rest: 90 },
          { name: "Burpees", sets: 3, reps: 15, rest: 90 },
        ]},
      ]
    },
    {
      name: "Full Body 3x: Frequência Total",
      description: "Treine o corpo todo três vezes por semana para resultados consistentes.",
      category: "Hipertrofia",
      difficulty: "Iniciante",
      days: [
        { name: "Corpo Inteiro A", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Agachamento Livre com Barra", sets: 3, reps: 12, rest: 90 },
          { name: "Supino Reto com Barra", sets: 3, reps: 12, rest: 90 },
          { name: "Remada Curvada com Barra", sets: 3, reps: 12, rest: 90 },
          { name: "Desenvolvimento com Halteres", sets: 3, reps: 12, rest: 60 },
          { name: "Rosca Martelo", sets: 3, reps: 12, rest: 60 },
          { name: "Prancha Abdominal", sets: 3, reps: 60, rest: 45 },
        ]},
      ]
    },
    {
      name: "Endurance: Preparação para Corrida",
      description: "Fortaleça a musculatura necessária para correr com eficiência e sem lesões.",
      category: "Performance",
      difficulty: "Intermediário",
      days: [
        { name: "Base e Estabilidade", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Afundo com Halteres", sets: 4, reps: 15, rest: 60 },
          { name: "Levantamento Terra Romeno", sets: 4, reps: 12, rest: 60 },
          { name: "Elevação de Panturrilha em Pé", sets: 4, reps: 20, rest: 45 },
          { name: "Lunge Reverso", sets: 3, reps: 15, rest: 45 },
          { name: "Prancha Lateral", sets: 4, reps: 45, rest: 30 },
          { name: "Equilíbrio Unipodal", sets: 3, reps: 1, rest: 30 },
        ]},
      ]
    },
    {
      name: "Kettlebell Full Body",
      description: "Treino dinâmico usando apenas Kettlebells para força e cardio.",
      category: "Especializado",
      difficulty: "Intermediário",
      days: [
        { name: "Fluxo de Kettlebell", weekDay: WeekDay.MONDAY, exercises: [
          { name: "Kettlebell Swing", sets: 5, reps: 20, rest: 45 },
          { name: "Agachamento Sumô", sets: 4, reps: 15, rest: 60 },
          { name: "Remada Unilateral com Halter (Serrote)", sets: 4, reps: 12, rest: 45 },
          { name: "Desenvolvimento com Halteres", sets: 4, reps: 12, rest: 45 },
          { name: "Burpees", sets: 3, reps: 15, rest: 60 },
          { name: "Mountain Climbers", sets: 3, reps: 30, rest: 30 },
        ]},
      ]
    },
  ];

  for (const t of templates) {
    await prisma.workoutTemplate.create({
      data: {
        name: t.name,
        description: t.description,
        category: t.category,
        difficulty: t.difficulty,
        days: {
          create: t.days.map((d) => ({
            name: d.name,
            weekDay: d.weekDay,
            estimatedDurationInSeconds: d.exercises.length * 600, // Estimativa simples
            exercises: {
              create: d.exercises.map((e, index) => ({
                name: e.name,
                order: index + 1,
                sets: e.sets,
                reps: e.reps,
                restTimeInSeconds: e.rest,
              })),
            },
          })),
        },
      },
    });
  }

  console.log("✅ Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
