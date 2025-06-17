import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, MessageCircle, Plus, Search } from "lucide-react";

export default function Community() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ["/api/forum/topics"],
    retry: false,
  });

  const createTopicMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      return await apiRequest("POST", "/api/forum/topics", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
      setNewTopicTitle("");
      setNewTopicContent("");
      setIsCreateDialogOpen(false);
      toast({
        title: "Tópico criado!",
        description: "Seu tópico foi publicado com sucesso.",
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
        description: "Não foi possível criar o tópico. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const likeTopicMutation = useMutation({
    mutationFn: async (topicId: number) => {
      return await apiRequest("POST", `/api/forum/topics/${topicId}/like`);
    },
    onSuccess: (data, topicId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
      toast({
        title: "Curtida adicionada!",
        description: "Obrigado por engajar com a comunidade.",
        duration: 2000,
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
        title: "Erro ao curtir",
        description: "Não foi possível curtir o post. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const filteredTopics = topics?.filter((topic: any) =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateTopic = () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e o conteúdo.",
        variant: "destructive",
      });
      return;
    }

    createTopicMutation.mutate({
      title: newTopicTitle.trim(),
      content: newTopicContent.trim(),
    });
  };

  return (
    <div className="overflow-auto">
        <header className="bg-white shadow-sm border-b border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-800">Comunidade</h2>
              <p className="text-neutral-600 mt-1">Conecte-se e compartilhe sua jornada</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Tópico
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Novo Tópico</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Título
                    </label>
                    <Input
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      placeholder="Digite o título do tópico..."
                      maxLength={255}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Conteúdo
                    </label>
                    <Textarea
                      value={newTopicContent}
                      onChange={(e) => setNewTopicContent(e.target.value)}
                      placeholder="Compartilhe sua mensagem com a comunidade..."
                      rows={6}
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateTopic}
                      disabled={createTopicMutation.isPending}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      {createTopicMutation.isPending ? "Publicando..." : "Publicar"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <Input
                placeholder="Buscar tópicos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Topics List */}
          <div className="space-y-4">
            {topicsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-neutral-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                          <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                          <div className="h-16 bg-neutral-200 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTopics.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                      {searchTerm ? "Nenhum tópico encontrado" : "Seja o primeiro a participar!"}
                    </h3>
                    <p className="text-neutral-600 mb-4">
                      {searchTerm 
                        ? "Tente ajustar sua busca ou crie um novo tópico."
                        : "Compartilhe sua jornada, tire dúvidas e conecte-se com outros membros."
                      }
                    </p>
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Criar Primeiro Tópico
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredTopics.map((topic: any) => (
                <Card key={topic.id} className="hover:shadow-md transition-all duration-200 hover:border-primary/20 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={topic.user?.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topic.user?.firstName || 'U')}&background=random&color=ffffff`}
                        alt={`Avatar de ${topic.user?.firstName || 'Usuário'}`}
                        className="w-10 h-10 rounded-full object-cover border-2 border-neutral-100 hover:border-primary/30 transition-colors"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-neutral-800 text-lg">{topic.title}</h3>
                            <p className="text-sm text-neutral-500">
                              Por {topic.user?.firstName || 'Usuário'} • {new Date(topic.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-neutral-700 mb-4 leading-relaxed">
                          {topic.content.length > 200 
                            ? `${topic.content.slice(0, 200)}...` 
                            : topic.content
                          }
                        </p>
                        
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              likeTopicMutation.mutate(topic.id);
                            }}
                            disabled={likeTopicMutation.isPending}
                            className="text-neutral-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Heart 
                              className={`w-4 h-4 mr-1 ${likeTopicMutation.isPending ? 'animate-pulse' : ''}`}
                              fill={topic.likes > 0 ? 'currentColor' : 'none'}
                            />
                            <span className="font-medium">{topic.likes}</span>
                            <span className="text-xs ml-1">
                              {topic.likes === 1 ? 'curtida' : 'curtidas'}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-neutral-600 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Aqui você pode adicionar navegação para comentários no futuro
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            <span className="font-medium">{topic.commentCount}</span>
                            <span className="text-xs ml-1">
                              {topic.commentCount === 1 ? 'comentário' : 'comentários'}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
  );
}
