export interface ParsedMealData {
  type?: string;
  foods?: string;
  time?: string;
  calories?: number;
}

export function parseMealFromVoice(text: string): ParsedMealData {
  const lowercaseText = text.toLowerCase().trim();
  const result: ParsedMealData = {};

  // Parse meal type
  if (lowercaseText.includes('café da manhã') || lowercaseText.includes('café') || lowercaseText.includes('manhã')) {
    result.type = 'breakfast';
  } else if (lowercaseText.includes('almoço') || lowercaseText.includes('almoçar')) {
    result.type = 'lunch';
  } else if (lowercaseText.includes('jantar') || lowercaseText.includes('janta')) {
    result.type = 'dinner';
  } else if (lowercaseText.includes('lanche') || lowercaseText.includes('lanchei') || lowercaseText.includes('merenda')) {
    result.type = 'snack';
  } else if (lowercaseText.includes('ceia')) {
    result.type = 'supper';
  }

  // Parse time patterns
  const timePatterns = [
    /(\d{1,2}):(\d{2})/g,                    // 14:30
    /(\d{1,2})h(\d{2})/g,                    // 14h30
    /(\d{1,2}) horas? e (\d{2})/g,           // 14 horas e 30
    /(\d{1,2}) e (\d{2})/g,                  // 14 e 30
    /(\d{1,2}) horas?/g,                     // 14 horas
    /meio[- ]?dia/g,                         // meio-dia, meio dia
    /meia[- ]?noite/g                        // meia-noite, meia noite
  ];

  for (const pattern of timePatterns) {
    const match = pattern.exec(lowercaseText);
    if (match) {
      if (pattern.source.includes('meio') && pattern.source.includes('dia')) {
        result.time = '12:00';
        break;
      } else if (pattern.source.includes('meia') && pattern.source.includes('noite')) {
        result.time = '00:00';
        break;
      } else if (match[2]) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          result.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          break;
        }
      } else if (match[1]) {
        const hours = parseInt(match[1]);
        if (hours >= 0 && hours <= 23) {
          result.time = `${hours.toString().padStart(2, '0')}:00`;
          break;
        }
      }
    }
  }

  // Parse calories
  const caloriePatterns = [
    /(\d+)\s*(?:calorias?|kcal|cal)/g,
    /(\d+)\s*cal\b/g
  ];

  for (const pattern of caloriePatterns) {
    const match = pattern.exec(lowercaseText);
    if (match) {
      result.calories = parseInt(match[1]);
      break;
    }
  }

  // Extract foods (remove meal type, time, and calorie mentions)
  let foodText = text;
  
  // Remove meal type keywords
  const mealTypeKeywords = [
    'café da manhã', 'café', 'manhã', 'almoço', 'almoçar', 'jantar', 'janta', 
    'lanche', 'lanchei', 'merenda', 'ceia', 'no', 'do', 'da', 'de', 'para', 'às', 'as'
  ];
  
  mealTypeKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    foodText = foodText.replace(regex, '');
  });

  // Remove time mentions
  timePatterns.forEach(pattern => {
    foodText = foodText.replace(pattern, '');
  });

  // Remove calorie mentions
  caloriePatterns.forEach(pattern => {
    foodText = foodText.replace(pattern, '');
  });

  // Remove common connecting words and clean up
  const connectingWords = ['comi', 'comer', 'consumir', 'consumo', 'tomar', 'tomo', 'beber', 'bebo', 'às', 'as', 'com', 'e', 'mais'];
  connectingWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    foodText = foodText.replace(regex, '');
  });

  // Clean up extra spaces and punctuation
  foodText = foodText
    .replace(/[,;.!?]/g, ',')
    .replace(/\s+/g, ' ')
    .replace(/,+/g, ',')
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .trim();

  if (foodText && foodText.length > 2) {
    result.foods = foodText;
  }

  return result;
}

export function generateVoicePrompt(currentData?: Partial<ParsedMealData>): string {
  const examples = [
    "Almoço às 13:30 com arroz, feijão e frango",
    "Café da manhã com pão, manteiga e café",
    "Lanche às 15h com maçã e iogurte",
    "Jantar às 19:00 com salada e peixe grelhado"
  ];

  let prompt = "Fale naturalmente sobre sua refeição. Exemplos:\n\n";
  prompt += examples.map(ex => `• "${ex}"`).join('\n');
  
  if (!currentData?.type) {
    prompt += "\n\nDica: Mencione o tipo de refeição (café da manhã, almoço, jantar, lanche)";
  }
  
  if (!currentData?.time) {
    prompt += "\n\nDica: Inclua o horário (ex: 13:30, 13h30, 1 da tarde)";
  }

  return prompt;
}