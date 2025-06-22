import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, Plus } from "lucide-react";

interface MealFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
}

export default function MealForm({ isOpen, onClose, selectedDate }: MealFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: "",
    foods: "",
    time: new Date().toTimeString().slice(0, 5),
    date: selectedDate || new Date().toISOString().split('T')[0],
    photo: null as File | null,
  });

  const createMealMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/meals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/meals/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Refeição registrada!",
        description: "Sua refeição foi salva com sucesso.",
      });
      onClose();
      setFormData({
        type: "",
        foods: "",
        time: new Date().toTimeString().slice(0, 5),
        date: selectedDate || new Date().toISOString().split('T')[0],
        photo: null,
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível registrar a refeição.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.foods) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o tipo de refeição e os alimentos.",
        variant: "destructive",
      });
      return;
    }

    createMealMutation.mutate({
      type: formData.type,
      foods: formData.foods,
      time: formData.time,
      date: formData.date,
    });
  };

  const getMealTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      breakfast: "Café da Manhã",
      lunch: "Almoço",
      snack: "Lanche",
      dinner: "Jantar",
      supper: "Ceia",
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Refeição</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="meal-type">Tipo de Refeição *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Café da Manhã</SelectItem>
                <SelectItem value="lunch">Almoço</SelectItem>
                <SelectItem value="snack">Lanche</SelectItem>
                <SelectItem value="dinner">Jantar</SelectItem>
                <SelectItem value="supper">Ceia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="foods">Alimentos *</Label>
            <Textarea
              id="foods"
              value={formData.foods}
              onChange={(e) => setFormData({ ...formData, foods: e.target.value })}
              placeholder="Descreva os alimentos consumidos..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMealMutation.isPending}>
              {createMealMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}