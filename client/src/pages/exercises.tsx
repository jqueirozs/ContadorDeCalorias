import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle, Star, Target } from "lucide-react";

export default function Exercises() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
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
    mutationFn: async (data: { exerciseId: number; answer: string; date: string }) => {
      return await apiRequest("POST", `/api/exercises/${data.exerciseId}/answer`, {
        answer: data.answer,
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
    if (selectedOptionIndex === null || !currentExercise) {
      toast({
        title: "Selecione uma opção",
        description: "Por favor, escolha uma das opções antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    submitAnswerMutation.mutate({
      exerciseId: currentExercise.exerciseId,
      answer: selectedOptionIndex.toString(),
      date: today,
    });
  };

  const handleNextExercise = () => {
    setShowResult(false);
    setSelectedOptionIndex(null);
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

  const handleOptionSelect = (index: number) => {
    if (showResult || currentExercise?.completedAt) return;
    setSelectedOptionIndex(index);
  };

  return (
    <div className="overflow-auto">
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
                      💡 <strong>Em breve:</strong> Exercícios de preenchimento de lacunas para fortalecer 
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
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {currentExercise?.exercise?.category || 'Mindset'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentExercise && (
                    <>
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <p className="text-lg leading-relaxed text-neutral-800 mb-6">
                          {currentExercise.exercise.question}
                        </p>
                        
                        {/* Opções de múltipla escolha */}
                        <div className="space-y-3">
                          {currentExercise.exercise.options?.map((option: string, index: number) => (
                            <Button
                              key={index}
                              variant={selectedOptionIndex === index ? "default" : "outline"}
                              onClick={() => handleOptionSelect(index)}
                              disabled={showResult || currentExercise?.completedAt}
                              className={`w-full justify-start text-left h-auto py-4 px-6 ${
                                selectedOptionIndex === index
                                  ? 'bg-primary text-white hover:bg-primary/90'
                                  : 'bg-white hover:bg-neutral-50 text-neutral-800'
                              }`}
                            >
                              <span className="font-medium mr-3">
                                {String.fromCharCode(65 + index)})
                              </span>
                              {option}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {showResult && (
                        <div className={`p-4 rounded-lg ${
                          isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className="flex items-center space-x-2 mb-2">
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Target className="w-5 h-5 text-red-600" />
                            )}
                            <p className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                              {isCorrect ? 'Correto!' : 'Resposta incorreta'}
                            </p>
                          </div>
                          <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            {(() => {
                              const correctText = currentExercise.exercise.options
                                ? currentExercise.exercise.options[currentExercise.exercise.correctOption]
                                : currentExercise.exercise.answer;
                              return isCorrect
                                ? `Excelente! A resposta correta é "${correctText}". Você ganhou 15 pontos!`
                                : `A resposta correta é "${correctText}". Você ganhou 5 pontos pela tentativa!`;
                            })()}
                          </p>
                        </div>
                      )}

                      {!currentExercise.completedAt && !showResult && (
                        <div className="flex space-x-3">
                          <Button
                            onClick={handleSubmitAnswer}
                            disabled={submitAnswerMutation.isPending || selectedOptionIndex === null}
                            className="flex-1 bg-primary hover:bg-primary/90"
                          >
                            {submitAnswerMutation.isPending ? "Enviando..." : "Enviar Resposta"}
                          </Button>
                        </div>
                      )}

                      {showResult && (
                        <div className="flex space-x-3">
                          <Button
                            onClick={handleNextExercise}
                            className="flex-1 bg-primary hover:bg-primary/90"
                          >
                            Próximo Exercício
                          </Button>
                        </div>
                      )}

                      {currentExercise.completedAt && !showResult && (
                        <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-green-800 font-medium">Exercício já concluído</span>
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
  );
}
