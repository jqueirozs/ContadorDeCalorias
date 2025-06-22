import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
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
    { path: "/", emoji: "📊", label: "Dashboard" },
    { path: "/curso", emoji: "▶️", label: "Curso" },
    { path: "/comunidade", emoji: "👥", label: "Comunidade" },
    { path: "/exercicios", emoji: "🧠", label: "Academia da Mente" },
    { path: "/espelho", emoji: "🪞", label: "Espelho" },
    { path: "/calculadora", emoji: "🧮", label: "Calculadora" },
    { path: "/refeicoes", emoji: "🍽️", label: "Refeições" },
    { path: "/evolucao", emoji: "📈", label: "Evolução" },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}
      {/* Sidebar */}
      <div
        className={`w-64 bg-card text-foreground shadow-lg flex flex-col min-h-screen z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "translate-x-0 fixed h-screen"
            : "-translate-x-full fixed h-screen"
        } lg:h-auto lg:translate-x-0 lg:relative lg:transform-none`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
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
            const isActive = location === item.path;

            return (
              <Link key={item.path} href={item.path}>
                <div
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex justify-center mb-3">
            <ThemeToggle />
          </div>
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={
                (user as any)?.profileImageUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent((user as any)?.firstName || "U")}&background=random`
              }
              alt="Perfil do usuário"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {(user as any)?.firstName
                  ? `${(user as any).firstName} ${(user as any).lastName || ""}`.trim()
                  : "Usuário"}
              </p>
              <p className="text-sm text-muted-foreground">
                Membro desde{" "}
                {new Date(
                  (user as any)?.createdAt || Date.now(),
                ).toLocaleDateString("pt-BR", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </>
  );
}
