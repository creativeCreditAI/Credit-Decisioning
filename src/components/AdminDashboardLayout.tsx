import { useState } from "react";
import { RoleBasedNavbar } from "@/components/RoleBasedNavbar";
import { PersonalizedGreeting } from "@/components/PersonalizedGreeting";
import { AdminDashboard } from "@/components/AdminDashboard";

export const AdminDashboardLayout = () => {
  const [language, setLanguage] = useState<"en" | "sw">("en");

  return (
    <div className="min-h-screen bg-neutral-light">
      <RoleBasedNavbar role="admin" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PersonalizedGreeting role="admin" language={language} />
        
        <div className="mt-6">
          <AdminDashboard language={language} />
        </div>
      </div>
    </div>
  );
}; 