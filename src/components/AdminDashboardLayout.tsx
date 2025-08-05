import { useState } from "react";
import { useLocation } from "react-router-dom";
import { RoleBasedNavbar } from "@/components/RoleBasedNavbar";
import { PersonalizedGreeting } from "@/components/PersonalizedGreeting";
import { AdminDashboard } from "@/components/AdminDashboard";

interface AdminDashboardLayoutProps {
  activeTab?: string;
  edit?: boolean;
}

export const AdminDashboardLayout = ({ activeTab: propActiveTab, edit = false }: AdminDashboardLayoutProps) => {
  const [language, setLanguage] = useState<"en" | "sw">("en");
  const location = useLocation();
  
  // Determine active tab from URL if not provided
  const getActiveTabFromPath = (pathname: string) => {
    if (pathname.includes("/admin/overview")) return "overview";
    if (pathname.includes("/admin/applicants")) return "applicants";
    if (pathname.includes("/admin/analytics")) return "analytics";
    if (pathname.includes("/admin/risk-alerts")) return "alerts";
    if (pathname.includes("/admin/sectors")) return "sectors";
    if (pathname.includes("/admin/data-reports")) return "data-tools";
    if (pathname.includes("/admin/profile") || pathname.includes("/admin/settings")) return "settings";
    return "overview";
  };

  const activeTab = propActiveTab || getActiveTabFromPath(location.pathname);

  return (
    <div className="min-h-screen bg-white">
      <RoleBasedNavbar role="admin" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PersonalizedGreeting role="admin" language={language} />
        
        <div className="mt-6">
          <AdminDashboard language={language} activeTab={activeTab} editMode={edit} />
        </div>
      </div>
    </div>
  );
}; 