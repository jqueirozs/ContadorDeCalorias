import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface NutrientInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface MealPhotoAnalysis {
  foods: string[];
  description: string;
  mealType?: string;
  estimatedPortions: string[];
  nutrients: NutrientInfo;
  confidence: number;
}

export async function analyzeMealPhoto(base64Image: string): Promise<MealPhotoAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em nutrição especializado em analisar fotos de alimentos. 

Sua tarefa é:
1. Identificar todos os alimentos visíveis na imagem
2. Estimar tamanhos de porções e quantidades
3. Calcular informações nutricionais por 100g e porções totais estimadas
4. Determinar o tipo de refeição mais provável
5. Fornecer uma descrição natural da refeição

REGRAS IMPORTANTES:
- Seja conservador com estimativas de calorias - é melhor subestimar do que superestimar
- Considere tamanhos de porções e alimentos típicos brasileiros
- Se não conseguir identificar claramente um alimento, mencione como "item não identificado"
- Forneça valores nutricionais realistas baseados em bancos de dados padrão de alimentos
- Dê nível de confiança baseado na qualidade da imagem e visibilidade dos alimentos
- SEMPRE responda em português brasileiro

Responda SEMPRE em JSON com este formato exato:
{
  "foods": ["array de alimentos identificados em português"],
  "description": "descrição natural da refeição em português",
  "mealType": "breakfast|lunch|dinner|snack|null",
  "estimatedPortions": ["descrições de porções como '1 xícara de arroz', '150g de frango'"],
  "nutrients": {
    "calories": number,
    "protein": number,
    "carbohydrates": number, 
    "fat": number,
    "fiber": number,
    "sugar": number,
    "sodium": number
  },
  "confidence": number_between_0_and_1
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analise esta foto de refeição e forneça informações nutricionais detalhadas em português."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      foods: result.foods || [],
      description: result.description || "Meal não identificada",
      mealType: result.mealType || undefined,
      estimatedPortions: result.estimatedPortions || [],
      nutrients: {
        calories: result.nutrients?.calories || 0,
        protein: result.nutrients?.protein || 0,
        carbohydrates: result.nutrients?.carbohydrates || 0,
        fat: result.nutrients?.fat || 0,
        fiber: result.nutrients?.fiber || 0,
        sugar: result.nutrients?.sugar || 0,
        sodium: result.nutrients?.sodium || 0,
      },
      confidence: result.confidence || 0.5
    };
  } catch (error) {
    console.error("Error analyzing meal photo:", error);
    throw new Error("Failed to analyze meal photo");
  }
}

export function convertImageToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}