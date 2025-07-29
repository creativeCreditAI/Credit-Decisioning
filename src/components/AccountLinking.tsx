import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Building2, Zap, Check, AlertCircle, Loader2 } from "lucide-react";

interface AccountProvider {
  id: string;
  name: string;
  nameSwahili: string;
  icon: React.ReactNode;
  description: string;
  descriptionSwahili: string;
  status: "connected" | "disconnected" | "syncing" | "error";
  lastSync?: Date;
  required?: boolean;
}

interface AccountLinkingProps {
  providers: AccountProvider[];
  onConnect: (providerId: string) => void;
  onDisconnect: (providerId: string) => void;
  language?: "en" | "sw";
  className?: string;
}

const defaultProviders: AccountProvider[] = [
  {
    id: "mpesa",
    name: "M-Pesa",
    nameSwahili: "M-Pesa",
    icon: <Smartphone className="w-6 h-6" />,
    description: "Mobile money transactions and payment history",
    descriptionSwahili: "Miamala ya pesa za simu na historia ya malipo",
    status: "disconnected",
    required: true
  },
  {
    id: "bank",
    name: "Bank Account",
    nameSwahili: "Akaunti ya Benki",
    icon: <Building2 className="w-6 h-6" />,
    description: "Bank statements and transaction history",
    descriptionSwahili: "Taarifa za benki na historia ya miamala",
    status: "disconnected"
  },
  {
    id: "utilities",
    name: "Utility Payments",
    nameSwahili: "Malipo ya Huduma",
    icon: <Zap className="w-6 h-6" />,
    description: "KPLC, water, and other utility payment records",
    descriptionSwahili: "Rekodi za malipo ya KPLC, maji, na huduma zingine",
    status: "disconnected"
  }
];

const getStatusBadge = (status: AccountProvider["status"], language: "en" | "sw") => {
  const statusConfig = {
    connected: {
      variant: "default" as const,
      icon: <Check className="w-3 h-3" />,
      text: language === "en" ? "Connected" : "Imeunganishwa",
      className: "bg-success text-white"
    },
    disconnected: {
      variant: "secondary" as const,
      icon: <AlertCircle className="w-3 h-3" />,
      text: language === "en" ? "Not Connected" : "Haijaungana",
      className: "bg-neutral-light text-neutral-dark"
    },
    syncing: {
      variant: "outline" as const,
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      text: language === "en" ? "Syncing" : "Inaunganisha",
      className: "bg-info/10 text-info border-info/20"
    },
    error: {
      variant: "destructive" as const,
      icon: <AlertCircle className="w-3 h-3" />,
      text: language === "en" ? "Error" : "Hitilafu",
      className: "bg-error text-white"
    }
  };

  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={cn("flex items-center gap-1", config.className)}>
      {config.icon}
      {config.text}
    </Badge>
  );
};

export const AccountLinking = ({
  providers = defaultProviders,
  onConnect,
  onDisconnect,
  language = "en",
  className
}: AccountLinkingProps) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleConnect = async (providerId: string) => {
    setLoadingProvider(providerId);
    try {
      await onConnect(providerId);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleDisconnect = async (providerId: string) => {
    setLoadingProvider(providerId);
    try {
      await onDisconnect(providerId);
    } finally {
      setLoadingProvider(null);
    }
  };

  const connectedCount = providers.filter(p => p.status === "connected").length;
  const requiredCount = providers.filter(p => p.required).length;
  const requiredConnected = providers.filter(p => p.required && p.status === "connected").length;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-dark mb-2">
          {language === "en" ? "Connect your accounts" : "Unganisha akaunti zako"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {language === "en" 
            ? "Link your financial accounts to build your credit profile" 
            : "Unganisha akaunti zako za kifedha kujenga wasifu wako wa mkopo"
          }
        </p>
        
        <div className="bg-card border rounded-lg p-4 inline-block">
          <p className="text-sm font-medium">
            {language === "en" ? "Accounts Connected:" : "Akaunti Zilizounganishwa:"}
          </p>
          <p className="text-2xl font-bold text-primary">
            {connectedCount}/{providers.length}
          </p>
        </div>
      </div>

      {requiredConnected < requiredCount && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning mb-1">
                {language === "en" ? "Required Connections" : "Miunganisho Muhimu"}
              </h3>
              <p className="text-sm text-warning/80">
                {language === "en" 
                  ? "Please connect your M-Pesa account to continue. This is required for basic credit scoring."
                  : "Tafadhali unganisha akaunti yako ya M-Pesa kuendelea. Hii inahitajika kwa alama za mkopo."
                }
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {providers.map((provider) => (
          <Card key={provider.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  {provider.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">
                      {language === "en" ? provider.name : provider.nameSwahili}
                    </h3>
                    {provider.required && (
                      <Badge variant="outline" className="text-xs">
                        {language === "en" ? "Required" : "Muhimu"}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === "en" ? provider.description : provider.descriptionSwahili}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    {getStatusBadge(provider.status, language)}
                    
                    {provider.lastSync && provider.status === "connected" && (
                      <span className="text-xs text-muted-foreground">
                        {language === "en" ? "Last synced:" : "Ilisasishwa mwisho:"} {" "}
                        {provider.lastSync.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {provider.status === "connected" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(provider.id)}
                    disabled={loadingProvider === provider.id}
                  >
                    {loadingProvider === provider.id && (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    )}
                    {language === "en" ? "Disconnect" : "Tenganisha"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleConnect(provider.id)}
                    disabled={loadingProvider === provider.id}
                    size="sm"
                  >
                    {loadingProvider === provider.id && (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    )}
                    {language === "en" ? "Connect" : "Unganisha"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-info rounded-full flex items-center justify-center mt-0.5">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <div>
            <h3 className="font-semibold text-info mb-1">
              {language === "en" ? "Your data is secure" : "Data yako ni salama"}
            </h3>
            <p className="text-sm text-info/80">
              {language === "en" 
                ? "All data is encrypted and used only for credit scoring. We never store your passwords or login credentials."
                : "Data yote imefichwa na hutumiwa tu kwa alama za mkopo. Hatuhifadhi nywila zako au maelezo ya kuingia."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};