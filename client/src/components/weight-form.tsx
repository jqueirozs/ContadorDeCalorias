import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PointsAnimation } from "@/components/ui/points-animation";
import { Camera, Upload } from "lucide-react";

interface WeightFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeightForm({ isOpen, onClose }: WeightFormProps) {
  const { toast } = useToast();
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);

  const createWeightMutation = useMutation({
    mutationFn: async (data: { weight: number; notes?: string; photoUrl?: string; date: string }) => {
      return await apiRequest("POST", "/api/weight", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weight"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      setWeight("");
      setNotes("");
      setPhotoFile(null);
      setPhotoPreview(null);
      
      setShowPointsAnimation(true);
      onClose();
      
      toast({
        title: "Peso registrado!",
        description: "Seu peso foi registrado com sucesso e você ganhou 25 pontos!",
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
        description: "Não foi possível registrar o peso. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    return base64;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!weight || parseFloat(weight) <= 0) {
      toast({
        title: "Peso inválido",
        description: "Por favor, insira um peso válido.",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    let photoUrl;
    if (photoFile) {
      try {
        photoUrl = await uploadPhoto(photoFile);
      } catch (error) {
        toast({
          title: "Erro no upload",
          description: "Não foi possível fazer upload da foto. Continuando sem foto.",
          variant: "destructive",
        });
      }
    }
    
    createWeightMutation.mutate({
      weight: parseFloat(weight),
      notes: notes.trim() || undefined,
      photoUrl,
      date: today,
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-primary" />
              <span>Registrar Peso</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="weight" className="block text-sm font-medium text-neutral-700 mb-2">
                Peso (kg) *
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ex: 75.5"
                className="w-full"
                required
              />
            </div>

            <div>
              <Label htmlFor="photo" className="block text-sm font-medium text-neutral-700 mb-2">
                Foto de Progresso (opcional)
              </Label>
              <div className="space-y-3">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full"
                />
                
                {photoPreview && (
                  <div className="relative">
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-2 right-2"
                    >
                      Remover
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-2">
                Observações (opcional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Como você se sente? Alguma mudança notada?"
                rows={3}
                className="w-full"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={createWeightMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createWeightMutation.isPending}
              >
                {createWeightMutation.isPending ? (
                  "Salvando..."
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <PointsAnimation
        points={25}
        show={showPointsAnimation}
        onComplete={() => setShowPointsAnimation(false)}
      />
    </>
  );
}