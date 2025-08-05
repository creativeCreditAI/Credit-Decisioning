import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Home,
  FileText,
  MessageSquare,
  MessageCircle,
  BarChart3,
  Users,
  AlertTriangle,
  MapPin,
  Database,
  Shield,
  Edit
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface RoleBasedNavbarProps {
  role: "user" | "admin";
}

export const RoleBasedNavbar = ({ role }: RoleBasedNavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const handleNavClick = (href: string) => {
    if (href === "#chatbot") {
      // Scroll to WhatsApp chatbot
      const chatbotElement = document.querySelector('[data-chatbot="whatsapp"]');
      if (chatbotElement) {
        chatbotElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (href === "#progress") {
      // Scroll to progress section in dashboard
      const progressElement = document.querySelector('[data-section="progress"]');
      if (progressElement) {
        progressElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        // If not on dashboard, navigate to dashboard first
        navigate("/dashboard");
        // Then scroll after a short delay
        setTimeout(() => {
          const progressElement = document.querySelector('[data-section="progress"]');
          if (progressElement) {
            progressElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      }
    } else {
      navigate(href);
    }
  };

  const userNavLinks = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "#progress", label: "Application Progress", icon: FileText },
    { href: "/feedback", label: "Feedback", icon: MessageSquare },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const adminNavLinks = [
    { href: "/admin/overview", label: "Overview", icon: BarChart3 },
    { href: "/admin/applicants", label: "Applicants", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/risk-alerts", label: "Risk Alerts", icon: AlertTriangle },
    { href: "/admin/sectors", label: "Sectors", icon: MapPin },
    { href: "/admin/data-reports", label: "Data & Reports", icon: Database },
    { href: "/admin/profile", label: "Admin Profile", icon: Shield },
  ];

  const navLinks = role === "admin" ? adminNavLinks : userNavLinks;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to={role === "admin" ? "/admin/dashboard" : "/dashboard"} className="flex items-center space-x-2">
          <img src="/heva-logo.svg" alt="HEVA" className="w-8 h-8" />
          <span className="font-bold text-xl text-gray-900">HEVA</span>
          {role === "admin" && (
            <span className="text-sm text-muted-foreground ml-2">Admin</span>
          )}
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(link.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:text-primary hover:bg-primary/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  {user?.name?.split(" ").map(n => n[0]).join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium">
                {user?.name}
              </span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              {user?.businessName && (
                <p className="text-xs text-muted-foreground">{user.businessName}</p>
              )}
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => navigate(role === "admin" ? "/admin/settings" : "/profile/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              {role === "admin" ? "Admin Settings" : "Profile Settings"}
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => navigate(role === "admin" ? "/admin/profile/edit" : "/profile/settings")}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}; 