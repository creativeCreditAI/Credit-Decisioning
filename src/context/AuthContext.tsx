import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  businessName?: string;
  sector?: string;
  applicationId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: "user" | "admin") => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  createUserAccount: (userData: Omit<User, 'id' | 'role'>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔌 Placeholder for backend call
  const validateUserLogin = async (email: string, password: string): Promise<User | null> => {
    console.log("Validating user login:", { email, password });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data - in real app, this would come from backend
    if (email && password.length >= 6) {
      return {
        id: "user-123",
        name: "Grace Wanjiku",
        email: email,
        role: "user",
        businessName: "Grace Designs",
        sector: "Fashion Design",
        applicationId: "APP-2024-001"
      };
    }
    return null;
  };

  // 🔌 Placeholder for backend call
  const validateAdminLogin = async (email: string, password: string): Promise<User | null> => {
    console.log("Validating admin login:", { email, password });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // No email restrictions for admin login (as requested)
    if (email && password.length >= 6) {
      return {
        id: "admin-456",
        name: "James Mwangi",
        email: email,
        role: "admin"
      };
    }
    return null;
  };

  // 🔌 Placeholder for backend call - Create user account after application completion
  const createUserAccount = async (userData: Omit<User, 'id' | 'role'>): Promise<boolean> => {
    console.log("Creating user account:", userData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // In real implementation, this would:
      // 1. Save user data to database
      // 2. Generate unique user ID
      // 3. Create application record
      // 4. Set up user credentials
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        role: "user",
        ...userData
      };
      
      // Auto-login the newly created user
      setUser(newUser);
      localStorage.setItem("heva_user", JSON.stringify(newUser));
      
      console.log("User account created successfully:", newUser);
      return true;
    } catch (error) {
      console.error("Error creating user account:", error);
      return false;
    }
  };

  const login = async (email: string, password: string, role: "user" | "admin"): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      let userData: User | null = null;
      
      if (role === "admin") {
        userData = await validateAdminLogin(email, password);
      } else {
        userData = await validateUserLogin(email, password);
      }
      
      if (userData) {
        setUser(userData);
        localStorage.setItem("heva_user", JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("heva_user");
    // Redirect to landing page
    window.location.href = "/";
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("heva_user", JSON.stringify(updatedUser));
    }
  };

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem("heva_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("heva_user");
      }
    }
    setIsLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    createUserAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}; 