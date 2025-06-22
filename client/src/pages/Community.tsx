import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Heart, MessageCircle, Pin, Clock } from "lucide-react";

export default function Community() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [newTopicCategory, setNewTopicCategory] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
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
  }, [user, isLoading, toast]);

  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ["/api/forum/topics"],
    retry: false,
  });

  const { data: replies } = useQuery({
    queryKey: ["/api/forum/topics", selectedTopic?.id, "replies"],
    enabled: !!selectedTopic,
    retry: false,
  });

  const createTopicMutation = useMutation({
    mutationFn: async (topicData: any) => {
      await apiRequest("POST", "/api/forum/topics", topicData);
    },
    onSuccess: () => {
      toast({
        title: "Tópico criado!",
        description: "Seu tópico foi publicado na comunidade.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
      setShowNewTopicModal(false);
      setNewTopicTitle("");
      setNewTopicContent("");
      setNewTopicCategory("");
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
        description: "Não foi possível criar o tópico.",
        variant: "destructive",
      });
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: async (replyData: any) => {
      await apiRequest("POST", "/api/forum/replies", replyData);
    },
    onSuccess: () => {
      toast({
        title: "Resposta enviada!",
        description: "Sua resposta foi publicada.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics", selectedTopic?.id, "replies"] });
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
        description: "Não foi possível enviar a resposta.",
        variant: "destructive",
      });
    },
  });

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTopicTitle || !newTopicContent) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e conteúdo do tópico.",
        variant: "destructive",
      });
      return;
    }

    createTopicMutation.mutate({
      title: newTopicTitle,
      content: newTopicContent,
      category: newTopicCategory || "geral",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading || topicsLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-neutral-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (selectedTopic) {
    return (
      <Layout>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedTopic(null)}
                className="mb-2"
              >
                ← Voltar aos tópicos
              </Button>
              <h2 className="text-2xl font-semibold text-neutral-800">{selectedTopic.title}</h2>
              <p className="text-neutral-600 mt-1">
                Por {selectedTopic.user.firstName} • {formatDate(selectedTopic.createdAt)}
              </p>
            </div>
          </div>
        </header>

        {/* Topic Content */}
        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Original Post */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <img 
                    src={selectedTopic.user.profileImageUrl || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face"}
                    alt="Profile" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-neutral-800">
                        {selectedTopic.user.firstName}
                      </h3>
                      <span className="text-sm text-neutral-500">
                        {formatDate(selectedTopic.createdAt)}
                      </span>
                      {selectedTopic.pinned && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Pin size={12} />
                          <span>Fixado</span>
                        </Badge>
                      )}
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-neutral-700 whitespace-pre-wrap">{selectedTopic.content}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-4">
                      <Button variant="ghost" size="sm" className="text-neutral-500">
                        <Heart size={16} className="mr-1" />
                        {selectedTopic.likes}
                      </Button>
                      <span className="text-sm text-neutral-500">
                        <MessageCircle size={16} className="inline mr-1" />
                        {selectedTopic.replies} respostas
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Replies */}
            <div className="space-y-4">
              {(replies as Array<{ id: number; user: { profileImageUrl?: string; firstName?: string }; content: string; createdAt: string; likes: number }> | undefined)?.map((reply: { id: number; user: { profileImageUrl?: string; firstName?: string }; content: string; createdAt: string; likes: number }) => (
                <Card key={reply.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <img 
                        src={reply.user.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"}
                        alt="Profile" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-neutral-800">
                            {reply.user.firstName}
                          </h4>
                          <span className="text-sm text-neutral-500">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-neutral-700 whitespace-pre-wrap">{reply.content}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Button variant="ghost" size="sm" className="text-neutral-500">
                            <Heart size={14} className="mr-1" />
                            {reply.likes}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Reply Form */}
            <Card>
              <CardContent className="p-4">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const content = formData.get('content') as string;
                  if (content.trim()) {
                    createReplyMutation.mutate({
                      topicId: selectedTopic.id,
                      content,
                    });
                    (e.target as HTMLFormElement).reset();
                  }
                }}>
                  <div className="space-y-3">
                    <Label htmlFor="reply-content">Sua resposta</Label>
                    <Textarea
                      id="reply-content"
                      name="content"
                      placeholder="Digite sua resposta..."
                      rows={4}
                      required
                    />
                    <div className="flex justify-end">
                      <Button 
                        type="submit"
                        disabled={createReplyMutation.isPending}
                      >
                        {createReplyMutation.isPending ? "Enviando..." : "Responder"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-800">Comunidade</h2>
            <p className="text-neutral-600 mt-1">Conecte-se com outros membros e compartilhe sua jornada</p>
          </div>
          <Dialog open={showNewTopicModal} onOpenChange={setShowNewTopicModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Novo Tópico
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Tópico</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTopic} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    placeholder="Digite o título do tópico..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={newTopicCategory}
                    onChange={(e) => setNewTopicCategory(e.target.value)}
                    placeholder="ex: motivação, dicas, receitas..."
                  />
                </div>

                <div>
                  <Label htmlFor="content">Conteúdo *</Label>
                  <Textarea
                    id="content"
                    value={newTopicContent}
                    onChange={(e) => setNewTopicContent(e.target.value)}
                    placeholder="Compartilhe seus pensamentos..."
                    rows={6}
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowNewTopicModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createTopicMutation.isPending}
                  >
                    {createTopicMutation.isPending ? "Criando..." : "Publicar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Community Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {(topics as Array<any> | undefined)?.map((topic: any) => (
            <Card 
              key={topic.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedTopic(topic)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <img 
                    src={topic.user.profileImageUrl || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face"}
                    alt="Profile" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-neutral-800 hover:text-primary">
                            {topic.title}
                          </h3>
                          {topic.pinned && (
                            <Pin size={16} className="text-primary" />
                          )}
                        </div>
                        <p className="text-neutral-600 text-sm line-clamp-2 mb-2">
                          {topic.content.length > 150 
                            ? `${topic.content.substring(0, 150)}...` 
                            : topic.content
                          }
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-neutral-500">
                          <span>{topic.user.firstName}</span>
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {formatDate(topic.createdAt)}
                          </span>
                          {topic.category && (
                            <Badge variant="outline" className="text-xs">
                              {topic.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center space-x-3 text-sm text-neutral-500">
                      <span className="flex items-center">
                        <Heart size={14} className="mr-1" />
                        {topic.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle size={14} className="mr-1" />
                        {topic.replies}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!topics || (topics as Array<any>).length === 0) && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle size={48} className="mx-auto text-neutral-400 mb-4" />
                <h3 className="text-lg font-medium text-neutral-800 mb-2">
                  Nenhuma discussão ainda
                </h3>
                <p className="text-neutral-600 mb-4">
                  Seja o primeiro a iniciar uma conversa na comunidade!
                </p>
                <Button onClick={() => setShowNewTopicModal(true)}>
                  <Plus size={16} className="mr-2" />
                  Criar Primeiro Tópico
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </Layout>
  );
}
