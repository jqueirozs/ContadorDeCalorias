import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, BarChart3, Play, Users, Brain, FlipHorizontal2, Utensils, TrendingUp, LogOut, Menu, X, Calculator } from "lucide-react";
import { useState } from "react";

import Emagrecimento_Inteligente__1_ from "@assets/Emagrecimento Inteligente (1).png";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navigationItems = [
    { path: "/", icon: BarChart3, label: "Dashboard" },
    { path: "/curso", icon: Play, label: "Curso" },
    { path: "/comunidade", icon: Users, label: "Comunidade" },
    { path: "/exercicios", icon: Brain, label: "Academia da Mente" },
    { path: "/espelho", icon: FlipHorizontal2, label: "Espelho" },
    { path: "/calculadora", icon: Calculator, label: "Calculadora" },
    { path: "/refeicoes", icon: Utensils, label: "Refeições" },
    { path: "/evolucao", icon: TrendingUp, label: "Evolução" },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}
      {/* Sidebar */}
      <div className={`w-64 bg-white shadow-lg flex flex-col min-h-screen z-40 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0 fixed h-screen' : '-translate-x-full fixed h-screen'
      } lg:h-auto lg:translate-x-0 lg:relative lg:transform-none`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-center">
            <img 
              src={Emagrecimento_Inteligente__1_} 
              alt="Emagrecimento Inteligente" 
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center space-x-3 mb-3">
            <img 
              src={(user as any)?.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent((user as any)?.firstName || 'U')}&background=random`}
              alt="Perfil do usuário" 
              className="w-10 h-10 rounded-full object-cover" 
            />
            <div className="flex-1">
              <p className="font-medium text-neutral-800">
                {(user as any)?.firstName ? `${(user as any).firstName} ${(user as any).lastName || ''}`.trim() : 'Usuário'}
              </p>
              <p className="text-sm text-neutral-500">
                Membro desde {new Date((user as any)?.createdAt || Date.now()).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
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
    </>
  );
}