import { useState } from "react";
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

interface MealFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MealForm({ isOpen, onClose }: MealFormProps) {
  const { toast } = useToast();
  const [mealType, setMealType] = useState("");
  const [time, setTime] = useState("");
  const [foods, setFoods] = useState("");
  const [calories, setCalories] = useState("");

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
      onClose();
      
      toast({
        title: "Refeição registrada!",
        description: "Sua refeição foi registrada com sucesso e você ganhou pontos!",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!mealType || !time || !foods.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    createMealMutation.mutate({
      type: mealType,
      time,
      foods: foods.trim(),
      calories: calories ? parseInt(calories) : undefined,
      date: today,
    });
  };

  const mealTypes = [
    { value: "breakfast", label: "Café da Manhã" },
    { value: "lunch", label: "Almoço" },
    { value: "snack", label: "Lanche" },
    { value: "dinner", label: "Jantar" },
    { value: "supper", label: "Ceia" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Refeição</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="meal-type" className="block text-sm font-medium text-neutral-700 mb-2">
              Tipo de Refeição
            </Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="time" className="block text-sm font-medium text-neutral-700 mb-2">
              Horário
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="foods" className="block text-sm font-medium text-neutral-700 mb-2">
              Alimentos Consumidos
            </Label>
            <Textarea
              id="foods"
              value={foods}
              onChange={(e) => setFoods(e.target.value)}
              placeholder="Descreva os alimentos consumidos..."
              rows={4}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="calories" className="block text-sm font-medium text-neutral-700 mb-2">
              Calorias Totais (opcional)
            </Label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="Ex: 450"
              min="0"
              className="w-full"
            />
          </div>

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
              type="submit"
              disabled={createMealMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {createMealMutation.isPending ? "Registrando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
