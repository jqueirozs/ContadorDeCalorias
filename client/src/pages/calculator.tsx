
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Info } from "lucide-react";

// Dados simplificados da Tabela TACO (por 100g)
const tacoFoods = [
  {
    id: "arroz_branco",
    name: "Arroz branco cozido",
    calories: 128,
    protein: 2.5,
    carbs: 25.8,
    fat: 0.2,
    fiber: 1.6
  },
  {
    id: "feijao_preto",
    name: "Feijão preto cozido",
    calories: 77,
    protein: 4.5,
    carbs: 14.0,
    fat: 0.5,
    fiber: 8.4
  },
  {
    id: "frango_peito",
    name: "Frango, peito sem pele",
    calories: 159,
    protein: 32.8,
    carbs: 0.0,
    fat: 3.2,
    fiber: 0.0
  },
  {
    id: "carne_bovina",
    name: "Carne bovina, músculo",
    calories: 219,
    protein: 26.4,
    carbs: 0.0,
    fat: 12.0,
    fiber: 0.0
  },
  {
    id: "ovo_galinha",
    name: "Ovo de galinha inteiro",
    calories: 155,
    protein: 13.0,
    carbs: 1.6,
    fat: 11.0,
    fiber: 0.0
  },
  {
    id: "banana_nanica",
    name: "Banana nanica",
    calories: 92,
    protein: 1.3,
    carbs: 23.0,
    fat: 0.1,
    fiber: 2.0
  },
  {
    id: "maca_fuji",
    name: "Maçã Fuji com casca",
    calories: 56,
    protein: 0.3,
    carbs: 15.0,
    fat: 0.1,
    fiber: 2.0
  },
  {
    id: "batata_inglesa",
    name: "Batata inglesa cozida",
    calories: 52,
    protein: 1.4,
    carbs: 11.0,
    fat: 0.1,
    fiber: 1.3
  },
  {
    id: "aveia_flocos",
    name: "Aveia em flocos crua",
    calories: 394,
    protein: 13.9,
    carbs: 66.6,
    fat: 8.5,
    fiber: 9.1
  },
  {
    id: "leite_integral",
    name: "Leite de vaca integral",
    calories: 61,
    protein: 2.9,
    carbs: 4.3,
    fat: 3.2,
    fiber: 0.0
  },
  {
    id: "pao_frances",
    name: "Pão francês",
    calories: 300,
    protein: 8.0,
    carbs: 58.0,
    fat: 3.1,
    fiber: 2.3
  },
  {
    id: "queijo_minas",
    name: "Queijo Minas frescal",
    calories: 264,
    protein: 17.4,
    carbs: 3.8,
    fat: 20.0,
    fiber: 0.0
  },
  {
    id: "tomate",
    name: "Tomate cru",
    calories: 15,
    protein: 1.1,
    carbs: 3.1,
    fat: 0.2,
    fiber: 1.2
  },
  {
    id: "alface",
    name: "Alface crespa",
    calories: 8,
    protein: 1.0,
    carbs: 1.7,
    fat: 0.2,
    fiber: 2.0
  },
  {
    id: "cenoura",
    name: "Cenoura crua",
    calories: 34,
    protein: 1.3,
    carbs: 7.7,
    fat: 0.2,
    fiber: 3.2
  }
];

export default function Calculator() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedFood, setSelectedFood] = useState("");
  const [quantity, setQuantity] = useState("");
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const calculateNutrition = () => {
    if (!selectedFood || !quantity) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um alimento e informe a quantidade.",
        variant: "destructive",
      });
      return;
    }

    const food = tacoFoods.find(f => f.id === selectedFood);
    if (!food) return;

    const grams = parseFloat(quantity);
    if (isNaN(grams) || grams <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "Informe uma quantidade válida em gramas.",
        variant: "destructive",
      });
      return;
    }

    const multiplier = grams / 100;

    setResults({
      food: food.name,
      quantity: grams,
      calories: Math.round(food.calories * multiplier * 10) / 10,
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10,
      fiber: Math.round(food.fiber * multiplier * 10) / 10
    });
  };

  const clearCalculation = () => {
    setSelectedFood("");
    setQuantity("");
    setResults(null);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-auto">
        <header className="bg-white shadow-sm border-b border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-800">Calculadora de Calorias</h2>
              <p className="text-neutral-600 mt-1">Calcule os valores nutricionais dos alimentos usando a Tabela TACO</p>
            </div>
            <Calculator className="w-8 h-8 text-primary" />
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Formulário de Cálculo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5" />
                  <span>Calculadora Nutricional</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="food" className="block text-sm font-medium text-neutral-700 mb-2">
                      Selecione o Alimento
                    </Label>
                    <Select value={selectedFood} onValueChange={setSelectedFood}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um alimento..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tacoFoods.map((food) => (
                          <SelectItem key={food.id} value={food.id}>
                            {food.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quantity" className="block text-sm font-medium text-neutral-700 mb-2">
                      Quantidade (gramas)
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      step="0.1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Ex: 100"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button onClick={calculateNutrition} className="bg-primary hover:bg-primary/90">
                    <Calculator className="w-4 h-4 mr-2" />
                    Calcular
                  </Button>
                  <Button variant="outline" onClick={clearCalculation}>
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resultados */}
            {results && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultados Nutricionais</CardTitle>
                  <p className="text-neutral-600">
                    {results.food} - {results.quantity}g
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Calorias em Destaque */}
                  <div className="mb-6 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border-2 border-primary/20">
                    <div className="text-center">
                      <p className="text-lg font-medium text-neutral-600 mb-2">Calorias</p>
                      <p className="text-4xl font-bold text-primary">{results.calories}</p>
                      <p className="text-sm text-neutral-500 mt-1">kcal</p>
                    </div>
                  </div>

                  {/* Macronutrientes */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-neutral-50 rounded-lg">
                      <p className="text-sm font-medium text-neutral-600 mb-1">Proteínas</p>
                      <p className="text-2xl font-semibold text-neutral-800">{results.protein}g</p>
                    </div>
                    
                    <div className="text-center p-4 bg-neutral-50 rounded-lg">
                      <p className="text-sm font-medium text-neutral-600 mb-1">Carboidratos</p>
                      <p className="text-2xl font-semibold text-neutral-800">{results.carbs}g</p>
                    </div>
                    
                    <div className="text-center p-4 bg-neutral-50 rounded-lg">
                      <p className="text-sm font-medium text-neutral-600 mb-1">Gorduras</p>
                      <p className="text-2xl font-semibold text-neutral-800">{results.fat}g</p>
                    </div>
                    
                    <div className="text-center p-4 bg-neutral-50 rounded-lg">
                      <p className="text-sm font-medium text-neutral-600 mb-1">Fibras</p>
                      <p className="text-2xl font-semibold text-neutral-800">{results.fiber}g</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informações sobre a Tabela TACO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="w-5 h-5" />
                  <span>Sobre a Tabela TACO</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Esta calculadora utiliza dados da Tabela Brasileira de Composição de Alimentos (TACO), 
                  desenvolvida pela UNICAMP. Os valores são baseados em 100g de cada alimento e foram 
                  adaptados para fornecer informações nutricionais precisas para suas porções.
                </p>
                <p className="text-neutral-600 mt-2">
                  <strong>Nota:</strong> Os valores podem variar dependendo da origem, variedade e preparo do alimento.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
