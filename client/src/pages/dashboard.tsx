import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import StatsCards from "@/components/dashboard/stats-cards";
import WeightChart from "@/components/dashboard/weight-chart";
import QuickActions from "@/components/dashboard/quick-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Brain, Play, Heart, MessageCircle } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated
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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: recentMeals } = useQuery({
    queryKey: ["/api/meals/recent"],
    retry: false,
  });

  const { data: forumTopics } = useQuery({
    queryKey: ["/api/forum/topics", { limit: 2 }],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-800">
                Bem-vinda de volta, {user?.firstName || 'Usuário'}!
              </h2>
              <p className="text-neutral-600 mt-1">Aqui está o seu progresso de hoje</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-neutral-500">Hoje</p>
                <p className="font-semibold text-neutral-800 capitalize">{today}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          <StatsCards stats={stats} isLoading={statsLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Activities */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Atividades de Hoje
                    <span className="text-sm font-normal text-neutral-500">
                      {new Date().toLocaleDateString('pt-BR')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`p-4 rounded-lg border ${
                    stats?.reflectionCompleted 
                      ? 'bg-secondary/5 border-secondary/20' 
                      : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          stats?.reflectionCompleted 
                            ? 'bg-secondary text-white' 
                            : 'bg-neutral-300 text-neutral-600'
                        }`}>
                          {stats?.reflectionCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Heart className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800">Espelho do Comportamento</p>
                          <p className="text-sm text-neutral-500">
                            {stats?.reflectionCompleted ? 'Questionário diário concluído' : 'Preencha sua reflexão diária'}
                          </p>
                        </div>
                      </div>
                      {stats?.reflectionCompleted ? (
                        <span className="text-secondary font-medium">+30 pts</span>
                      ) : (
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                          Preencher
                        </Button>
                      )}
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          stats?.reflectionCompleted ? 'bg-secondary' : 'bg-neutral-300'
                        }`}
                        style={{ width: stats?.reflectionCompleted ? '100%' : '0%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800">Academia da Mente</p>
                          <p className="text-sm text-neutral-500">
                            {stats?.exercisesCompleted || 0} de 10 exercícios concluídos
                          </p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Continuar
                      </Button>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${((stats?.exercisesCompleted || 0) / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-neutral-300 rounded-lg flex items-center justify-center">
                        <Play className="w-4 h-4 text-neutral-600" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">Vídeo do Curso</p>
                        <p className="text-sm text-neutral-500">Módulo: Mindset para Emagrecer</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Assistir
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <WeightChart />
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6 mt-[20px] mb-[20px]">
              <QuickActions />

              {/* Recent Meals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Refeições Recentes
                    <Button variant="link" size="sm" className="text-primary">
                      Ver todas
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentMeals && recentMeals.length > 0 ? (
                    <div className="space-y-3">
                      {recentMeals.slice(0, 3).map((meal: any) => (
                        <div key={meal.id} className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-neutral-800 capitalize">{meal.type}</p>
                            <p className="text-sm text-neutral-500">{meal.time}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-neutral-600">{meal.foods.slice(0, 30)}...</p>
                            <p className="text-xs text-neutral-400">+{meal.points} pts</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      <p>Nenhuma refeição registrada ainda</p>
                      <p className="text-sm">Comece registrando sua primeira refeição!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Community Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Comunidade
                    <Button variant="link" size="sm" className="text-primary">
                      Ver fórum
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {forumTopics && forumTopics.length > 0 ? (
                    <div className="space-y-4">
                      {forumTopics.slice(0, 2).map((topic: any) => (
                        <div key={topic.id} className="p-3 bg-neutral-50 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <img 
                              src={topic.user?.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topic.user?.firstName || 'U')}&background=random`}
                              alt="Avatar" 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-neutral-800">
                                {topic.user?.firstName || 'Usuário'}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {topic.title.slice(0, 50)}...
                              </p>
                              <div className="flex items-center space-x-3 mt-2">
                                <span className="text-xs text-neutral-400">
                                  <Heart className="w-3 h-3 inline mr-1" />
                                  {topic.likes}
                                </span>
                                <span className="text-xs text-neutral-400">
                                  <MessageCircle className="w-3 h-3 inline mr-1" />
                                  {topic.commentCount}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      <p>Nenhum tópico ainda</p>
                      <p className="text-sm">Seja o primeiro a iniciar uma conversa!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
  );
}