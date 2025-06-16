import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Brain, Users, TrendingUp } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-800">Emagrecimento</h1>
              <p className="text-sm text-neutral-600">Inteligente</p>
            </div>
          </div>
          <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90">
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6">
            Sua Jornada de <span className="text-primary">Emagrecimento</span>
            <br />
            Começa Aqui
          </h2>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Uma plataforma completa que combina ciência, tecnologia e suporte comunitário 
            para transformar sua relação com a alimentação e conquistar seus objetivos.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
          >
            Começar Agora
          </Button>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-20">
          <h3 className="text-2xl font-semibold text-center text-neutral-800 mb-12">
            Tudo que você precisa em um só lugar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Academia da Mente</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Exercícios diários de autoprogramação para fortalecer sua mentalidade de emagrecimento.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-lg">Espelho do Comportamento</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Reflexões diárias para entender padrões alimentares e emocionais.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-lg">Comunidade</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Conecte-se com pessoas que compartilham os mesmos objetivos.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Evolução</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Acompanhe seu progresso com gráficos detalhados e insights personalizados.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-20 text-center">
          <Card className="bg-primary text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Pronto para transformar sua vida?
              </CardTitle>
              <CardDescription className="text-blue-100">
                Junte-se a milhares de pessoas que já estão alcançando seus objetivos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleLogin}
                variant="secondary"
                size="lg"
                className="bg-white text-primary hover:bg-gray-100"
              >
                Entrar na Plataforma
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
