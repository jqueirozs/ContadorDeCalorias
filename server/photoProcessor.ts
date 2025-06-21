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
          content: `You are a nutrition expert specialized in analyzing food photos. 

Your task is to:
1. Identify all visible foods in the image
2. Estimate portion sizes and quantities
3. Calculate nutritional information per 100g and total estimated portions
4. Determine the most likely meal type
5. Provide a natural description of the meal

IMPORTANT RULES:
- Be conservative with calorie estimates - it's better to underestimate than overestimate
- Consider typical Brazilian portion sizes and foods
- If you can't clearly identify a food, mention it as "unidentified item"
- Provide realistic nutritional values based on standard food databases
- Give confidence level based on image quality and food visibility

Respond ALWAYS in JSON with this exact format:
{
  "foods": ["array of identified foods"],
  "description": "natural description of the meal",
  "mealType": "breakfast|lunch|dinner|snack|null",
  "estimatedPortions": ["portion descriptions like '1 cup rice', '150g chicken'"],
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
              text: "Analyze this meal photo and provide detailed nutritional information."
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