import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Settings, 
  LogOut, 
  User, 
  Globe, 
  Bell,
  ChevronDown,
  Palette
} from "lucide-react";

interface DashboardHeaderProps {
  user: {
    name: string;
    avatar?: string;
    businessName?: string;
    sectors: string[];
  };
  language: "en" | "sw";
  onLanguageChange: (language: "en" | "sw") => void;
  className?: string;
  userRole?: "user" | "admin";
}

export const DashboardHeader = ({
  user,
  language,
  onLanguageChange,
  className,
  userRole = "user"
}: DashboardHeaderProps) => {
  const [notifications] = useState(3); // Mock notification count

  const greeting = () => {
    const hour = new Date().getHours();
    if (language === "en") {
      if (hour < 12) return "Good morning";
      if (hour < 17) return "Good afternoon";
      return "Good evening";
    } else {
      if (hour < 12) return "Habari za asubuhi";
      if (hour < 17) return "Habari za mchana";
      return "Habari za jioni";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className={cn("bg-card border-b border-border sticky top-0 z-50", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  HEVA Score
                </h1>
                <p className="text-xs text-muted-foreground -mt-0.5">
                  {language === "en" ? "Kenya Creative Industries" : "Viwanda vya Ubunifu Kenya"}
                </p>
              </div>
            </div>
          </div>

          {/* User Greeting */}
          <div className="hidden md:block text-center">
            <p className="text-sm text-muted-foreground">
              {greeting()}, {user.businessName || user.name.split(" ")[0]}! 👋
            </p>
            {userRole === "user" && (
              <div className="flex items-center justify-center gap-2 mt-1">
                {user.sectors.slice(0, 2).map((sector, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
                {user.sectors.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{user.sectors.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:block">
                    {language === "en" ? "English" : "Kiswahili"}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => onLanguageChange("en")}
                  className={cn(language === "en" && "bg-primary/10")}
                >
                  <span>🇺🇸</span>
                  <span className="ml-2">English</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onLanguageChange("sw")}
                  className={cn(language === "sw" && "bg-primary/10")}
                >
                  <span>🇰🇪</span>
                  <span className="ml-2">Kiswahili</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
                >
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {language === "en" ? "Creative Entrepreneur" : "Mjasiriamali wa Ubunifu"}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>{language === "en" ? "Profile" : "Wasifu"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{language === "en" ? "Settings" : "Mipangilio"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Palette className="mr-2 h-4 w-4" />
                  <span>{language === "en" ? "Preferences" : "Mapendeleo"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{language === "en" ? "Log out" : "Toka"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};