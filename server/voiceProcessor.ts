import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function processVoiceTranscription(transcript: string): Promise<{
  formattedDescription: string;
  mealType?: string;
  time?: string;
  calories?: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um assistente especializado em processar transcrições de voz sobre refeições. 
          
Sua tarefa é:
1. Corrigir erros de transcrição e gramaticais
2. Extrair informações estruturadas da refeição
3. Formatar a descrição dos alimentos de forma clara e apetitosa

REGRAS IMPORTANTES:
- Mantenha apenas os alimentos na descrição, removendo informações de horário e tipo de refeição
- Corrija erros de português e formatação
- Use vírgulas para separar alimentos diferentes
- Capitalize adequadamente os nomes dos alimentos
- Se houver quantidades, mantenha-as de forma clara
- Torne a descrição mais natural e bem formatada

Responda SEMPRE em JSON com este formato exato:
{
  "formattedDescription": "descrição corrigida e formatada dos alimentos",
  "mealType": "breakfast|lunch|dinner|snack|supper ou null",
  "time": "HH:MM ou null", 
  "calories": número ou null
}`
        },
        {
          role: "user",
          content: `Processe esta transcrição de refeição: "${transcript}"`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      formattedDescription: result.formattedDescription || transcript,
      mealType: result.mealType || undefined,
      time: result.time || undefined,
      calories: result.calories || undefined
    };
  } catch (error) {
    console.error("Error processing voice transcription:", error);
    // Fallback to original logic if OpenAI fails
    return {
      formattedDescription: transcript,
    };
  }
}