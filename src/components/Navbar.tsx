import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Building2,
  Shield
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { RoleBasedNavbar } from "./RoleBasedNavbar";

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isFundingDropdownOpen, setIsFundingDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleFundingSelect = (type: string) => {
    setIsFundingDropdownOpen(false);
    navigate(`/eligibility-check?funding=${type}`);
  };

  if (isAuthenticated) {
    // Use RoleBasedNavbar for authenticated users
    return <RoleBasedNavbar role={user?.role || "user"} />;
  }

  // Not authenticated - show landing page navigation
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/heva-logo.svg" alt="HEVA" className="w-8 h-8" />
          <span className="font-bold text-xl text-gray-900">HEVA</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-gray-700 hover:text-primary transition-colors"
          >
            Home
          </Link>
          <a 
            href="https://www.hevafund.com/about-heva" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-primary transition-colors"
          >
            About
          </a>
          <a 
            href="https://www.hevafund.com/contact-us" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-primary transition-colors"
          >
            Contact
          </a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-3">
          <DropdownMenu open={isFundingDropdownOpen} onOpenChange={setIsFundingDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="default">
                Start Application
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleFundingSelect("grant")}>
                <Building2 className="w-4 h-4 mr-2" />
                Grant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFundingSelect("loan")}>
                <User className="w-4 h-4 mr-2" />
                Loan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFundingSelect("investment")}>
                <Shield className="w-4 h-4 mr-2" />
                Investment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Sign In
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/login")}>
                <User className="w-4 h-4 mr-2" />
                Sign in as User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin/login")}>
                <Shield className="w-4 h-4 mr-2" />
                Sign in as Admin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}; 