import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  Building2, 
  User, 
  Shield, 
  ArrowRight,
  TrendingUp,
  Users,
  Award,
  CheckCircle,
  Star,
  UserCheck,
  Settings,
  Play
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

export const LandingPage = () => {
  const navigate = useNavigate();
  const [isFundingDropdownOpen, setIsFundingDropdownOpen] = useState(false);

  const handleFundingSelect = (type: string) => {
    setIsFundingDropdownOpen(false);
    navigate(`/eligibility-check?funding=${type}`);
  };

  const fundingOptions = [
    {
      id: "grant",
      title: "Grant Funding",
      description: "Non-repayable funding for creative entrepreneurs",
      icon: <Building2 className="w-6 h-6" />,
      features: ["No repayment required", "Mentorship included", "Networking opportunities"],
      maxAmount: "KSH 500,000",
      timeline: "2-4 weeks"
    },
    {
      id: "loan",
      title: "Business Loan",
      description: "Flexible loan options with competitive rates",
      icon: <User className="w-6 h-6" />,
      features: ["Competitive rates (8-15%)", "Flexible terms", "Quick approval"],
      maxAmount: "KSH 2,000,000",
      timeline: "1-2 weeks"
    },
    {
      id: "investment",
      title: "Equity Investment",
      description: "Strategic investment for high-growth businesses",
      icon: <Shield className="w-6 h-6" />,
      features: ["Strategic partnership", "Investor network", "Business support"],
      maxAmount: "KSH 10,000,000",
      timeline: "4-8 weeks"
    }
  ];

  const stats = [
    { label: "Creative Entrepreneurs Funded", value: "500+", icon: <Users className="w-5 h-5" /> },
    { label: "Total Funding Disbursed", value: "KSH 250M+", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Success Rate", value: "85%", icon: <Award className="w-5 h-5" /> },
    { label: "Average Credit Score", value: "720", icon: <Star className="w-5 h-5" /> }
  ];

  const features = [
    {
      title: "Digital Credit Scoring",
      description: "Advanced algorithms analyze your financial behavior and creative industry data to provide accurate credit scores.",
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: "Creative Industry Focus",
      description: "Specialized funding solutions designed specifically for creative entrepreneurs and cultural businesses.",
      icon: <Award className="w-6 h-6" />
    },
    {
      title: "Quick Application Process",
      description: "Streamlined application process with real-time eligibility checks and fast approval times.",
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              Empowering Creative Entrepreneurs
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Unlock Your Creative
              <span className="text-primary block">Potential</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              HEVA provides innovative credit scoring and funding solutions for Kenya's creative entrepreneurs. 
              Get the financial support you need to grow your creative business.
            </p>
            
            {/* Three Clear Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              {/* Sign in as Admin */}
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/login")}>
                <CardContent className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <Settings className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Sign in as Admin</h3>
                    <p className="text-sm text-gray-600 mt-1">Access admin dashboard and manage applications</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Admin Login
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Sign in as User */}
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/login")}>
                <CardContent className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <UserCheck className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Sign in as User</h3>
                    <p className="text-sm text-gray-600 mt-1">Access your dashboard and track applications</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    User Login
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Start Application */}
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-primary/20 bg-primary/5" onClick={() => handleFundingSelect("grant")}>
                <CardContent className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Start Application</h3>
                    <p className="text-sm text-gray-600 mt-1">Create account and begin your funding journey</p>
                  </div>
                  <Button className="w-full">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Alternative Funding Selection */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <DropdownMenu open={isFundingDropdownOpen} onOpenChange={setIsFundingDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    Choose Funding Type
                    <ChevronDown className="w-5 h-5 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-64">
                  {fundingOptions.map((option) => (
                    <DropdownMenuItem 
                      key={option.id}
                      onClick={() => handleFundingSelect(option.id)}
                      className="p-4"
                    >
                      <div className="flex items-center space-x-3">
                        {option.icon}
                        <div className="text-left">
                          <div className="font-medium">{option.title}</div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose HEVA?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We understand the unique challenges faced by creative entrepreneurs and provide tailored solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Funding Options Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Funding Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the funding option that best fits your business needs and goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {fundingOptions.map((option) => (
              <Card key={option.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {option.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <CardDescription>{option.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Max Amount</div>
                      <div className="font-semibold">{option.maxAmount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Timeline</div>
                      <div className="font-semibold">{option.timeline}</div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleFundingSelect(option.id)}
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join hundreds of creative entrepreneurs who have already transformed their businesses with HEVA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => handleFundingSelect("grant")}
            >
              Start Application
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="font-bold text-xl">HEVA</span>
              </div>
              <p className="text-gray-400">
                Empowering creative entrepreneurs through innovative financial solutions.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Funding</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Grants</li>
                <li>Loans</li>
                <li>Investments</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQ</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HEVA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}; 