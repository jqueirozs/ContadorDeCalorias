import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Target, Users, Trophy } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
              <Heart className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-800 mb-4">
            Emagrecimento
            <span className="block text-primary">Inteligente</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
            Sua jornada de emagrecimento com acompanhamento profissional, 
            comunidade ativa e ferramentas inteligentes para alcançar seus objetivos.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-3"
            onClick={() => window.location.href = "/api/login"}
          >
            Começar Agora
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Target className="text-primary" size={24} />
              </div>
              <CardTitle className="text-lg">Metas Personalizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Defina e acompanhe suas metas de peso com orientação profissional
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="text-secondary" size={24} />
              </div>
              <CardTitle className="text-lg">Comunidade Ativa</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Conecte-se com outras pessoas na mesma jornada e compartilhe experiências
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Heart className="text-accent" size={24} />
              </div>
              <CardTitle className="text-lg">Cuidado Mental</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Exercícios de autoprogramação e acompanhamento emocional diário
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Trophy className="text-primary" size={24} />
              </div>
              <CardTitle className="text-lg">Gamificação</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sistema de pontos e conquistas para manter você motivado
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary to-secondary text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Pronto para transformar sua vida?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Junte-se a milhares de pessoas que já estão transformando suas vidas 
              com o Emagrecimento Inteligente.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-3"
              onClick={() => window.location.href = "/api/login"}
            >
              Entrar na Plataforma
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
