import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NutrientDisplayProps {
  nutrients: {
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  className?: string;
}

export function NutrientDisplay({ nutrients, className }: NutrientDisplayProps) {
  if (!nutrients || (!nutrients.calories && !nutrients.protein && !nutrients.carbohydrates && !nutrients.fat)) {
    return null;
  }

  const macros = [
    { name: 'Calorias', value: nutrients.calories, unit: 'kcal', color: 'text-red-600' },
    { name: 'Proteínas', value: nutrients.protein, unit: 'g', color: 'text-blue-600' },
    { name: 'Carboidratos', value: nutrients.carbohydrates, unit: 'g', color: 'text-green-600' },
    { name: 'Gorduras', value: nutrients.fat, unit: 'g', color: 'text-yellow-600' },
  ];

  const micronutrients = [
    { name: 'Fibras', value: nutrients.fiber, unit: 'g' },
    { name: 'Açúcares', value: nutrients.sugar, unit: 'g' },
    { name: 'Sódio', value: nutrients.sodium, unit: 'mg' },
  ].filter(item => item.value && item.value > 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Informações Nutricionais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {macros.map((macro) => (
            macro.value ? (
              <div key={macro.name} className="text-center p-2 bg-neutral-50 rounded-lg">
                <div className={`text-lg font-bold ${macro.color}`}>
                  {Math.round(macro.value)}
                </div>
                <div className="text-xs text-neutral-600">
                  {macro.name} ({macro.unit})
                </div>
              </div>
            ) : null
          ))}
        </div>
        
        {micronutrients.length > 0 && (
          <div className="pt-2 border-t border-neutral-200">
            <div className="text-xs font-medium text-neutral-700 mb-2">Outros Nutrientes</div>
            <div className="space-y-1">
              {micronutrients.map((nutrient) => (
                <div key={nutrient.name} className="flex justify-between text-xs">
                  <span className="text-neutral-600">{nutrient.name}:</span>
                  <span className="font-medium">{Math.round(nutrient.value!)} {nutrient.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NutrientDisplay;