import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Edit, 
  Save, 
  X,
  Calendar,
  MapPin,
  Building2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface PersonalizedGreetingProps {
  role: "user" | "admin";
  language: "en" | "sw";
}

export const PersonalizedGreeting = ({ role, language }: PersonalizedGreetingProps) => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    businessName: user?.businessName || "",
    sector: user?.sector || ""
  });

  const handleSave = () => {
    updateUser(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || "",
      email: user?.email || "",
      businessName: user?.businessName || "",
      sector: user?.sector || ""
    });
    setIsEditing(false);
  };

  const getGreetingText = () => {
    const time = new Date().getHours();
    let greeting = "";
    
    if (time < 12) {
      greeting = language === "en" ? "Good morning" : "Habari za asubuhi";
    } else if (time < 17) {
      greeting = language === "en" ? "Good afternoon" : "Habari za mchana";
    } else {
      greeting = language === "en" ? "Good evening" : "Habari za jioni";
    }
    
    return greeting;
  };

  const getRoleText = () => {
    if (role === "admin") {
      return language === "en" ? "Administrator" : "Msimamizi";
    }
    return language === "en" ? "Creative Entrepreneur" : "Mjasiriamali wa Ubunifu";
  };

  return (
    <Card className="bg-gradient-to-r from-black to-gray-900 text-white border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-white/20">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                {user?.name?.split(" ").map(n => n[0]).join("") || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl font-bold">
                {getGreetingText()}, {user?.name || "User"}
              </h1>
              <p className="text-gray-200 flex items-center gap-2">
                <User className="w-4 h-4" />
                {getRoleText()}
              </p>
              {user?.businessName && (
                <p className="text-gray-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {user.businessName}
                </p>
              )}
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {language === "en" ? "Last login:" : "Muingilio wa mwisho:"} {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        {isEditing && (
          <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
            <h3 className="text-lg font-semibold mb-4">
              {language === "en" ? "Edit Profile Information" : "Hariri Maelezo ya Wasifu"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-white">
                  {language === "en" ? "Name" : "Jina"}
                </Label>
                <Input 
                  id="name" 
                  value={editData.name} 
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-white">
                  {language === "en" ? "Email" : "Barua Pepe"}
                </Label>
                <Input 
                  id="email" 
                  value={editData.email} 
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
              </div>
              {role === "user" && (
                <>
                  <div>
                    <Label htmlFor="businessName" className="text-white">
                      {language === "en" ? "Business Name" : "Jina la Biashara"}
                    </Label>
                    <Input 
                      id="businessName" 
                      value={editData.businessName} 
                      onChange={(e) => setEditData({...editData, businessName: e.target.value})}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sector" className="text-white">
                      {language === "en" ? "Sector" : "Sekta"}
                    </Label>
                    <Input 
                      id="sector" 
                      value={editData.sector} 
                      onChange={(e) => setEditData({...editData, sector: e.target.value})}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} className="bg-white text-gray-900 hover:bg-white/90">
                <Save className="w-4 h-4 mr-2" />
                {language === "en" ? "Save Changes" : "Hifadhi Mabadiliko"}
              </Button>
              <Button variant="outline" onClick={handleCancel} className="border-white/20 text-white hover:bg-white/20">
                <X className="w-4 h-4 mr-2" />
                {language === "en" ? "Cancel" : "Ghairi"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 