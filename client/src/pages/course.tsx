import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle, Clock } from "lucide-react";

export default function Course() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: modules } = useQuery({
    queryKey: ["/api/courses/modules"],
    retry: false,
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/courses/progress"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const completedModules = progress?.filter((p: any) => p.completed) || [];
  const progressPercentage = modules ? (completedModules.length / modules.length) * 100 : 0;

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-auto">
        <header className="bg-white shadow-sm border-b border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-800">Curso de Emagrecimento</h2>
              <p className="text-neutral-600 mt-1">Aprenda o método completo para transformar sua vida</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500">Progresso Geral</p>
              <p className="font-semibold text-neutral-800">{Math.round(progressPercentage)}%</p>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-neutral-500 mt-2">
              {completedModules.length} de {modules?.length || 0} módulos concluídos
            </p>
          </div>
        </header>

        <main className="p-6">
          {!modules || modules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                    Módulos em Preparação
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Estamos preparando conteúdos exclusivos para você. Em breve você terá acesso a vídeos, 
                    exercícios e materiais complementares.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Dica:</strong> Enquanto isso, explore a Academia da Mente e 
                      preencha seu Espelho do Comportamento para começar sua transformação!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {modules.map((module: any, index: number) => {
                const isCompleted = completedModules.some((p: any) => p.moduleId === module.id);
                const isNext = !isCompleted && index === completedModules.length;
                const isLocked = !isCompleted && index > completedModules.length;

                return (
                  <Card 
                    key={module.id} 
                    className={`${isCompleted ? 'bg-green-50 border-green-200' : isNext ? 'bg-blue-50 border-blue-200' : 'bg-neutral-50'}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : isNext 
                                ? 'bg-primary text-white' 
                                : 'bg-neutral-300 text-neutral-600'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-6 h-6" />
                            ) : (
                              <span className="font-semibold">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">
                              Módulo {index + 1}: {module.title}
                            </CardTitle>
                            {module.description && (
                              <p className="text-neutral-600 text-sm">{module.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-3 text-sm text-neutral-500">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {module.duration} min
                              </div>
                              {isCompleted && (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Concluído
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button 
                          disabled={isLocked}
                          variant={isCompleted ? "outline" : "default"}
                          className={isNext ? "bg-primary hover:bg-primary/90" : ""}
                        >
                          {isCompleted ? "Revisar" : isNext ? "Assistir" : "Bloqueado"}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    {(isNext || isCompleted) && module.videoUrl && (
                      <CardContent>
                        <div className="bg-neutral-900 rounded-lg aspect-video flex items-center justify-center">
                          <div className="text-center text-white">
                            <Play className="w-16 h-16 mx-auto mb-4 opacity-70" />
                            <p className="text-lg font-medium">Vídeo Indisponível</p>
                            <p className="text-sm opacity-70">O conteúdo será adicionado em breve</p>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Course Statistics */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Suas Estatísticas do Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{completedModules.length}</div>
                  <div className="text-sm text-neutral-600">Módulos Concluídos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {modules ? modules.reduce((total: number, m: any) => 
                      completedModules.some((p: any) => p.moduleId === m.id) ? total + m.duration : total, 0
                    ) : 0}
                  </div>
                  <div className="text-sm text-neutral-600">Minutos Assistidos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{Math.round(progressPercentage)}%</div>
                  <div className="text-sm text-neutral-600">Progresso Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
