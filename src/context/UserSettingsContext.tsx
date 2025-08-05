import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "sw" | "fr" | "ar";
export type FundingType = "grant" | "loan" | "investment";
export type Theme = "light" | "dark" | "system";
export type TextSize = "small" | "medium" | "large";

interface UserSettings {
  // Display Preferences
  theme: Theme;
  textSize: TextSize;
  language: Language;
  
  // Funding Preferences
  fundingType: FundingType;
  
  // Application Settings
  applicationId?: string;
  applicationStatus?: "draft" | "submitted" | "reviewing" | "approved" | "rejected" | "paused";
  
  // Data Management
  dataExportFormat: "pdf" | "csv";
  
  // Accessibility
  voiceAssistant: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

interface UserSettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  exportUserData: () => Promise<void>;
  pauseApplication: () => Promise<void>;
  cancelApplication: () => Promise<void>;
  changeFundingType: (newType: FundingType) => Promise<void>;
  isDarkMode: boolean;
  currentLanguage: Language;
  currentFundingType: FundingType;
}

const defaultSettings: UserSettings = {
  theme: "system",
  textSize: "medium",
  language: "en",
  fundingType: "loan",
  dataExportFormat: "pdf",
  voiceAssistant: false,
  highContrast: false,
  reducedMotion: false,
};

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

interface UserSettingsProviderProps {
  children: ReactNode;
}

export const UserSettingsProvider = ({ children }: UserSettingsProviderProps) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("heva_user_settings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        console.error("Error parsing saved settings:", error);
      }
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      
      if (settings.theme === "dark" || 
          (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        root.classList.add("dark");
        setIsDarkMode(true);
      } else {
        root.classList.remove("dark");
        setIsDarkMode(false);
      }
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (settings.theme === "system") {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [settings.theme]);

  // Apply text size changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = settings.textSize === "small" ? "14px" : 
                         settings.textSize === "large" ? "18px" : "16px";
  }, [settings.textSize]);

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    
    if (settings.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
  }, [settings.highContrast, settings.reducedMotion]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("heva_user_settings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("heva_user_settings");
  };

  const exportUserData = async (): Promise<void> => {
    try {
      // 🔌 Placeholder for backend call
      console.log("Exporting user data in format:", settings.dataExportFormat);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would:
      // 1. Call backend API to generate export
      // 2. Return download link or trigger download
      // 3. Handle different formats (PDF/CSV)
      
      console.log("User data exported successfully");
    } catch (error) {
      console.error("Error exporting user data:", error);
      throw error;
    }
  };

  const pauseApplication = async (): Promise<void> => {
    try {
      // 🔌 Placeholder for backend call
      console.log("Pausing application");
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateSettings({ applicationStatus: "paused" });
      console.log("Application paused successfully");
    } catch (error) {
      console.error("Error pausing application:", error);
      throw error;
    }
  };

  const cancelApplication = async (): Promise<void> => {
    try {
      // 🔌 Placeholder for backend call
      console.log("Cancelling application");
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateSettings({ applicationStatus: "rejected" });
      console.log("Application cancelled successfully");
    } catch (error) {
      console.error("Error cancelling application:", error);
      throw error;
    }
  };

  const changeFundingType = async (newType: FundingType): Promise<void> => {
    try {
      // 🔌 Placeholder for backend call
      console.log("Changing funding type to:", newType);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      updateSettings({ 
        fundingType: newType,
        applicationStatus: "draft" // Reset to draft when changing funding type
      });
      console.log("Funding type changed successfully");
    } catch (error) {
      console.error("Error changing funding type:", error);
      throw error;
    }
  };

  const value: UserSettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    exportUserData,
    pauseApplication,
    cancelApplication,
    changeFundingType,
    isDarkMode,
    currentLanguage: settings.language,
    currentFundingType: settings.fundingType,
  };

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error("useUserSettings must be used within a UserSettingsProvider");
  }
  return context;
}; 