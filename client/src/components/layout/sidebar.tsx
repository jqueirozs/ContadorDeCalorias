import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, BarChart3, Play, Users, Brain, FlipHorizontal2, Utensils, TrendingUp, LogOut } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navigationItems = [
    { path: "/", icon: BarChart3, label: "Dashboard" },
    { path: "/curso", icon: Play, label: "Curso" },
    { path: "/comunidade", icon: Users, label: "Comunidade" },
    { path: "/exercicios", icon: Brain, label: "Academia da Mente" },
    { path: "/espelho", icon: FlipHorizontal2, label: "Espelho" },
    { path: "/refeicoes", icon: Utensils, label: "Refeições" },
    { path: "/evolucao", icon: TrendingUp, label: "Evolução" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col fixed h-full z-10">
      {/* Logo Section */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
            <Heart className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-800">Emagrecimento</h1>
            <p className="text-sm text-neutral-500">Inteligente</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center space-x-3 mb-3">
          <img 
            src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'U')}&background=random`}
            alt="Perfil do usuário" 
            className="w-10 h-10 rounded-full object-cover" 
          />
          <div className="flex-1">
            <p className="font-medium text-neutral-800">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Usuário'}
            </p>
            <p className="text-sm text-neutral-500">
              Membro desde {new Date(user?.createdAt || Date.now()).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="w-full text-neutral-600 hover:text-neutral-800"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
}
