import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import MealForm from "@/components/meals/meal-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Search, Utensils, Camera } from "lucide-react";
import NutrientDisplay from "@/components/ui/nutrient-display";

export default function Meals() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showMealForm, setShowMealForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const { data: meals, isLoading: mealsLoading } = useQuery({
    queryKey: ["/api/meals", { date: selectedDate }],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const filteredMeals = searchTerm
    ? (meals || []).filter((meal: any) =>
        meal.foods.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : meals || [];

  const getMealTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      breakfast: "Café da Manhã",
      lunch: "Almoço",
      snack: "Lanche",
      dinner: "Jantar",
      supper: "Ceia",
    };
    return labels[type] || type;
  };

  const getMealTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      breakfast: "bg-yellow-100 text-yellow-800",
      lunch: "bg-green-100 text-green-800",
      snack: "bg-blue-100 text-blue-800",
      dinner: "bg-purple-100 text-purple-800",
      supper: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const todayMeals = meals || [];
  const mealsByType = {
    breakfast: todayMeals.filter((m: any) => m.type === "breakfast"),
    lunch: todayMeals.filter((m: any) => m.type === "lunch"),
    snack: todayMeals.filter((m: any) => m.type === "snack"),
    dinner: todayMeals.filter((m: any) => m.type === "dinner"),
    supper: todayMeals.filter((m: any) => m.type === "supper"),
  };

  const totalPointsToday = todayMeals.reduce((sum: number, meal: any) => sum + (meal.points || 0), 0);

  return (
    <>
      <div className="overflow-auto">
        <header className="bg-white shadow-sm border-b border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-800">Registro de Refeições</h2>
              <p className="text-neutral-600 mt-1">Acompanhe sua alimentação diária</p>
            </div>
            <Button
              onClick={() => setShowMealForm(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Refeição
            </Button>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <Input
                placeholder="Buscar refeições..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Today's Summary */}
          {!searchTerm && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary">{todayMeals.length}</div>
                  <div className="text-sm text-neutral-600">Refeições Registradas</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-secondary">+{totalPointsToday}</div>
                  <div className="text-sm text-neutral-600">Pontos Ganhos</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-accent">
                    {Math.round((todayMeals.length / 5) * 100)}%
                  </div>
                  <div className="text-sm text-neutral-600">Meta Diária</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Meal Timeline */}
          {!searchTerm ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Refeições de {selectedDate.split('-').reverse().join('/')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mealsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                        <div className="h-16 bg-neutral-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : todayMeals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Utensils className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                      Nenhuma refeição registrada
                    </h3>
                    <p className="text-neutral-600 mb-4">
                      Comece registrando sua primeira refeição do dia.
                    </p>
                    <Button
                      onClick={() => setShowMealForm(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Registrar Refeição
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {["breakfast", "lunch", "snack", "dinner", "supper"].map((mealType) => {
                      const mealsOfType = mealsByType[mealType as keyof typeof mealsByType] as any[];
                      
                      return (
                        <div key={mealType} className="border-l-2 border-neutral-200 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-neutral-800">
                              {getMealTypeLabel(mealType)}
                              {mealsOfType.length > 1 && (
                                <span className="text-sm text-neutral-500 ml-2">
                                  ({mealsOfType.length} registros)
                                </span>
                              )}
                            </h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowMealForm(true)}
                            >
                              {mealsOfType.length > 0 ? "Adicionar" : "Registrar"}
                            </Button>
                          </div>
                          
                          {mealsOfType.length > 0 ? (
                            <div className="space-y-3">
                              {mealsOfType.map((meal: any, index: number) => (
                                <Card key={meal.id} className="bg-neutral-50">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <Badge className={getMealTypeColor(meal.type)}>
                                            {getMealTypeLabel(meal.type)}
                                            {mealsOfType.length > 1 && (
                                              <span className="ml-1">#{index + 1}</span>
                                            )}
                                          </Badge>
                                          <div className="flex items-center text-sm text-neutral-500">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {meal.time}
                                          </div>
                                          {meal.photoUrl && (
                                            <div className="flex items-center text-sm text-green-600">
                                              <Camera className="w-3 h-3 mr-1" />
                                              <span>Com foto</span>
                                            </div>
                                          )}
                                        </div>
                                        <p className="text-neutral-700 mb-2">{meal.foods}</p>
                                        
                                        {/* Show nutrient information if available */}
                                        {(meal.calories || meal.protein || meal.carbohydrates || meal.fat) && (
                                          <div className="mt-3">
                                            <NutrientDisplay 
                                              nutrients={{
                                                calories: meal.calories,
                                                protein: parseFloat(meal.protein || '0'),
                                                carbohydrates: parseFloat(meal.carbohydrates || '0'),
                                                fat: parseFloat(meal.fat || '0'),
                                                fiber: parseFloat(meal.fiber || '0'),
                                                sugar: parseFloat(meal.sugar || '0'),
                                                sodium: parseFloat(meal.sodium || '0'),
                                              }}
                                              className="border-0 bg-white"
                                            />
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right ml-4">
                                        <div className="text-sm font-medium text-secondary">
                                          +{meal.points} pts
                                        </div>
                                        {meal.analysisConfidence && (
                                          <div className="text-xs text-neutral-500 mt-1">
                                            IA: {Math.round(parseFloat(meal.analysisConfidence) * 100)}%
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-neutral-500 italic">
                              Não registrado
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Search Results */
            <Card>
              <CardHeader>
                <CardTitle>
                  Resultados da Busca
                  {filteredMeals.length > 0 && (
                    <span className="text-sm font-normal text-neutral-500 ml-2">
                      ({filteredMeals.length} {filteredMeals.length === 1 ? 'resultado' : 'resultados'})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredMeals.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <p>Nenhuma refeição encontrada com esses termos.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMeals.map((meal: any) => (
                      <Card key={meal.id} className="bg-neutral-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className={getMealTypeColor(meal.type)}>
                                  {getMealTypeLabel(meal.type)}
                                </Badge>
                                <div className="flex items-center text-sm text-neutral-500">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {meal.time}
                                </div>
                                <div className="text-sm text-neutral-500">
                                  {new Date(meal.date).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                              <p className="text-neutral-700">{meal.foods}</p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm font-medium text-secondary">
                                +{meal.points} pts
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <MealForm 
        isOpen={showMealForm} 
        onClose={() => setShowMealForm(false)} 
        selectedDate={selectedDate}
        />
    </>
  );
}
