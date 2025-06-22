import { useState } from "react";
import tacoData from "@/data/taco.json";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Activity, User } from "lucide-react";

interface TacoItem {
  id: number;
  alimento: string;
  kcal: number;
  proteina: number;
  carboidrato: number;
  lipidio: number;
}

type CalculatorType = 'main' | 'calories' | 'expenditure' | 'bmi';

export default function Calculadora() {
  const [currentView, setCurrentView] = useState<CalculatorType>('main');

  // Calorie Calculator State
  const [foodId, setFoodId] = useState<number | null>(null);
  const [grams, setGrams] = useState(100);

  // BMI Calculator State
  const [bmiGender, setBmiGender] = useState<'male' | 'female'>('male');
  const [bmiAge, setBmiAge] = useState(29);
  const [bmiHeight, setBmiHeight] = useState(178);
  const [bmiWeight, setBmiWeight] = useState(90);
  const [bmiResult, setBmiResult] = useState<number | null>(null);

  // Expenditure Calculator State
  const [expGender, setExpGender] = useState<'male' | 'female'>('male');
  const [expAge, setExpAge] = useState(29);
  const [expHeight, setExpHeight] = useState(178);
  const [expWeight, setExpWeight] = useState(90);
  const [activityLevel, setActivityLevel] = useState<string>('moderate');
  const [goal, setGoal] = useState<string>('lose');
  const [expResult, setExpResult] = useState<{ daily: number; bmr: number } | null>(null);

  const selectedFood = tacoData.find((f: TacoItem) => f.id === foodId);
  const factor = grams / 100;

  const calories = selectedFood ? selectedFood.kcal * factor : 0;
  const protein = selectedFood ? selectedFood.proteina * factor : 0;
  const carbs = selectedFood ? selectedFood.carboidrato * factor : 0;
  const fat = selectedFood ? selectedFood.lipidio * factor : 0;

  const calculateBMI = () => {
    const heightInMeters = bmiHeight / 100;
    const bmi = bmiWeight / (heightInMeters * heightInMeters);
    setBmiResult(bmi);
  };

  const calculateExpenditure = () => {
    // Harris-Benedict Formula
    let bmr: number;
    if (expGender === 'male') {
      bmr = 88.362 + (13.397 * expWeight) + (4.799 * expHeight) - (5.677 * expAge);
    } else {
      bmr = 447.593 + (9.247 * expWeight) + (3.098 * expHeight) - (4.330 * expAge);
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      intense: 1.725,
      extreme: 1.9
    };

    const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.55;
    let dailyCalories = bmr * multiplier;

    // Adjust for goal
    if (goal === 'lose') {
      dailyCalories -= 500; // 500 calorie deficit for weight loss
    } else if (goal === 'gain') {
      dailyCalories += 500; // 500 calorie surplus for weight gain
    }

    setExpResult({ daily: dailyCalories, bmr });
  };

  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.6) return { text: 'Abaixo do normal', color: 'text-blue-600' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { text: 'Sobrepeso', color: 'text-orange-600' };
    if (bmi < 35) return { text: 'Obesidade grau 1', color: 'text-red-600' };
    if (bmi < 40) return { text: 'Obesidade grau 2', color: 'text-red-700' };
    return { text: 'Obesidade grau 3', color: 'text-red-800' };
  };

  const getIdealWeight = (height: number, gender: 'male' | 'female') => {
    // Devine Formula
    if (gender === 'male') {
      return 50 + 2.3 * ((height - 152.4) / 2.54);
    } else {
      return 45.5 + 2.3 * ((height - 152.4) / 2.54);
    }
  };

  if (currentView === 'main') {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-cyan-200 bg-cyan-50"
            onClick={() => setCurrentView('calories')}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Calculator className="h-8 w-8 text-cyan-600 mr-3" />
                <h3 className="text-xl font-semibold text-cyan-700">Calculadora de Calorias</h3>
              </div>
              <p className="text-cyan-600">Calcule as calorias e nutrientes dos alimentos</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-pink-200 bg-pink-50"
            onClick={() => setCurrentView('expenditure')}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Activity className="h-8 w-8 text-pink-600 mr-3" />
                <h3 className="text-xl font-semibold text-pink-700">Calculadora de Gasto Calórico</h3>
              </div>
              <p className="text-pink-600">Descubra quantas calorias seu corpo gasta por dia</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-orange-200 bg-orange-50"
            onClick={() => setCurrentView('bmi')}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <User className="h-8 w-8 text-orange-600 mr-3" />
                <h3 className="text-xl font-semibold text-orange-700">Calculadora de IMC e Peso Ideal</h3>
              </div>
              <p className="text-orange-600">Verifique se está no peso adequado para sua altura</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentView === 'calories') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => setCurrentView('main')} className="mr-4">
            ← Voltar
          </Button>
          <h1 className="text-2xl font-bold">Calculadora de Calorias</h1>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
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

  if (currentView === 'bmi') {
    const idealWeight = getIdealWeight(bmiHeight, bmiGender);
    const classification = bmiResult ? getBMIClassification(bmiResult) : null;

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => setCurrentView('main')} className="mr-4">
            ← Voltar
          </Button>
          <h1 className="text-2xl font-bold">Calculadora de IMC e Peso Ideal</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <Label className="text-blue-600 font-medium mb-2 block">Sexo</Label>
                <div className="flex gap-2">
                  <Button
                    variant={bmiGender === 'male' ? 'default' : 'outline'}
                    onClick={() => setBmiGender('male')}
                    className="flex-1"
                  >
                    Homem
                  </Button>
                  <Button
                    variant={bmiGender === 'female' ? 'default' : 'outline'}
                    onClick={() => setBmiGender('female')}
                    className="flex-1"
                  >
                    Mulher
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-blue-600 font-medium mb-2 block">Idade</Label>
                <Input
                  type="number"
                  value={bmiAge}
                  onChange={(e) => setBmiAge(parseInt(e.target.value) || 0)}
                  className="text-center text-lg"
                />
                <div className="text-center text-sm text-gray-500 mt-1">anos</div>
              </div>

              <div>
                <Label className="text-blue-600 font-medium mb-2 block">Altura</Label>
                <Input
                  type="number"
                  value={bmiHeight}
                  onChange={(e) => setBmiHeight(parseInt(e.target.value) || 0)}
                  className="text-center text-lg"
                />
                <div className="text-center text-sm text-gray-500 mt-1">cm</div>
              </div>

              <div>
                <Label className="text-blue-600 font-medium mb-2 block">Peso</Label>
                <Input
                  type="number"
                  value={bmiWeight}
                  onChange={(e) => setBmiWeight(parseInt(e.target.value) || 0)}
                  className="text-center text-lg"
                />
                <div className="text-center text-sm text-gray-500 mt-1">kg</div>
              </div>
            </div>

            <div className="text-center mb-6">
              <Button onClick={calculateBMI} size="lg" className="px-8">
                Calcular IMC e Peso Ideal
              </Button>
            </div>

            {bmiResult && (
              <div className="space-y-6">
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Resultado</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <div className="text-sm text-gray-600">Seu IMC:</div>
                      <div className="text-3xl font-bold text-orange-600">{bmiResult.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Classificação atual:</div>
                      <div className={`text-xl font-semibold ${classification?.color}`}>
                        {classification?.text}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Peso ideal:</div>
                      <div className="text-3xl font-bold text-green-600">{idealWeight.toFixed(1)}kg</div>
                    </div>
                  </div>

                  {classification?.text === 'Sobrepeso' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <p className="text-orange-800 text-sm">
                        Seu IMC indica que você está com sobrepeso. Isso pode ser um sinal de que é hora de prestar mais atenção à sua alimentação e ao seu nível de atividade física. 
                        Fazer pequenas mudanças agora pode ajudar a evitar problemas de saúde mais sérios no futuro.
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Tabela de classificação de IMC</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Menor que 18,6</span>
                        <span>Abaixo do normal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Entre 18,6 e 24,9</span>
                        <span>Normal</span>
                      </div>
                      <div className="flex justify-between bg-orange-100 px-2 py-1 rounded">
                        <span>Entre 25 e 29,9</span>
                        <span>Sobrepeso</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Entre 30 e 34,9</span>
                        <span>Obesidade grau 1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Entre 35 e 39,9</span>
                        <span>Obesidade grau 2</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maior que 39,9</span>
                        <span>Obesidade grau 3</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                      Tabela de classificação de IMC, de acordo com a Organização Mundial da Saúde.
                    </p>
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    <p className="mb-2">
                      <strong>Observação sobre o IMC:</strong> O cálculo do IMC não distingue entre gordura e músculo. Assim, 
                      pessoas com alta densidade muscular, como alguns atletas, podem apresentar um IMC 
                      elevado, mesmo estando em boa forma física.
                    </p>
                    <p>
                      <strong>Observação sobre o Peso Ideal:</strong> Utilizamos a fórmula de Devine para cálculo de peso ideal.
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <Button onClick={() => setBmiResult(null)} variant="outline">
                    Calcular novamente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === 'expenditure') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => setCurrentView('main')} className="mr-4">
            ← Voltar
          </Button>
          <h1 className="text-2xl font-bold">Calculadora de Gasto Calórico</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <Label className="text-blue-600 font-medium mb-2 block">Sexo</Label>
                <div className="flex gap-2">
                  <Button
                    variant={expGender === 'male' ? 'default' : 'outline'}
                    onClick={() => setExpGender('male')}
                    className="flex-1"
                  >
                    Homem
                  </Button>
                  <Button
                    variant={expGender === 'female' ? 'default' : 'outline'}
                    onClick={() => setExpGender('female')}
                    className="flex-1"
                  >
                    Mulher
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-blue-600 font-medium mb-2 block">Idade</Label>
                <Input
                  type="number"
                  value={expAge}
                  onChange={(e) => setExpAge(parseInt(e.target.value) || 0)}
                  className="text-center text-lg"
                />
                <div className="text-center text-sm text-gray-500 mt-1">anos</div>
              </div>

              <div>
                <Label className="text-blue-600 font-medium mb-2 block">Altura</Label>
                <Input
                  type="number"
                  value={expHeight}
                  onChange={(e) => setExpHeight(parseInt(e.target.value) || 0)}
                  className="text-center text-lg"
                />
                <div className="text-center text-sm text-gray-500 mt-1">cm</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <Label className="text-blue-600 font-medium mb-2 block">Peso</Label>
                <Input
                  type="number"
                  value={expWeight}
                  onChange={(e) => setExpWeight(parseInt(e.target.value) || 0)}
                  className="text-center text-lg"
                />
                <div className="text-center text-sm text-gray-500 mt-1">kg</div>
              </div>

              <div>
                <Label className="text-blue-600 font-medium mb-2 block">Exercício físico</Label>
                <Select value={activityLevel} onValueChange={setActivityLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentário (nenhum exercício)</SelectItem>
                    <SelectItem value="light">Exercício leve (1-3 dias/semana)</SelectItem>
                    <SelectItem value="moderate">Exercício moderado/esportes 3-5 dias por semana</SelectItem>
                    <SelectItem value="intense">Exercício intenso (6-7 dias/semana)</SelectItem>
                    <SelectItem value="extreme">Exercício muito intenso/físico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-blue-600 font-medium mb-2 block">Objetivo</Label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose">Perda de peso leve (- 250kcal/dia)</SelectItem>
                    <SelectItem value="maintain">Manter peso atual</SelectItem>
                    <SelectItem value="gain">Ganho de peso leve (+ 250kcal/dia)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-center mb-6">
              <Button onClick={calculateExpenditure} size="lg" className="px-8">
                Calcular Gasto Calórico
              </Button>
            </div>

            {expResult && (
              <div className="space-y-6">
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Resultado</h3>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="text-sm text-yellow-800 mb-2">
                      <strong>Objetivo:</strong> {goal === 'lose' ? 'perder peso de forma leve' : goal === 'gain' ? 'ganhar peso de forma leve' : 'manter peso atual'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                      <div className="text-sm text-blue-600 mb-2">Seu gasto calórico diário deve ser cerca de</div>
                      <div className="text-4xl font-bold text-blue-700 mb-2">
                        {Math.round(expResult.daily)} <span className="text-lg">calorias (kcal)</span>
                      </div>
                      <div className="text-sm text-blue-600">
                        Essa é a quantidade de calorias que seu corpo necessita para {goal === 'lose' ? 'perder peso de forma leve' : goal === 'gain' ? 'ganhar peso de forma leve' : 'manter o peso atual'}, 
                        considerando os dados preenchidos.
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <div className="text-sm text-green-600 mb-2">Sua taxa metabólica basal é de</div>
                      <div className="text-4xl font-bold text-green-700 mb-2">
                        {Math.round(expResult.bmr)} <span className="text-lg">calorias (kcal)</span>
                      </div>
                      <div className="text-sm text-green-600">
                        Este valor representa a quantidade de calorias que seu corpo precisa para realizar 
                        funções básicas em repouso, como respiração e circulação.
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Observações:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Utilizamos a fórmula revisada de Harris-Benedict para cálculo de gasto calórico.</li>
                      <li>• Para uma alimentação equilibrada, é recomendado o consumo mínimo de 1000 calorias por dia para mulheres e 1200 calorias por dia para homens.</li>
                    </ul>
                  </div>
                </div>

                <div className="text-center">
                  <Button onClick={() => setExpResult(null)} variant="outline">
                    Calcular novamente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
