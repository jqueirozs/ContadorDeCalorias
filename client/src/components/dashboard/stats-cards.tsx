import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Weight, Star, Brain, Utensils, TrendingDown, Plus, Clock } from "lucide-react";

interface StatsCardsProps {
  stats?: {
    currentWeight: number | null;
    totalPoints: number;
    exercisesCompleted: number;
    mealsToday: number;
    reflectionCompleted: boolean;
  };
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const weightChange = stats?.currentWeight ? -2.3 : 0; // Mock weight change calculation
  const todayPoints = 120; // Mock today's points
  const exercisesRemaining = 10 - (stats?.exercisesCompleted || 0);
  const mealsRemaining = 5 - (stats?.mealsToday || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Current Weight */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm font-medium">Peso Atual</p>
              <p className="text-2xl font-bold text-neutral-800 mt-1">
                {stats?.currentWeight ? `${stats.currentWeight} kg` : 'Não informado'}
              </p>
              {stats?.currentWeight && (
                <p className="text-secondary text-sm mt-1 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {weightChange} kg este mês
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
              <Weight className="text-secondary text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Points */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm font-medium">Pontos Totais</p>
              <p className="text-2xl font-bold text-neutral-800 mt-1">
                {stats?.totalPoints?.toLocaleString('pt-BR') || '0'}
              </p>
              <p className="text-accent text-sm mt-1 flex items-center">
                <Plus className="w-3 h-3 mr-1" />
                +{todayPoints} hoje
              </p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <Star className="text-accent text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercises Today */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-neutral-500 text-sm font-medium">Exercícios Hoje</p>
              <p className="text-2xl font-bold text-neutral-800 mt-1">
                {stats?.exercisesCompleted || 0}/10
              </p>
              <p className="text-primary text-sm mt-1 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {exercisesRemaining > 0 ? `${exercisesRemaining} restantes` : 'Concluído!'}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Brain className="text-primary text-xl" />
            </div>
          </div>
          <Progress 
            value={((stats?.exercisesCompleted || 0) / 10) * 100} 
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Meals Today */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-neutral-500 text-sm font-medium">Refeições Hoje</p>
              <p className="text-2xl font-bold text-neutral-800 mt-1">
                {stats?.mealsToday || 0}/5
              </p>
              <p className="text-neutral-500 text-sm mt-1 flex items-center">
                <Utensils className="w-3 h-3 mr-1" />
                {mealsRemaining > 0 ? `Falta ${mealsRemaining === 1 ? 'a ceia' : `${mealsRemaining} refeições`}` : 'Todas registradas!'}
              </p>
            </div>
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Utensils className="text-neutral-600 text-xl" />
            </div>
          </div>
          <Progress 
            value={((stats?.mealsToday || 0) / 5) * 100} 
            className="h-2"
          />
        </CardContent>
      </Card>
    </div>
  );
}