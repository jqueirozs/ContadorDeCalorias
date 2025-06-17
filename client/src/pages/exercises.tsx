
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle, Star, Target, Heart, Zap, Shield, Lightbulb, Award, Sparkles } from "lucide-react";

// Category icons and colors mapping
const categoryConfig = {
  "Controle Emocional": { icon: Heart, color: "bg-rose-500", bgColor: "bg-rose-50", textColor: "text-rose-700" },
  "Mindset Positivo": { icon: Sparkles, color: "bg-purple-500", bgColor: "bg-purple-50", textColor: "text-purple-700" },
  "Formação de Hábitos": { icon: Zap, color: "bg-blue-500", bgColor: "bg-blue-50", textColor: "text-blue-700" },
  "Autocompaixão": { icon: Shield, color: "bg-green-500", bgColor: "bg-green-50", textColor: "text-green-700" },
  "Motivação": { icon: Star, color: "bg-yellow-500", bgColor: "bg-yellow-50", textColor: "text-yellow-700" },
  "Relação com Comida": { icon: Lightbulb, color: "bg-orange-500", bgColor: "bg-orange-50", textColor: "text-orange-700" },
  "Autoestima": { icon: Award, color: "bg-pink-500", bgColor: "bg-pink-50", textColor: "text-pink-700" },
  "Gestão da Ansiedade": { icon: Brain, color: "bg-indigo-500", bgColor: "bg-indigo-50", textColor: "text-indigo-700" },
  "Alimentação Consciente": { icon: Lightbulb, color: "bg-teal-500", bgColor: "bg-teal-50", textColor: "text-teal-700" },
  "Relação com Balança": { icon: Award, color: "bg-slate-500", bgColor: "bg-slate-50", textColor: "text-slate-700" },
  "Situações Sociais": { icon: Heart, color: "bg-emerald-500", bgColor: "bg-emerald-50", textColor: "text-emerald-700" },
  "Exercícios Físicos": { icon: Zap, color: "bg-lime-500", bgColor: "bg-lime-50", textColor: "text-lime-700" },
  "Qualidade do Sono": { icon: Shield, color: "bg-violet-500", bgColor: "bg-violet-50", textColor: "text-violet-700" },
  "Superação de Obstáculos": { icon: Star, color: "bg-amber-500", bgColor: "bg-amber-50", textColor: "text-amber-700" },
  "Autoimagem": { icon: Sparkles, color: "bg-fuchsia-500", bgColor: "bg-fuchsia-50", textColor: "text-fuchsia-700" },
  "Inteligência Emocional": { icon: Brain, color: "bg-cyan-500", bgColor: "bg-cyan-50", textColor: "text-cyan-700" },
  "Estabelecimento de Metas": { icon: Star, color: "bg-red-500", bgColor: "bg-red-50", textColor: "text-red-700" },
};

export default function Exercises() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const today = new Date().toISOString().split('T')[0];

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

  const { data: dailyExercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ["/api/exercises/daily", { date: today }],
    retry: false,
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (data: { exerciseId: number; selectedOption: number; date: string }) => {
      return await apiRequest("POST", `/api/exercises/${data.exerciseId}/answer`, {
        selectedOption: data.selectedOption,
        date: data.date,
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsCorrect(response.correct);
      setShowResult(true);
      
      toast({
        title: response.correct ? "Correto! 🎉" : "Resposta incorreta",
        description: response.correct 
          ? "Você ganhou 15 pontos!" 
          : "Você ganhou 5 pontos pela tentativa. Continue praticando!",
        variant: response.correct ? "default" : "destructive",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Acesso negado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Não foi possível enviar a resposta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const completedExercises = dailyExercises?.filter((ex: any) => ex.completedAt) || [];
  const currentExercise = dailyExercises?.[currentExerciseIndex];
  const progressPercentage = dailyExercises ? (completedExercises.length / dailyExercises.length) * 100 : 0;

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentExercise) {
      toast({
        title: "Selecione uma resposta",
        description: "Por favor, selecione uma opção antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    submitAnswerMutation.mutate({
      exerciseId: currentExercise.exerciseId,
      selectedOption: selectedOption,
      date: today,
    });
  };

  const handleNextExercise = () => {
    setShowResult(false);
    setSelectedOption(null);
    setIsCorrect(false);
    
    // Find next incomplete exercise
    const nextIndex = dailyExercises?.findIndex((ex: any, index: number) => 
      index > currentExerciseIndex && !ex.completedAt
    );
    
    if (nextIndex !== -1) {
      setCurrentExerciseIndex(nextIndex);
    } else {
      // All exercises completed
      toast({
        title: "Parabéns! 🎉",
        description: "Você completou todos os exercícios de hoje!",
      });
    }
  };

  const getCategoryConfig = (category: string) => {
    return categoryConfig[category as keyof typeof categoryConfig] || categoryConfig["Mindset Positivo"];
  };

  const CategoryBadge = ({ category }: { category: string }) => {
    const config = getCategoryConfig(category);
    const IconComponent = config.icon;
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor} border border-opacity-20`}>
        <IconComponent className="w-4 h-4 mr-2" />
        {category}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-auto">
        <header className="bg-white shadow-sm border-b border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-800">Academia da Mente</h2>
              <p className="text-neutral-600 mt-1">Exercícios de autoprogramação para fortalecer seu mindset</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500">Progresso de Hoje</p>
              <p className="font-semibold text-neutral-800">
                {completedExercises.length}/{dailyExercises?.length || 0}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-neutral-500 mt-2">
              {Math.round(progressPercentage)}% dos exercícios concluídos
            </p>
          </div>
        </header>

        <main className="p-6">
          {exercisesLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-neutral-600">Preparando seus exercícios...</p>
              </CardContent>
            </Card>
          ) : !dailyExercises || dailyExercises.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                    Exercícios Indisponíveis
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Não há exercícios disponíveis no momento. Nossa base de exercícios está sendo preparada.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Em breve:</strong> Exercícios de múltipla escolha para fortalecer 
                      seu mindset de emagrecimento e autoprogramação mental.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : completedExercises.length === dailyExercises.length ? (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="py-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Parabéns! Exercícios Concluídos! 🎉
                  </h3>
                  <p className="text-green-700 mb-4">
                    Você completou todos os {dailyExercises.length} exercícios de hoje. 
                    Seu mindset está sendo fortalecido a cada dia!
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-green-800">{completedExercises.length}</div>
                        <div className="text-green-600">Exercícios</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-800">
                          +{completedExercises.reduce((total: number, ex: any) => total + (ex.correct ? 15 : 5), 0)}
                        </div>
                        <div className="text-green-600">Pontos</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-4">
                    Volte amanhã para novos exercícios!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Current Exercise */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-primary" />
                      Exercício {currentExerciseIndex + 1} de {dailyExercises.length}
                    </span>
                    <CategoryBadge category={currentExercise?.exercise?.category || 'Mindset Positivo'} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentExercise && (
                    <>
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                        <p className="text-lg leading-relaxed text-neutral-800 font-medium">
                          {currentExercise.exercise.question}
                        </p>
                      </div>

                      {/* Multiple Choice Options */}
                      {!currentExercise.completedAt && !showResult && (
                        <div className="space-y-3">
                          {currentExercise.exercise.options?.map((option: string, index: number) => (
                            <button
                              key={index}
                              onClick={() => setSelectedOption(index)}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                selectedOption === index
                                  ? 'border-primary bg-primary/5 shadow-md'
                                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                              }`}
                            >
                              <div className="flex items-center">
                                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                  selectedOption === index
                                    ? 'border-primary bg-primary'
                                    : 'border-neutral-300'
                                }`}>
                                  {selectedOption === index && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                                <span className="text-neutral-700 leading-relaxed">{option}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {showResult && (
                        <div className={`p-6 rounded-lg border-2 ${
                          isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center space-x-3 mb-4">
                            {isCorrect ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <Target className="w-6 h-6 text-red-600" />
                            )}
                            <p className={`font-semibold text-lg ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                              {isCorrect ? 'Parabéns! Resposta Correta! 🎉' : 'Resposta Incorreta'}
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                              <p className={`text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                Sua resposta: {currentExercise.exercise.options[selectedOption || 0]}
                              </p>
                            </div>
                            
                            {!isCorrect && (
                              <div className="p-3 rounded-lg bg-green-100">
                                <p className="text-sm font-medium text-green-700">
                                  Resposta correta: {currentExercise.exercise.options[currentExercise.exercise.correctOption]}
                                </p>
                              </div>
                            )}
                            
                            <p className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                              {isCorrect 
                                ? `Excelente! Você ganhou 15 pontos por acertar!`
                                : `Você ganhou 5 pontos pela tentativa. Continue praticando!`
                              }
                            </p>
                          </div>
                        </div>
                      )}

                      {!currentExercise.completedAt && !showResult && (
                        <div className="flex space-x-3">
                          <Button
                            onClick={handleSubmitAnswer}
                            disabled={submitAnswerMutation.isPending || selectedOption === null}
                            className="flex-1 bg-primary hover:bg-primary/90 py-3 text-lg font-medium"
                          >
                            {submitAnswerMutation.isPending ? "Enviando..." : "Confirmar Resposta"}
                          </Button>
                        </div>
                      )}

                      {showResult && (
                        <div className="flex space-x-3">
                          <Button
                            onClick={handleNextExercise}
                            className="flex-1 bg-primary hover:bg-primary/90 py-3 text-lg font-medium"
                          >
                            Próximo Exercício
                          </Button>
                        </div>
                      )}

                      {currentExercise.completedAt && !showResult && (
                        <div className="flex items-center justify-center p-6 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                          <span className="text-green-800 font-medium text-lg">Exercício já concluído</span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Exercise Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Todos os Exercícios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {dailyExercises.map((exercise: any, index: number) => (
                      <Button
                        key={exercise.id}
                        variant={index === currentExerciseIndex ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentExerciseIndex(index)}
                        className={`relative ${
                          exercise.completedAt 
                            ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200' 
                            : index === currentExerciseIndex 
                              ? 'bg-primary text-white' 
                              : ''
                        }`}
                      >
                        {index + 1}
                        {exercise.completedAt && (
                          <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600 bg-white rounded-full" />
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Hoje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{completedExercises.length}</div>
                      <div className="text-sm text-neutral-600">Concluídos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">
                        {completedExercises.filter((ex: any) => ex.correct).length}
                      </div>
                      <div className="text-sm text-neutral-600">Corretos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">
                        {Math.round(progressPercentage)}%
                      </div>
                      <div className="text-sm text-neutral-600">Progresso</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        +{completedExercises.reduce((total: number, ex: any) => total + (ex.correct ? 15 : 5), 0)}
                      </div>
                      <div className="text-sm text-neutral-600">Pontos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
