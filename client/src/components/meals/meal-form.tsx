import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PointsAnimation } from "@/components/ui/points-animation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VoiceInput from "@/components/ui/voice-input";
import PhotoUpload from "@/components/ui/photo-upload";
import { parseMealFromVoice, generateVoicePrompt } from "@/lib/voiceParser";
import { Mic, Edit3, Camera, Trash2, Upload, Search } from "lucide-react";

interface MealFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  editingMeal?: any;
}

export default function MealForm({ isOpen, onClose, selectedDate, editingMeal }: MealFormProps) {
  const { toast } = useToast();
  const [mealType, setMealType] = useState("");
  const [time, setTime] = useState("");
  const [foods, setFoods] = useState("");
  const [calories, setCalories] = useState("");
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [nutrients, setNutrients] = useState<any>(null);
  const [photoAnalysis, setPhotoAnalysis] = useState<any>(null);
  const [isPhotoAnalyzing, setIsPhotoAnalyzing] = useState(false);
  const [voicePrompt, setVoicePrompt] = useState("");

  // Update date when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, [selectedDate]);

  // Load meal data when editing
  useEffect(() => {
    if (editingMeal) {
      setMealType(editingMeal.type || "");
      setTime(editingMeal.time || "");
      setFoods(editingMeal.foods || "");
      setCalories(editingMeal.calories ? editingMeal.calories.toString() : "");
      setDate(editingMeal.date || selectedDate || new Date().toISOString().split('T')[0]);

      // Load nutrients if available
      if (editingMeal.protein || editingMeal.carbohydrates || editingMeal.fat) {
        setNutrients({
          calories: editingMeal.calories || 0,
          protein: parseFloat(editingMeal.protein || '0'),
          carbohydrates: parseFloat(editingMeal.carbohydrates || '0'),
          fat: parseFloat(editingMeal.fat || '0'),
          fiber: parseFloat(editingMeal.fiber || '0'),
          sugar: parseFloat(editingMeal.sugar || '0'),
          sodium: parseFloat(editingMeal.sodium || '0'),
        });
      }
    } else {
      // Reset form when not editing
      setMealType("");
      setTime("");
      setFoods("");
      setCalories("");
      setDate(selectedDate || new Date().toISOString().split('T')[0]);
      setNutrients(null);
      setPhotoAnalysis(null);
    }
  }, [editingMeal, selectedDate]);

  // Update voice prompt when form data changes
  useEffect(() => {
    setVoicePrompt(generateVoicePrompt({ type: mealType, time, foods, calories: calories ? parseInt(calories) : undefined }));
  }, [mealType, time, foods, calories]);

  const handleVoiceTranscript = async (transcript: string) => {
    try {
      // Show processing message
      toast({
        title: "Processando fala...",
        description: "Aguarde enquanto a IA processa e corrige sua transcrição.",
      });

      // Send to AI for processing
      const response = await apiRequest("POST", "/api/voice/process", { transcript });
      const processed = await response.json();

      // Apply processed data
      if (processed.mealType) setMealType(processed.mealType);
      if (processed.time) setTime(processed.time);
      if (processed.formattedDescription) setFoods(processed.formattedDescription);
      if (processed.calories) setCalories(processed.calories.toString());

      // Show success message
      toast({
        title: "Fala processada com IA!",
        description: "Os dados foram extraídos e formatados automaticamente. Verifique se estão corretos.",
      });
    } catch (error) {
      console.error("Error processing voice:", error);

      // Fallback to local processing
      const parsed = parseMealFromVoice(transcript);

      if (parsed.type) setMealType(parsed.type);
      if (parsed.time) setTime(parsed.time);
      if (parsed.foods) setFoods(parsed.foods);
      if (parsed.calories) setCalories(parsed.calories.toString());

      toast({
        title: "Fala processada!",
        description: "Processado localmente. Verifique se os dados estão corretos.",
        variant: "destructive",
      });
    }
  };

  const handlePhotoAnalyzed = (analysis: any) => {
    setIsPhotoAnalyzing(false);
    setPhotoAnalysis(analysis);

    if (analysis.error) {
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar a foto. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    // Auto-fill form based on photo analysis
    if (analysis.mealType) setMealType(analysis.mealType);
    if (analysis.description) setFoods(analysis.description);
    if (analysis.nutrients?.calories) setCalories(Math.round(analysis.nutrients.calories).toString());

    // Set current time as default
    if (!time) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    }

    setNutrients(analysis.nutrients);

    toast({
      title: "Foto analisada com IA!",
      description: `${analysis.foods?.length || 0} alimentos identificados. Dados preenchidos automaticamente.`,
    });
  };

  const handlePhotoAnalyzing = () => {
    setIsPhotoAnalyzing(true);
  };

  const createMealMutation = useMutation({
    mutationFn: async (data: { type: string; time: string; foods: string; calories?: number; date: string }) => {
      if (editingMeal) {
        return await apiRequest("PUT", `/api/meals/${editingMeal.id}`, data);
      } else {
        return await apiRequest("POST", "/api/meals", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/meals/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });

      setMealType("");
      setTime("");
      setFoods("");
      setCalories("");
      setDate(selectedDate || new Date().toISOString().split('T')[0]);
      setActiveTab("manual");
      setNutrients(null);
      setPhotoAnalysis(null);
      setIsPhotoAnalyzing(false);

      if (!editingMeal) {
        setShowPointsAnimation(true);
      }
      onClose();

      toast({
        title: editingMeal ? "Refeição atualizada!" : "Refeição registrada!",
        description: editingMeal 
          ? "Sua refeição foi atualizada com sucesso!" 
          : "Sua refeição foi registrada com sucesso e você ganhou 10 pontos!",
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
        description: "Não foi possível registrar a refeição. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMealMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/meals/${editingMeal.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Refeição excluída!",
        description: "Sua refeição foi excluída com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/meals/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onClose();
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
        description: "Não foi possível excluir a refeição.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!mealType || !time || !foods) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Prepare meal data with nutrients if available
    const mealData: any = {
      type: mealType,
      time,
      foods,
      calories: calories ? parseInt(calories) : undefined,
      date,
    };

    // Add nutrient data if available from photo analysis
    if (nutrients) {
      mealData.protein = nutrients.protein || 0;
      mealData.carbohydrates = nutrients.carbohydrates || 0;
      mealData.fat = nutrients.fat || 0;
      mealData.fiber = nutrients.fiber || 0;
      mealData.sugar = nutrients.sugar || 0;
      mealData.sodium = nutrients.sodium || 0;
    }

    // Add photo analysis metadata if available
    if (photoAnalysis) {
      mealData.analysisConfidence = photoAnalysis.confidence;
      mealData.identifiedFoods = photoAnalysis.foods;
      mealData.estimatedPortions = photoAnalysis.estimatedPortions;
    }

    createMealMutation.mutate(mealData);
  };

  const [isListening, setIsListening] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMeal ? "Editar Refeição" : "Registrar Refeição"}</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual" className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4" />
                <span>Manual</span>
              </TabsTrigger>
              <TabsTrigger value="photo" className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>Foto</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center space-x-2">
                <Mic className="w-4 h-4" />
                <span>Voz</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mealType" className="block text-sm font-medium text-neutral-700 mb-2">
                    Tipo de Refeição *
                  </Label>
                  <Select value={mealType} onValueChange={setMealType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de refeição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Café da Manhã</SelectItem>
                      <SelectItem value="lunch">Almoço</SelectItem>
                      <SelectItem value="dinner">Jantar</SelectItem>
                      <SelectItem value="snack">Lanche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date" className="block text-sm font-medium text-neutral-700 mb-2">
                    Data *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="time" className="block text-sm font-medium text-neutral-700 mb-2">
                    Horário *
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="foods" className="block text-sm font-medium text-neutral-700 mb-2">
                    Alimentos *
                  </Label>
                  <Textarea
                    id="foods"
                    value={foods}
                    onChange={(e) => setFoods(e.target.value)}
                    placeholder="Descreva o que você comeu..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="calories" className="block text-sm font-medium text-neutral-700 mb-2">
                    Calorias (opcional)
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    max="5000"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="Ex: 450"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="photo" className="space-y-4">
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Análise por Foto com IA</h3>
                <p className="text-sm text-green-700 mb-4">
                  Tire uma foto da sua refeição e a IA identificará automaticamente os alimentos e nutrientes.
                </p>
                <div className="text-xs text-green-600 bg-white p-2 rounded border border-green-200">
                  <strong>Dicas:</strong><br />
                  • Tire a foto com boa iluminação<br />
                  • Mostre todos os alimentos claramente<br />
                  • Evite sombras sobre a comida
                </div>
              </div>

              <PhotoUpload
                onPhotoAnalyzed={handlePhotoAnalyzed}
                onAnalyzing={handlePhotoAnalyzing}
                disabled={createMealMutation.isPending || isPhotoAnalyzing}
              >
                <Button disabled={createMealMutation.isPending || isPhotoAnalyzing}>
                  {isPhotoAnalyzing ? (
                    <>
                      <Search className="w-4 h-4 mr-2 animate-spin stroke-[1.5]" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2 stroke-[1.5]" />
                      Tirar Foto
                    </>
                  )}
                </Button>
              </PhotoUpload>

              {photoAnalysis && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Análise da IA:</h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div><strong>Confiança:</strong> {Math.round((photoAnalysis.confidence || 0) * 100)}%</div>
                      {photoAnalysis.foods && photoAnalysis.foods.length > 0 && (
                        <div><strong>Alimentos identificados:</strong> {photoAnalysis.foods.join(', ')}</div>
                      )}
                      {photoAnalysis.estimatedPortions && photoAnalysis.estimatedPortions.length > 0 && (
                        <div><strong>Porções estimadas:</strong> {photoAnalysis.estimatedPortions.join(', ')}</div>
                      )}
                    </div>
                  </div>

                  {nutrients && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Informações Nutricionais:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-yellow-800">
                        <div><strong>Calorias:</strong> {Math.round(nutrients.calories)} kcal</div>
                        <div><strong>Proteínas:</strong> {Math.round(nutrients.protein)}g</div>
                        <div><strong>Carboidratos:</strong> {Math.round(nutrients.carbohydrates)}g</div>
                        <div><strong>Gorduras:</strong> {Math.round(nutrients.fat)}g</div>
                        {nutrients.fiber > 0 && <div><strong>Fibras:</strong> {Math.round(nutrients.fiber)}g</div>}
                        {nutrients.sugar > 0 && <div><strong>Açúcares:</strong> {Math.round(nutrients.sugar)}g</div>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="voice" className="space-y-4">
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Registro por Voz com IA</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Fale naturalmente sobre sua refeição. A IA vai corrigir e formatar sua fala automaticamente.
                </p>
                <div className="text-xs text-blue-600 bg-white p-2 rounded border border-blue-200">
                  <strong>Exemplos:</strong><br />
                  "Almoço às 13:30 com arroz, feijão e frango"<br />
                  "Café da manhã com pão e café às 8 horas"
                </div>
              </div>

              <VoiceInput
                onTranscript={handleVoiceTranscript}
                placeholder="Clique no microfone e descreva sua refeição"
                disabled={createMealMutation.isPending}
              >
                <Button
                  variant="secondary"
                  className="w-full h-10 rounded-md p-2 flex items-center justify-center"
                  disabled={createMealMutation.isPending}
                  onClick={() => setIsListening(!isListening)}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 mr-2 stroke-[1.5]" />
                  ) : (
                    <Mic className="w-4 h-4 mr-2 stroke-[1.5]" />
                  )}
                  {isListening ? "Gravando..." : "Gravar Refeição"}
                </Button>
              </VoiceInput>

              {(mealType || time || foods) && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Dados Processados pela IA:</h4>
                  <div className="space-y-1 text-sm text-green-800">
                    {mealType && <div><strong>Tipo:</strong> {
                      mealType === 'breakfast' ? 'Café da Manhã' :
                      mealType === 'lunch' ? 'Almoço' :
                      mealType === 'dinner' ? 'Jantar' :
                      mealType === 'snack' ? 'Lanche' :
                      mealType === 'supper' ? 'Ceia' : mealType
                    }</div>}
                    {time && <div><strong>Horário:</strong> {time}</div>}
                    {foods && <div><strong>Alimentos:</strong> {foods}</div>}
                    {calories && <div><strong>Calorias:</strong> {calories}</div>}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={createMealMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMealMutation.isPending || isPhotoAnalyzing || (!mealType || !time || !foods)}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {createMealMutation.isPending ? (editingMeal ? "Atualizando..." : "Registrando...") : 
               isPhotoAnalyzing ? "Analisando foto..." : (editingMeal ? "Atualizar" : "Registrar")}
            </Button>
                         {editingMeal && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => deleteMealMutation.mutate()}
                                    disabled={deleteMealMutation.isPending}
                                >
                                    {deleteMealMutation.isPending ? "Excluindo..." : (
                                        <>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Excluir
                                        </>
                                    )}
                                </Button>
                            )}
          </div>
        </DialogContent>
      </Dialog>

      <PointsAnimation
        points={10}
        show={showPointsAnimation}
        onComplete={() => setShowPointsAnimation(false)}
      />
    </>
  );
}