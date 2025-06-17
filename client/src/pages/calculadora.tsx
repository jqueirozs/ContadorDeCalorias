import { useState } from "react";
import tacoData from "@/data/taco.json";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface TacoItem {
  id: number;
  alimento: string;
  kcal: number;
  proteina: number;
  carboidrato: number;
  lipidio: number;
}

export default function Calculadora() {
  const [foodId, setFoodId] = useState<number | null>(null);
  const [grams, setGrams] = useState(100);

  const selectedFood = tacoData.find((f: TacoItem) => f.id === foodId);
  const factor = grams / 100;

  const calories = selectedFood ? selectedFood.kcal * factor : 0;
  const protein = selectedFood ? selectedFood.proteina * factor : 0;
  const carbs = selectedFood ? selectedFood.carboidrato * factor : 0;
  const fat = selectedFood ? selectedFood.lipidio * factor : 0;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calculadora de Calorias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Alimento</Label>
            <Select onValueChange={(val) => setFoodId(parseInt(val))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o alimento" />
              </SelectTrigger>
              <SelectContent>
                {tacoData.map((item: TacoItem) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.alimento}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Quantidade (g)</Label>
            <Input
              type="number"
              value={grams}
              onChange={(e) => setGrams(parseFloat(e.target.value) || 0)}
              min={0}
            />
          </div>

          {selectedFood && (
            <div className="space-y-2 mt-4">
              <div className="text-3xl font-bold text-primary">
                {calories.toFixed(1)} kcal
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  Proteína: {protein.toFixed(1)} g
                </div>
                <div>
                  Carboidrato: {carbs.toFixed(1)} g
                </div>
                <div>
                  Gorduras: {fat.toFixed(1)} g
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
