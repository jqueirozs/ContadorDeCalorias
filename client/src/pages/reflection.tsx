import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ToggleButton } from "@/components/ui/toggle-button";
import { StarRating } from "@/components/ui/star-rating";
import { Save, CheckCircle, Brain, Lightbulb } from "lucide-react";

export default function Reflection() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    moodRating: [3],
    hungerLevel: [3],
    stressLevel: [3],
    exerciseMinutes: 0,
    challenges: "",
    achievements: "",
    notes: "",
    drankEnoughWater: null,
    ateMindfully: null,
    exercisedToday: null,
    sleptWell: null,
    managedStress: null,
    avoidedEmotionalEating: null,
    // Daily Balance Questions
    chooseHealthyMeals: null,
    avoidRepeatingPlates: null,
    hadEmotionalImpulses: null,
    hadEnvironmentalImpulses: null,
    evacuatedLast24h: null,
    hadBodySwelling: null,
    avoidedSelfSabotage: null,
    dayRating: 3,
    totalCalories: 0,
  });

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

  const { data: reflection, isLoading: reflectionLoading } = useQuery({
    queryKey: ["/api/reflections", { date: today }],
    retry: false,
  });

  const saveReflectionMutation = useMutation({
    mutationFn: async (data: any) => {
      if (reflection) {
        return await apiRequest("PUT", `/api/reflections/${reflection.id}`, data);
      } else {
        return await apiRequest("POST", "/api/reflections", { ...data, date: today });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reflections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });

      toast({
        title: reflection ? "Reflexão atualizada!" : "Reflexão salva!",
        description: reflection 
          ? "Suas alterações foram salvas com sucesso." 
          : "Sua reflexão foi registrada e você ganhou 30 pontos!",
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
        description: "Não foi possível salvar a reflexão. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Load existing reflection data
  useEffect(() => {
    if (reflection) {
      setFormData({
        moodRating: [reflection.moodRating || 3],
        hungerLevel: [reflection.hungerLevel || 3],
        stressLevel: [reflection.stressLevel || 3],
        exerciseMinutes: reflection.exerciseMinutes || 0,
        challenges: reflection.challenges || "",
        achievements: reflection.achievements || "",
        notes: reflection.notes || "",
        drankEnoughWater: reflection.drankEnoughWater,
        ateMindfully: reflection.ateMindfully,
        exercisedToday: reflection.exercisedToday,
        sleptWell: reflection.sleptWell,
        managedStress: reflection.managedStress,
        avoidedEmotionalEating: reflection.avoidedEmotionalEating,
        // Daily Balance Questions
        chooseHealthyMeals: reflection.chooseHealthyMeals,
        avoidRepeatingPlates: reflection.avoidRepeatingPlates,
        hadEmotionalImpulses: reflection.hadEmotionalImpulses,
        hadEnvironmentalImpulses: reflection.hadEnvironmentalImpulses,
        evacuatedLast24h: reflection.evacuatedLast24h,
        hadBodySwelling: reflection.hadBodySwelling,
        avoidedSelfSabotage: reflection.avoidedSelfSabotage,
        dayRating: reflection.dayRating || 3,
        totalCalories: reflection.totalCalories || 0,
      });
    }
  }, [reflection]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    saveReflectionMutation.mutate({
      moodRating: formData.moodRating[0],
      hungerLevel: formData.hungerLevel[0],
      stressLevel: formData.stressLevel[0],
      exerciseMinutes: formData.exerciseMinutes,
      challenges: formData.challenges,
      achievements: formData.achievements,
      notes: formData.notes,
      chooseHealthyMeals: formData.chooseHealthyMeals,
      avoidRepeatingPlates: formData.avoidRepeatingPlates,
      hadEmotionalImpulses: formData.hadEmotionalImpulses,
      hadEnvironmentalImpulses: formData.hadEnvironmentalImpulses,
      evacuatedLast24h: formData.evacuatedLast24h,
      hadBodySwelling: formData.hadBodySwelling,
      avoidedSelfSabotage: formData.avoidedSelfSabotage,
      dayRating: formData.dayRating,
      totalCalories: formData.totalCalories,
    });
  };

  const getRatingLabel = (value: number, type: string) => {
    const labels = {
      mood: ["Muito mal", "Mal", "Neutro", "Bem", "Muito bem"],
      hunger: ["Nada", "Pouco", "Moderado", "Muito", "Extremo"],
      stress: ["Nenhum", "Pouco", "Moderado", "Alto", "Muito alto"],
    };
    return labels[type as keyof typeof labels]?.[value - 1] || "";
  };

  return (
    <div className="overflow-auto">
        <header className="bg-white shadow-sm border-b border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-800">Espelho do Comportamento</h2>
              <p className="text-neutral-600 mt-1">Reflita sobre seu dia e identifique padrões</p>
            </div>
            <div className="flex items-center space-x-4">
              {reflection && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">Preenchido</span>
                </div>
              )}
              <div className="text-right">
                <p className="text-sm text-neutral-500">Data</p>
                <p className="font-semibold text-neutral-800">
                  {new Date(today).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Progresso</p>
                  <p className="text-sm font-medium text-neutral-800">
                    {reflection ? "100%" : "0%"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-secondary/10">
                  <div className="w-8 h-8 rounded-full border-2 border-secondary flex items-center justify-center">
                    {reflection ? (
                      <CheckCircle className="w-4 h-4 text-secondary" />
                    ) : (
                      <div className="w-2 h-2 bg-neutral-300 rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mood, Hunger, and Stress Ratings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <FlipHorizontal2 className="w-5 h-5 mr-2 text-primary" />
                      Como está seu humor?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Slider
                        value={formData.moodRating}
                        onValueChange={(value) => setFormData({ ...formData, moodRating: value })}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-center">
                        <span className="text-2xl font-bold text-primary">{formData.moodRating[0]}</span>
                        <p className="text-sm text-neutral-600 mt-1">
                          {getRatingLabel(formData.moodRating[0], "mood")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Nível de fome</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Slider
                        value={formData.hungerLevel}
                        onValueChange={(value) => setFormData({ ...formData, hungerLevel: value })}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-center">
                        <span className="text-2xl font-bold text-secondary">{formData.hungerLevel[0]}</span>
                        <p className="text-sm text-neutral-600 mt-1">
                          {getRatingLabel(formData.hungerLevel[0], "hunger")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Nível de estresse</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Slider
                        value={formData.stressLevel}
                        onValueChange={(value) => setFormData({ ...formData, stressLevel: value })}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-center">
                        <span className="text-2xl font-bold text-accent">{formData.stressLevel[0]}</span>
                        <p className="text-sm text-neutral-600 mt-1">
                          {getRatingLabel(formData.stressLevel[0], "stress")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Exercise Minutes */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Física</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="exercise-minutes" className="block text-sm font-medium text-neutral-700 mb-2">
                    Quantos minutos de exercício você fez hoje?
                  </Label>
                  <Input
                    id="exercise-minutes"
                    type="number"
                    min="0"
                    max="300"
                    value={formData.exerciseMinutes}
                    onChange={(e) => setFormData({ ...formData, exerciseMinutes: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-32"
                  />
                  <p className="text-sm text-neutral-500 mt-1">minutos</p>
                </CardContent>
              </Card>

              {/* Reflection Questions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Desafios do Dia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.challenges}
                      onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                      placeholder="Quais foram os principais desafios que você enfrentou hoje em relação à alimentação e bem-estar?"
                      rows={5}
                      className="w-full"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Conquistas do Dia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.achievements}
                      onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                      placeholder="O que você conseguiu conquistar hoje? Comemore suas vitórias, por menores que sejam!"
                      rows={5}
                      className="w-full"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Daily Balance Section */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-neutral-800 mb-2">BALANÇO DIÁRIO</h3>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="bg-neutral-800 text-white px-4 py-2 rounded">
                      <span className="text-sm font-medium">TOTAL DE CALORIAS</span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max="5000"
                      value={formData.totalCalories}
                      onChange={(e) => setFormData({ ...formData, totalCalories: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-32 text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Alimentação Normal */}
                  <Card>
                    <CardHeader className="bg-neutral-100">
                      <CardTitle className="text-center text-neutral-800">ALIMENTAÇÃO NORMAL</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <ToggleButton
                          value={formData.chooseHealthyMeals}
                          onChange={(value) => setFormData({ ...formData, chooseHealthyMeals: value })}
                        />
                        <p className="text-sm text-neutral-700 flex-1">
                          Selecionei, de modo saudável, minhas refeições
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <ToggleButton
                          value={formData.avoidRepeatingPlates}
                          onChange={(value) => setFormData({ ...formData, avoidRepeatingPlates: value })}
                        />
                        <p className="text-sm text-neutral-700 flex-1">
                          Evitei repetir pratos e balanceei o volume de comida em cada refeição
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Metabolismo */}
                  <Card>
                    <CardHeader className="bg-neutral-100">
                      <CardTitle className="text-center text-neutral-800">METABOLISMO</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <ToggleButton
                          value={formData.evacuatedLast24h}
                          onChange={(value) => setFormData({ ...formData, evacuatedLast24h: value })}
                        />
                        <p className="text-sm text-neutral-700 flex-1">
                          Evacuei nas últimas 24 horas
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <ToggleButton
                          value={formData.hadBodySwelling}
                          onChange={(value) => setFormData({ ...formData, hadBodySwelling: value })}
                        />
                        <p className="text-sm text-neutral-700 flex-1">
                          Tive inchaço em alguma região do meu corpo
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Alimentação Impulsiva */}
                  <Card>
                    <CardHeader className="bg-neutral-100">
                      <CardTitle className="text-center text-neutral-800">ALIMENTAÇÃO IMPULSIVA</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <ToggleButton
                          value={formData.hadEmotionalImpulses}
                          onChange={(value) => setFormData({ ...formData, hadEmotionalImpulses: value })}
                        />
                        <p className="text-sm text-neutral-700 flex-1">
                          Impulsos <strong>emocionais</strong> e <strong>internos</strong> prejudicaram a minha alimentação
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <ToggleButton
                          value={formData.hadEnvironmentalImpulses}
                          onChange={(value) => setFormData({ ...formData, hadEnvironmentalImpulses: value })}
                        />
                        <p className="text-sm text-neutral-700 flex-1">
                          Impulsos <strong>ambientais</strong> e <strong>externos</strong> prejudicaram a minha alimentação
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Autocontrole */}
                  <Card>
                    <CardHeader className="bg-neutral-100">
                      <CardTitle className="text-center text-neutral-800">AUTOCONTROLE</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <ToggleButton
                          value={formData.avoidedSelfSabotage}
                          onChange={(value) => setFormData({ ...formData, avoidedSelfSabotage: value })}
                        />
                        <p className="text-sm text-neutral-700 flex-1">
                          Evitei atitudes de autossabotagem
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Day Rating */}
                <Card>
                  <CardHeader className="bg-neutral-100">
                    <CardTitle className="text-center text-neutral-800">AVALIAÇÃO DO DIA</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center gap-4">
                      <StarRating
                        value={formData.dayRating}
                        onChange={(value) => setFormData({ ...formData, dayRating: value })}
                        className="justify-center"
                      />
                    </div>
                    <p className="text-center text-sm text-neutral-600 mt-2">
                      Como você avalia seu dia hoje?
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Observações Gerais</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Alguma observação adicional sobre seu dia, sentimentos, ou insights que teve?"
                    rows={4}
                    className="w-full"
                  />
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={saveReflectionMutation.isPending}
                  className="bg-primary hover:bg-primary/90 px-8"
                >
                  <Save className="w-4 h-4 mr-2 stroke-[1.5]" />
                  {saveReflectionMutation.isPending 
                    ? "Salvando..." 
                    : reflection 
                      ? "Atualizar Reflexão" 
                      : "Salvar Reflexão"
                  }
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
  );
}