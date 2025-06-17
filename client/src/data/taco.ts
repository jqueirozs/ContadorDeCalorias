export interface Food {
  id: number;
  name: string;
  calories: number; // kcal per 100g
  protein: number;  // g per 100g
  carbs: number;    // g per 100g
  fat: number;      // g per 100g
}

const foods: Food[] = [
  { id: 1, name: "Arroz branco cozido", calories: 128, protein: 2.5, carbs: 28.1, fat: 0.3 },
  { id: 2, name: "Feij\u00e3o carioca cozido", calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5 },
  { id: 3, name: "Ma\u00e7\u00e3", calories: 65, protein: 0.2, carbs: 17.5, fat: 0.1 },
  { id: 4, name: "Banana", calories: 92, protein: 1.3, carbs: 23.0, fat: 0.3 },
  { id: 5, name: "P\u00e3o franc\u00eas", calories: 270, protein: 8.0, carbs: 57.0, fat: 1.5 },
  { id: 6, name: "Ovo de galinha, cozido", calories: 146, protein: 13.3, carbs: 0.6, fat: 9.5 },
  { id: 7, name: "Leite integral", calories: 61, protein: 3.2, carbs: 4.4, fat: 3.3 },
  { id: 8, name: "Peito de frango grelhado", calories: 165, protein: 31.0, carbs: 0, fat: 3.6 },
  { id: 9, name: "Queijo mussarela", calories: 321, protein: 23.0, carbs: 3.1, fat: 23.2 },
  { id: 10, name: "Batata doce cozida", calories: 77, protein: 0.6, carbs: 18.4, fat: 0.1 },
];

export default foods;
