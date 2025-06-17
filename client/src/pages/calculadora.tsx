import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import foods, { Food } from "@/data/taco";

export default function Calculadora() {
  const [foodId, setFoodId] = useState("");
  const [grams, setGrams] = useState("");

  const selectedFood: Food | undefined = foods.find(f => f.id === parseInt(foodId));
  const amount = parseFloat(grams) || 0;
  const factor = amount / 100;

  const calories = selectedFood ? selectedFood.calories * factor : 0;
  const protein = selectedFood ? selectedFood.protein * factor : 0;
  const carbs = selectedFood ? selectedFood.carbs * factor : 0;
  const fat = selectedFood ? selectedFood.fat * factor : 0;

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 overflow-auto">
        <header className="bg-white shadow-sm border-b border-neutral-200 p-6">
          <h2 className="text-2xl font-semibold text-neutral-800">Calculadora de Calorias</h2>
          <p className="text-neutral-600 mt-1">Calcule rapidamente a energia e macros dos alimentos</p>
        </header>
        <main className="p-6 space-y-6">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Calcule sua porção</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Alimento</label>
                <Select value={foodId} onValueChange={setFoodId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {foods.map(food => (
                      <SelectItem key={food.id} value={String(food.id)}>
                        {food.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Quantidade (g)</label>
                <Input
                  type="number"
                  min="0"
                  value={grams}
                  onChange={e => setGrams(e.target.value)}
                  placeholder="Ex: 100"
                />
              </div>
              {selectedFood && amount > 0 && (
                <div className="space-y-4 pt-2">
                  <p className="text-center text-lg font-medium">Calorias</p>
                  <p className="text-center text-4xl font-bold text-primary">
                    {calories.toFixed(1)} kcal
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-neutral-500">Proteína</p>
                      <p className="font-medium">{protein.toFixed(1)} g</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Carboidratos</p>
                      <p className="font-medium">{carbs.toFixed(1)} g</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Gorduras</p>
                      <p className="font-medium">{fat.toFixed(1)} g</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
