import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthService, User } from "../services/backendService";

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

  const login = async (email: string, password: string, role: "user" | "admin"): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      let userData: User | null = null;
      
      if (role === "admin") {
        userData = await AuthService.validateAdminLogin(email, password);
      } else {
        userData = await AuthService.validateUserLogin(email, password);
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
    AuthService.logout();
    localStorage.removeItem("heva_user");
    // Redirect to landing page
    window.location.href = "/";
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (user) {
        const updatedUser = await AuthService.updateProfile(userData);
        if (updatedUser) {
          setUser(updatedUser);
          localStorage.setItem("heva_user", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Update user error:", error);
    }
  };

  const createUserAccount = async (userData: Omit<User, 'id' | 'role'>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const newUser = await AuthService.createUserAccount(userData);
      
      if (newUser) {
        setUser(newUser);
        localStorage.setItem("heva_user", JSON.stringify(newUser));
        console.log("User account created successfully:", newUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error creating user account:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check for existing session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem("heva_user");
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          
          // Validate token with backend
          const isValid = await AuthService.validateToken();
          if (isValid) {
            // Get fresh user data from backend
            const freshUserData = await AuthService.getUserProfile();
            if (freshUserData) {
              setUser(freshUserData);
              localStorage.setItem("heva_user", JSON.stringify(freshUserData));
            } else {
              setUser(userData); // Fallback to cached data
            }
          } else {
            // Token is invalid, clear local storage
            localStorage.removeItem("heva_user");
            localStorage.removeItem("auth_token");
          }
        } catch (error) {
          console.error("Error initializing auth:", error);
          localStorage.removeItem("heva_user");
          localStorage.removeItem("auth_token");
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
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