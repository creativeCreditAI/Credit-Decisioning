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

  const userNavLinks = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/progress", label: "Application Progress", icon: FileText },
    { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
    { href: "/dashboard/chatbot", label: "Chatbot", icon: MessageCircle },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ];

  const adminNavLinks = [
    { href: "/admin/dashboard", label: "Overview", icon: BarChart3 },
    { href: "/admin/applicants", label: "Applicants", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/alerts", label: "Risk Alerts", icon: AlertTriangle },
    { href: "/admin/sectors", label: "Sectors", icon: MapPin },
    { href: "/admin/reports", label: "Data & Reports", icon: Database },
    { href: "/admin/profile", label: "Admin Profile", icon: Shield },
  ];

  const navLinks = role === "admin" ? adminNavLinks : userNavLinks;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to={role === "admin" ? "/admin/dashboard" : "/dashboard"} className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
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
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(link.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:text-primary hover:bg-primary/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
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
            
            <DropdownMenuItem onClick={() => navigate(`/${role === "admin" ? "admin/" : ""}profile/settings`)}>
              <Settings className="w-4 h-4 mr-2" />
              {role === "admin" ? "Admin Settings" : "Profile Settings"}
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => navigate(`/${role === "admin" ? "admin/" : ""}profile/edit`)}>
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