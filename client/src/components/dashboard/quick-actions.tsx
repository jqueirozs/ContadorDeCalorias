import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardCheck, Dumbbell } from "lucide-react";
import MealForm from "@/components/meals/meal-form";

export default function QuickActions() {
  const [showMealForm, setShowMealForm] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => setShowMealForm(true)}
            className="w-full flex items-center space-x-3 p-3 bg-primary text-white hover:bg-primary/90 mt-[20px] mb-[20px]"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Registrar Refeição</span>
          </Button>
          
          <Link href="/espelho">
            <Button className="w-full flex items-center space-x-3 p-3 bg-secondary text-white hover:bg-secondary/90 mt-[20px] mb-[20px]">
              <ClipboardCheck className="w-4 h-4" />
              <span className="font-medium">Preencher Espelho</span>
            </Button>
          </Link>
          
          <Link href="/exercicios">
            <Button className="w-full flex items-center space-x-3 p-3 bg-accent text-white hover:bg-accent/90">
              <Dumbbell className="w-4 h-4" />
              <span className="font-medium">Exercícios Mente</span>
            </Button>
          </Link>
        </CardContent>
      </Card>

      <MealForm 
        isOpen={showMealForm} 
        onClose={() => setShowMealForm(false)} 
      />
    </>
  );
}
