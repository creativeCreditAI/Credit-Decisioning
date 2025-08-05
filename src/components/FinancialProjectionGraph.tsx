import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  BarChart3,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useUserSettings } from "@/context/UserSettingsContext";

interface FinancialData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export const FinancialProjectionGraph = () => {
  const { currentFundingType } = useUserSettings();
  const [timeframe, setTimeframe] = useState<"6months" | "12months" | "24months">("12months");
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("line");
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateData = () => {
      const months = timeframe === "6months" ? 6 : timeframe === "12months" ? 12 : 24;
      const data: FinancialData[] = [];
      
      for (let i = 1; i <= months; i++) {
        const month = new Date();
        month.setMonth(month.getMonth() + i);
        const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        let baseIncome = 50000 + (i * 5000);
        let baseExpenses = 30000 + (i * 2000);
        
        if (currentFundingType === "loan") {
          baseIncome = 80000 + (i * 8000);
          baseExpenses = 45000 + (i * 3000);
        } else if (currentFundingType === "investment") {
          baseIncome = 120000 + (i * 12000);
          baseExpenses = 60000 + (i * 4000);
        }
        
        const income = Math.round(baseIncome * (0.9 + Math.random() * 0.2));
        const expenses = Math.round(baseExpenses * (0.95 + Math.random() * 0.1));
        const profit = income - expenses;
        
        data.push({ month: monthName, income, expenses, profit });
      }
      
      setFinancialData(data);
      setIsLoading(false);
    };

    setIsLoading(true);
    setTimeout(generateData, 1000);
  }, [timeframe, currentFundingType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalIncome = financialData.reduce((sum, d) => sum + d.income, 0);
  const totalExpenses = financialData.reduce((sum, d) => sum + d.expenses, 0);
  const netProfit = totalIncome - totalExpenses;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Projections</CardTitle>
          <CardDescription>Loading financial data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Financial Projections
            </CardTitle>
            <CardDescription>
              {currentFundingType === "grant" && "Grant utilization and revenue forecast"}
              {currentFundingType === "loan" && "Loan repayment capacity and profit projections"}
              {currentFundingType === "investment" && "Investment returns and growth projections"}
            </CardDescription>
          </div>
          <Badge className="flex items-center gap-1">
            {currentFundingType.charAt(0).toUpperCase() + currentFundingType.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex gap-4">
          <div>
            <Label>Timeframe</Label>
            <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="12months">12 Months</SelectItem>
                <SelectItem value="24months">24 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Chart Type</Label>
            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netProfit)}
                  </p>
                </div>
                {netProfit >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-600" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Placeholder */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Monthly Financial Overview</h3>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm text-muted-foreground capitalize">{chartType} Chart</span>
              </div>
            </div>
            
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive chart would be rendered here</p>
                <p className="text-sm text-gray-500">Using {chartType} visualization</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Expenses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Profit</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Profit Margin</span>
                  <Badge variant="secondary">
                    {Math.round((netProfit / totalIncome) * 100)}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Monthly Average</span>
                  <Badge variant="secondary">
                    {formatCurrency(Math.round(netProfit / financialData.length))}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Growth Rate</span>
                  <Badge variant="secondary">High</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium">Risk Level</span>
                  <Badge variant="outline" className="text-green-600">Low Risk</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}; 