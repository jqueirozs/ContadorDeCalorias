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
import { Switch } from "@/components/ui/switch";
import { FlipHorizontal2, Save, CheckCircle, Star } from "lucide-react";

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
    // Novas perguntas do balanço diário
    selectedHealthyMeals: false,
    avoidedRepeatingDishes: false,
    hadEmotionalImpulses: false,
    hadEnvironmentalImpulses: false,
    evacuatedLast24h: false,
    hadBodySwelling: false,
    avoidedSelfSabotage: false,
    dayRating: 0,
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
        selectedHealthyMeals: reflection.selectedHealthyMeals || false,
        avoidedRepeatingDishes: reflection.avoidedRepeatingDishes || false,
        hadEmotionalImpulses: reflection.hadEmotionalImpulses || false,
        hadEnvironmentalImpulses: reflection.hadEnvironmentalImpulses || false,
        evacuatedLast24h: reflection.evacuatedLast24h || false,
        hadBodySwelling: reflection.hadBodySwelling || false,
        avoidedSelfSabotage: reflection.avoidedSelfSabotage || false,
        dayRating: reflection.dayRating || 0,
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
      selectedHealthyMeals: formData.selectedHealthyMeals,
      avoidedRepeatingDishes: formData.avoidedRepeatingDishes,
      hadEmotionalImpulses: formData.hadEmotionalImpulses,
      hadEnvironmentalImpulses: formData.hadEnvironmentalImpulses,
      evacuatedLast24h: formData.evacuatedLast24h,
      hadBodySwelling: formData.hadBodySwelling,
      avoidedSelfSabotage: formData.avoidedSelfSabotage,
      dayRating: formData.dayRating,
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
            <div className="flex items-center space-x-2">
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

              {/* Balanço Diário */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Balanço Diário</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Alimentação Normal */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">ALIMENTAÇÃO NORMAL</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="healthy-meals" className="text-sm font-medium">
                          Selecionei, de modo saudável, minhas refeições
                        </Label>
                        <Switch
                          id="healthy-meals"
                          checked={formData.selectedHealthyMeals}
                          onCheckedChange={(checked) => setFormData({ ...formData, selectedHealthyMeals: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="avoided-repeating" className="text-sm font-medium">
                          Evitei repetir pratos e balanceei o volume de comida em cada refeição
                        </Label>
                        <Switch
                          id="avoided-repeating"
                          checked={formData.avoidedRepeatingDishes}
                          onCheckedChange={(checked) => setFormData({ ...formData, avoidedRepeatingDishes: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alimentação Impulsiva */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">ALIMENTAÇÃO IMPULSIVA</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emotional-impulses" className="text-sm font-medium">
                          Impulsos <span className="underline">emocionais</span> e <span className="underline">internos</span> prejudicaram a minha alimentação
                        </Label>
                        <Switch
                          id="emotional-impulses"
                          checked={formData.hadEmotionalImpulses}
                          onCheckedChange={(checked) => setFormData({ ...formData, hadEmotionalImpulses: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="environmental-impulses" className="text-sm font-medium">
                          Impulsos <span className="underline">ambientais</span> e <span className="underline">externos</span> prejudicaram a minha alimentação
                        </Label>
                        <Switch
                          id="environmental-impulses"
                          checked={formData.hadEnvironmentalImpulses}
                          onCheckedChange={(checked) => setFormData({ ...formData, hadEnvironmentalImpulses: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Metabolismo e Autocontrole */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">METABOLISMO</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="evacuated" className="text-sm font-medium">
                            Evacuei nas últimas 24 horas
                          </Label>
                          <Switch
                            id="evacuated"
                            checked={formData.evacuatedLast24h}
                            onCheckedChange={(checked) => setFormData({ ...formData, evacuatedLast24h: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="swelling" className="text-sm font-medium">
                            Tive inchaço em alguma região do meu corpo
                          </Label>
                          <Switch
                            id="swelling"
                            checked={formData.hadBodySwelling}
                            onCheckedChange={(checked) => setFormData({ ...formData, hadBodySwelling: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">AUTOCONTROLE</h3>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="self-sabotage" className="text-sm font-medium">
                          Evitei atitudes de autosabotagem
                        </Label>
                        <Switch
                          id="self-sabotage"
                          checked={formData.avoidedSelfSabotage}
                          onCheckedChange={(checked) => setFormData({ ...formData, avoidedSelfSabotage: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Avaliação do Dia */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">AVALIAÇÃO DO DIA</h3>
                    <div className="flex items-center justify-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, dayRating: star })}
                          className={`p-1 transition-colors ${
                            star <= formData.dayRating 
                              ? 'text-yellow-400 hover:text-yellow-500' 
                              : 'text-gray-300 hover:text-gray-400'
                          }`}
                        >
                          <Star 
                            className="w-8 h-8" 
                            fill={star <= formData.dayRating ? 'currentColor' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">
                      {formData.dayRating === 0 && "Clique nas estrelas para avaliar seu dia"}
                      {formData.dayRating === 1 && "Dia muito difícil"}
                      {formData.dayRating === 2 && "Dia difícil"}
                      {formData.dayRating === 3 && "Dia regular"}
                      {formData.dayRating === 4 && "Dia bom"}
                      {formData.dayRating === 5 && "Dia excelente"}
                    </p>
                  </div>
                </CardContent>
              </Card>

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
                  <Save className="w-4 h-4 mr-2" />
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
