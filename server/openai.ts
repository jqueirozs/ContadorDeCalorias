import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface UserData {
  stats: {
    currentWeight: number | null;
    totalPoints: number;
    exercisesCompleted: number;
    mealsToday: number;
    reflectionCompleted: boolean;
  };
  weightEntries: Array<{
    weight: string;
    date: string;
    notes?: string;
  }>;
  meals: Array<{
    type: string;
    foods: string;
    date: string;
    time: string;
  }>;
  reflection?: {
    moodRating?: number;
    hungerLevel?: number;
    stressLevel?: number;
    exerciseMinutes?: number;
    challenges?: string;
    achievements?: string;
    notes?: string;
  } | null;
}

export async function generateInsights(userData: UserData): Promise<{
  summary: string;
  patterns: string[];
  suggestions: string[];
  alerts: string[];
}> {
  try {
    const prompt = `
    Você é um assistente de saúde especializado em emagrecimento inteligente. Analise os dados do usuário abaixo e forneça insights personalizados em português brasileiro.

    Dados do usuário:
    - Peso atual: ${userData.stats.currentWeight ? `${userData.stats.currentWeight} kg` : 'Não informado'}
    - Pontos totais: ${userData.stats.totalPoints}
    - Exercícios mentais completados hoje: ${userData.stats.exercisesCompleted}/10
    - Refeições registradas hoje: ${userData.stats.mealsToday}
    - Reflexão do dia preenchida: ${userData.stats.reflectionCompleted ? 'Sim' : 'Não'}

    Histórico de peso (últimos 7 dias):
    ${userData.weightEntries.map(entry => `${entry.date}: ${entry.weight} kg`).join('\n')}

    Últimas refeições:
    ${userData.meals.map(meal => `${meal.date} ${meal.time} - ${meal.type}: ${meal.foods}`).join('\n')}

    Reflexão de hoje:
    ${userData.reflection ? `
    - Humor (1-5): ${userData.reflection.moodRating || 'Não informado'}
    - Nível de fome (1-5): ${userData.reflection.hungerLevel || 'Não informado'}
    - Nível de estresse (1-5): ${userData.reflection.stressLevel || 'Não informado'}
    - Minutos de exercício: ${userData.reflection.exerciseMinutes || 'Não informado'}
    - Desafios: ${userData.reflection.challenges || 'Nenhum'}
    - Conquistas: ${userData.reflection.achievements || 'Nenhuma'}
    - Observações: ${userData.reflection.notes || 'Nenhuma'}
    ` : 'Não preenchida'}

    Forneça uma análise estruturada em JSON com:
    1. "summary": Um resumo geral do progresso (máximo 100 palavras)
    2. "patterns": Array de 2-3 padrões comportamentais identificados
    3. "suggestions": Array de 3-4 sugestões personalizadas para melhorar
    4. "alerts": Array de 0-2 alertas importantes (se houver)

    Seja encorajador, específico e focado em ações práticas.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um assistente de saúde especializado em emagrecimento inteligente. Sempre responda em português brasileiro de forma empática e motivacional. Responda sempre em JSON válido."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      summary: result.summary || "Análise não disponível no momento.",
      patterns: result.patterns || [],
      suggestions: result.suggestions || [],
      alerts: result.alerts || [],
    };
  } catch (error) {
    console.error("Error generating insights:", error);
    return {
      summary: "Não foi possível gerar insights no momento. Tente novamente mais tarde.",
      patterns: [],
      suggestions: [
        "Continue registrando suas refeições diariamente",
        "Complete os exercícios mentais para fortalecer sua motivação",
        "Preencha o espelho do comportamento todos os dias"
      ],
      alerts: [],
    };
  }
}
