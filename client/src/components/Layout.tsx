import Sidebar from "./layout/sidebar";
import ThemeToggle from "./ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background relative">
      <Sidebar />
      <ThemeToggle />
      <div className="flex-1 lg:ml-0 overflow-auto">
        <div className="lg:pl-4 p-4">
          {children}
        </div>
      </div>
    </div>
  );
}