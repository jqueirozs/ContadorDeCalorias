import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Heart, 
  BarChart3, 
  PlayCircle, 
  Users, 
  Brain, 
  FlipHorizontal2,
  Utensils,
  TrendingUp,
  MoreVertical,
  Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Curso", href: "/course", icon: PlayCircle },
    { name: "Comunidade", href: "/community", icon: Users },
    { name: "Academia da Mente", href: "/exercises", icon: Brain },
    { name: "Espelho", href: "/reflection", icon: FlipHorizontal2 },
    { name: "Calculadora", href: "/calculadora", icon: Calculator },
    { name: "Refeições", href: "/meals", icon: Utensils },
    { name: "Evolução", href: "/evolution", icon: TrendingUp },
  ];

  return (
    <div className="w-64 bg-card text-foreground shadow-lg flex flex-col fixed h-full z-10">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <Heart className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Emagrecimento</h1>
            <p className="text-sm text-muted-foreground">Inteligente</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start space-x-3 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <img 
            src={user?.profileImageUrl || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"}
            alt="Profile" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-medium text-foreground">
              {user?.firstName || "Usuário"}
            </p>
            <p className="text-sm text-muted-foreground">
              Membro desde {user?.memberSince ? new Date(user.memberSince).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Recente'}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <MoreVertical size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
