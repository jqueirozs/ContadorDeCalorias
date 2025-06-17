import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/sidebar";
import WeightForm from "@/components/weight-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Brain, Utensils, Star, Calendar, Lightbulb, Plus, Scale } from "lucide-react";

export default function Evolution() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [timeRange, setTimeRange] = useState("30");
  const [showWeightForm, setShowWeightForm] = useState(false);

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

  const { data: weightEntries, isLoading: weightLoading } = useQuery({
    queryKey: ["/api/weight", { limit: parseInt(timeRange) }],
    retry: false,
  });

  const { data: pointsHistory, isLoading: pointsLoading } = useQuery({
    queryKey: ["/api/points/history", { limit: parseInt(timeRange) }],
    retry: false,
  });

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/insights"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  // Transform weight data for chart
  const weightChartData = weightEntries?.map((entry: any) => ({
    date: new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    weight: parseFloat(entry.weight),
    fullDate: entry.date,
  })).reverse() || [];

  // Transform points data for chart
  const pointsChartData = pointsHistory?.reduce((acc: any[], point: any) => {
    const date = new Date(point.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.points += point.points;
    } else {
      acc.push({
        date,
        points: point.points,
        fullDate: point.date,
      });
    }
    
    return acc;
  }, []).reverse() || [];

  // Calculate statistics
  const weightStats = {
    current: weightEntries?.[0] ? parseFloat(weightEntries[0].weight) : null,
    previous: weightEntries?.[1] ? parseFloat(weightEntries[1].weight) : null,
    totalChange: weightEntries?.length >= 2 
      ? parseFloat(weightEntries[0].weight) - parseFloat(weightEntries[weightEntries.length - 1].weight)
      : 0,
  };

  const totalPointsInPeriod = pointsHistory?.reduce((sum: number, p: any) => sum + p.points, 0) || 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="font-medium text-neutral-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'weight' ? `Peso: ${entry.value} kg` : `Pontos: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 overflow-auto">
        <header className="bg-white shadow-sm border-b border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-800">Evolução e Progresso</h2>
              <p className="text-neutral-600 mt-1">Acompanhe sua jornada de transformação</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => setShowWeightForm(true)} className="bg-primary hover:bg-primary/90">
                <Scale className="w-4 h-4 mr-2" />
                Registrar Peso
              </Button>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-secondary">
                  {weightStats.current ? `${weightStats.current} kg` : 'N/A'}
                </div>
                <div className="text-sm text-neutral-600">Peso Atual</div>
                {weightStats.totalChange !== 0 && (
                  <div className={`text-xs mt-1 ${weightStats.totalChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {weightStats.totalChange < 0 ? '↓' : '↑'} {Math.abs(weightStats.totalChange).toFixed(1)} kg
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary">{totalPointsInPeriod}</div>
                <div className="text-sm text-neutral-600">Pontos no Período</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-accent">{weightEntries?.length || 0}</div>
                <div className="text-sm text-neutral-600">Registros de Peso</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">{pointsHistory?.length || 0}</div>
                <div className="text-sm text-neutral-600">Atividades Realizadas</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Evolution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-secondary" />
                  Evolução do Peso
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weightLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : weightChartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-neutral-500">
                    <div className="text-center">
                      <p className="text-lg font-medium mb-2">Sem dados de peso</p>
                      <p className="text-sm">Registre seu peso para ver a evolução</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                        <YAxis stroke="#64748B" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="hsl(142, 76%, 36%)"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: 'hsl(142, 76%, 36%)', strokeWidth: 2, fill: 'white' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Points Evolution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-primary" />
                  Pontos Diários
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pointsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : pointsChartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-neutral-500">
                    <div className="text-center">
                      <p className="text-lg font-medium mb-2">Sem dados de pontos</p>
                      <p className="text-sm">Complete atividades para ver seu progresso</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pointsChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                        <YAxis stroke="#64748B" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="points" 
                          fill="hsl(207, 90%, 54%)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-accent" />
                Insights Personalizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">Resumo do Progresso</h4>
                    <p className="text-neutral-700 leading-relaxed">{insights?.summary}</p>
                  </div>

                  {/* Patterns */}
                  {insights?.patterns && insights.patterns.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-2">Padrões Identificados</h4>
                      <ul className="space-y-2">
                        {insights.patterns.map((pattern: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-neutral-700">{pattern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {insights?.suggestions && insights.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-2">Sugestões para Melhorar</h4>
                      <ul className="space-y-2">
                        {insights.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-neutral-700">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Alerts */}
                  {insights?.alerts && insights.alerts.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Pontos de Atenção</h4>
                      <ul className="space-y-2">
                        {insights.alerts.map((alert: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-yellow-800">{alert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Brain className="w-5 h-5 mr-2 text-primary" />
                  Academia da Mente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Exercícios concluídos:</span>
                    <span className="font-medium">
                      {pointsHistory?.filter((p: any) => p.activity.includes('Exercício')).length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Pontos ganhos:</span>
                    <span className="font-medium text-primary">
                      +{pointsHistory?.filter((p: any) => p.activity.includes('Exercício'))
                        .reduce((sum: number, p: any) => sum + p.points, 0) || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Utensils className="w-5 h-5 mr-2 text-secondary" />
                  Refeições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Refeições registradas:</span>
                    <span className="font-medium">
                      {pointsHistory?.filter((p: any) => p.activity.includes('Refeição')).length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Pontos ganhos:</span>
                    <span className="font-medium text-secondary">
                      +{pointsHistory?.filter((p: any) => p.activity.includes('Refeição'))
                        .reduce((sum: number, p: any) => sum + p.points, 0) || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="w-5 h-5 mr-2 text-accent" />
                  Reflexões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Espelhos preenchidos:</span>
                    <span className="font-medium">
                      {pointsHistory?.filter((p: any) => p.activity.includes('Espelho')).length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Pontos ganhos:</span>
                    <span className="font-medium text-accent">
                      +{pointsHistory?.filter((p: any) => p.activity.includes('Espelho'))
                        .reduce((sum: number, p: any) => sum + p.points, 0) || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <WeightForm 
        isOpen={showWeightForm} 
        onClose={() => setShowWeightForm(false)} 
      />
    </div>
  );
}
