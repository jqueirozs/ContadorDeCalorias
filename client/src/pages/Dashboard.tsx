import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { StatsCard } from "@/components/StatsCard";
import { WeightChart } from "@/components/WeightChart";
import { AddMealModal } from "@/components/AddMealModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Weight, 
  Star, 
  Brain, 
  Utensils,
  Plus,
  CheckCircle,
  Clock,
  Play,
  ArrowDown,
  ArrowUp,
  Bell
} from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [showMealModal, setShowMealModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Não autorizado",
        description: "Você foi desconectado. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<{
    currentWeight: number | null;
    totalPoints: number;
    exercisesCompleted: number;
    mealsToday: number;
    reflectionCompleted: boolean;
    hasReflectionToday?: boolean;
    exercisesCompletedToday?: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: weightRecords } = useQuery<Array<{
    id: number;
    weight: string;
    date: string;
    notes?: string;
  }>>({
    queryKey: ["/api/weight"],
    retry: false,
  });

  const { data: recentMeals } = useQuery<Array<{
    id: number;
    type: string;
    foods: string;
    time: string;
    pointsEarned?: number;
    mealType?: string;
  }>>({
    queryKey: ["/api/meals/recent"],
    retry: false,
  });

  const { data: forumTopics } = useQuery<Array<{
    id: number;
    title: string;
    user: { firstName?: string; profileImageUrl?: string };
    likes: number;
    replies: number;
  }>>({
    queryKey: ["/api/forum/topics"],
    retry: false,
  });

  if (isLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-neutral-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-800">
              Bem-vinda de volta, {(user as any)?.firstName || "Usuário"}!
            </h2>
            <p className="text-neutral-600 mt-1">Aqui está o seu progresso de hoje</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></span>
            </Button>
            <div className="text-right">
              <p className="text-sm text-neutral-500">Hoje</p>
              <p className="font-semibold text-neutral-800">{currentDate}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Peso Atual"
            value={`${(user as any)?.currentWeight || '---'} kg`}
            change={weightRecords && weightRecords.length > 1 ? `${parseFloat(weightRecords[1].weight) - parseFloat(weightRecords[0].weight) > 0 ? '+' : ''}${(parseFloat(weightRecords[0].weight) - parseFloat(weightRecords[1].weight)).toFixed(1)} kg este mês` : undefined}
            changeType={weightRecords && weightRecords.length > 1 && parseFloat(weightRecords[0].weight) < parseFloat(weightRecords[1].weight) ? "positive" : "negative"}
            icon={Weight}
            iconColor="bg-secondary/10 text-secondary"
          />
          
          <StatsCard
            title="Pontos Totais"
            value={stats?.totalPoints?.toString() || "0"}
            change="+120 hoje"
            changeType="positive"
            icon={Star}
            iconColor="bg-accent/10 text-accent"
          />
          
          <StatsCard
            title="Exercícios Hoje"
            value={`${stats?.exercisesCompleted || 0}/10`}
            change={`${10 - (stats?.exercisesCompleted || 0)} restantes`}
            changeType="neutral"
            icon={Brain}
            iconColor="bg-primary/10 text-primary"
          />
          
          <StatsCard
            title="Refeições Hoje"
            value={`${stats?.mealsToday || 0}/5`}
            change={stats && stats.mealsToday < 5 ? "Falta registrar" : "Completo!"}
            changeType={stats && stats.mealsToday >= 5 ? "positive" : "neutral"}
            icon={Utensils}
            iconColor="bg-neutral-100 text-neutral-600"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Daily Activities */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Atividades de Hoje</CardTitle>
                  <span className="text-sm text-neutral-500">{currentDate}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Behavior Mirror */}
                <div className={`flex items-center justify-between p-4 rounded-lg border ${
                  stats?.reflectionCompleted 
                    ? "bg-secondary/5 border-secondary/20" 
                    : "bg-neutral-50 border-neutral-200"
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      stats?.reflectionCompleted 
                        ? "bg-secondary text-white" 
                        : "bg-neutral-300 text-neutral-600"
                    }`}>
                      {stats?.reflectionCompleted ? <CheckCircle size={16} /> : <Clock size={16} />}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">Espelho do Comportamento</p>
                      <p className="text-sm text-neutral-500">
                        {stats?.reflectionCompleted ? "Questionário diário concluído" : "Preencher questionário diário"}
                      </p>
                    </div>
                  </div>
                  {stats?.reflectionCompleted ? (
                    <Badge variant="secondary">+30 pts</Badge>
                  ) : (
                    <Button size="sm" onClick={() => window.location.href = "/reflection"}>
                      Preencher
                    </Button>
                  )}
                </div>

                {/* Mind Exercises */}
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Brain className="text-white" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">Academia da Mente</p>
                      <p className="text-sm text-neutral-500">
                        {stats?.exercisesCompleted || 0} de 10 exercícios concluídos
                      </p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => window.location.href = "/exercises"}>
                    Continuar
                  </Button>
                </div>

                {/* Course Video */}
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-neutral-300 rounded-lg flex items-center justify-center">
                      <Play className="text-neutral-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">Vídeo do Curso</p>
                      <p className="text-sm text-neutral-500">Módulo 3: Mindset para Emagrecer</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = "/course"}>
                    Assistir
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Weight Chart */}
            {weightRecords && weightRecords.length > 0 && (
              <WeightChart data={weightRecords} />
            )}
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start space-x-3" 
                  onClick={() => setShowMealModal(true)}
                >
                  <Plus size={16} />
                  <span>Registrar Refeição</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start space-x-3 bg-secondary text-white hover:bg-secondary/90"
                  onClick={() => window.location.href = "/reflection"}
                >
                  <CheckCircle size={16} />
                  <span>Preencher Espelho</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start space-x-3 bg-accent text-white hover:bg-accent/90"
                  onClick={() => window.location.href = "/exercises"}
                >
                  <Brain size={16} />
                  <span>Exercícios Mente</span>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Meals */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Refeições Recentes</CardTitle>
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={() => window.location.href = "/meals"}
                  >
                    Ver todas
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentMeals?.slice(0, 3).map((meal: any) => (
                  <div key={meal.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                    <div>
                      <p className="font-medium text-neutral-800 capitalize">{meal.mealType}</p>
                      <p className="text-sm text-neutral-500">{meal.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-600 truncate max-w-32">
                        {meal.foods.length > 20 ? `${meal.foods.substring(0, 20)}...` : meal.foods}
                      </p>
                      <p className="text-xs text-neutral-400">+{meal.pointsEarned} pts</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-neutral-500 text-center py-4">
                    Nenhuma refeição registrada ainda
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Community Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Comunidade</CardTitle>
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={() => window.location.href = "/community"}
                  >
                    Ver fórum
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {forumTopics?.slice(0, 2).map((topic: any) => (
                  <div key={topic.id} className="p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <img 
                        src={topic.user.profileImageUrl || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"}
                        alt="User avatar" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-800">
                          {topic.user.firstName || "Usuário"}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {topic.title.length > 50 ? `${topic.title.substring(0, 50)}...` : topic.title}
                        </p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-xs text-neutral-400">
                            ❤️ {topic.likes}
                          </span>
                          <span className="text-xs text-neutral-400">
                            💬 {topic.replies}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-neutral-500 text-center py-4">
                    Nenhuma discussão recente
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AddMealModal open={showMealModal} onOpenChange={setShowMealModal} />
    </div>
  );
}
