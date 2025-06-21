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
import { parseMealFromVoice, generateVoicePrompt } from "@/lib/voiceParser";
import { Mic, Edit3 } from "lucide-react";

interface MealFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
}

export default function MealForm({ isOpen, onClose, selectedDate }: MealFormProps) {
  const { toast } = useToast();
  const [mealType, setMealType] = useState("");
  const [time, setTime] = useState("");
  const [foods, setFoods] = useState("");
  const [calories, setCalories] = useState("");
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [voicePrompt, setVoicePrompt] = useState("");

  // Update date when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, [selectedDate]);

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

  const createMealMutation = useMutation({
    mutationFn: async (data: { type: string; time: string; foods: string; calories?: number; date: string }) => {
      return await apiRequest("POST", "/api/meals", data);
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
      
      setShowPointsAnimation(true);
      onClose();
      
      toast({
        title: "Refeição registrada!",
        description: "Sua refeição foi registrada com sucesso e você ganhou 10 pontos!",
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

    createMealMutation.mutate({
      type: mealType,
      time,
      foods,
      calories: calories ? parseInt(calories) : undefined,
      date,
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Refeição</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4" />
                <span>Manual</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center space-x-2">
                <Mic className="w-4 h-4" />
                <span>Por Voz</span>
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
              />

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
              disabled={createMealMutation.isPending || (!mealType || !time || !foods)}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {createMealMutation.isPending ? "Registrando..." : "Registrar"}
            </Button>
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