import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 lg:ml-0 overflow-auto">
        <div className="lg:pl-4 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;