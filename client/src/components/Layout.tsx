import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 lg:ml-0 overflow-auto">
        <div className="lg:pl-4 p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
