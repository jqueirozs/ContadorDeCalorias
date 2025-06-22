import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { PlayCircle, CheckCircle, Clock, Star } from "lucide-react";

export default function Course() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ["/api/course/modules"],
    retry: false,
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/course/progress"],
    retry: false,
  });

  const completeVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      await apiRequest("POST", `/api/course/video/${videoId}/complete`, {});
    },
    onSuccess: () => {
      toast({
        title: "Vídeo concluído!",
        description: "Parabéns! Você ganhou pontos por assistir o vídeo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/course/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Erro",
        description: "Não foi possível marcar o vídeo como concluído.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || modulesLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-neutral-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Mock video data for demonstration
  const mockVideos = [
    {
      id: 1,
      moduleId: 1,
      title: "Introdução ao Emagrecimento Inteligente",
      description: "Entenda os princípios fundamentais do método",
      duration: 1200, // 20 minutes
      points: 10,
      orderIndex: 1,
    },
    {
      id: 2,
      moduleId: 1,
      title: "Mindset para o Sucesso",
      description: "Como preparar sua mente para a transformação",
      duration: 1800, // 30 minutes
      points: 15,
      orderIndex: 2,
    },
    {
      id: 3,
      moduleId: 2,
      title: "Alimentação Consciente",
      description: "Aprenda a se relacionar melhor com a comida",
      duration: 2400, // 40 minutes
      points: 20,
      orderIndex: 1,
    },
  ];

  const mockModules = [
    {
      id: 1,
      title: "Fundamentos do Emagrecimento",
      description: "Compreenda as bases científicas e psicológicas do emagrecimento saudável",
      orderIndex: 1,
    },
    {
      id: 2,
      title: "Nutrição Inteligente",
      description: "Estratégias nutricionais avançadas para resultados duradouros",
      orderIndex: 2,
    },
    {
      id: 3,
      title: "Exercícios e Movimento",
      description: "Como incorporar atividade física de forma sustentável",
      orderIndex: 3,
    },
  ];

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const isVideoCompleted = (videoId: number) => {
    return (userProgress as Array<{ videoId: number; completed: boolean }> | undefined)?.some((p: { videoId: number; completed: boolean }) => p.videoId === videoId && p.completed) || false;
  };

  const getModuleProgress = (moduleId: number) => {
    const moduleVideos = mockVideos.filter(v => v.moduleId === moduleId);
    const completedVideos = moduleVideos.filter(v => isVideoCompleted(v.id));
    return moduleVideos.length > 0 ? (completedVideos.length / moduleVideos.length) * 100 : 0;
  };

  return (
    <Layout>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 p-6">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-800">Curso</h2>
          <p className="text-neutral-600 mt-1">Aprenda o método completo de emagrecimento inteligente</p>
        </div>
      </header>

      {/* Course Content */}
      <main className="p-6 space-y-8">
        {mockModules.map((module) => {
          const moduleVideos = mockVideos.filter(v => v.moduleId === module.id);
          const progress = getModuleProgress(module.id);
          
          return (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{module.title}</CardTitle>
                    <p className="text-neutral-600 mb-4">{module.description}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-neutral-700">Progresso</span>
                          <span className="text-sm text-neutral-500">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {moduleVideos.filter(v => isVideoCompleted(v.id)).length}/{moduleVideos.length} vídeos
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moduleVideos.map((video) => {
                    const completed = isVideoCompleted(video.id);
                    
                    return (
                      <div
                        key={video.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          completed 
                            ? "bg-secondary/5 border-secondary/20" 
                            : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100"
                        } transition-colors`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            completed 
                              ? "bg-secondary text-white" 
                              : "bg-primary text-white"
                          }`}>
                            {completed ? <CheckCircle size={20} /> : <PlayCircle size={20} />}
                          </div>
                          <div>
                            <h4 className="font-medium text-neutral-800">{video.title}</h4>
                            <p className="text-sm text-neutral-500">{video.description}</p>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-xs text-neutral-400 flex items-center">
                                <Clock size={12} className="mr-1" />
                                {formatDuration(video.duration)}
                              </span>
                              <span className="text-xs text-accent flex items-center">
                                <Star size={12} className="mr-1" />
                                {video.points} pontos
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {completed ? (
                            <Badge variant="secondary">Concluído</Badge>
                          ) : (
                            <Button
                              onClick={() => completeVideoMutation.mutate(video.id)}
                              disabled={completeVideoMutation.isPending}
                            >
                              {completeVideoMutation.isPending ? "Carregando..." : "Assistir"}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Course Stats */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {mockVideos.filter(v => isVideoCompleted(v.id)).length}
                </p>
                <p className="text-sm text-neutral-600">Vídeos Assistidos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">
                  {Math.round((mockVideos.filter(v => isVideoCompleted(v.id)).length / mockVideos.length) * 100)}%
                </p>
                <p className="text-sm text-neutral-600">Progresso Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">
                  {mockVideos.filter(v => isVideoCompleted(v.id)).reduce((sum, v) => sum + v.points, 0)}
                </p>
                <p className="text-sm text-neutral-600">Pontos Ganhos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </Layout>
  );
}
