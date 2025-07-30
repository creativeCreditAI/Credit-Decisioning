import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  Users, 
  Award, 
  Target,
  CheckCircle,
  Star
} from "lucide-react";
import heroImage from "@/assets/hero-creative-kenya.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-light via-background to-primary/5">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">HEVA+</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/dashboard">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  Fair, Adaptive, Transparent Lending
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Credit for Africa's{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    Creative Economy
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  HEVA+ goes beyond traditional credit scoring to understand creative entrepreneurs. 
                  Get fair access to funding with sector-aware assessment and transparent decisions.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Your Assessment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">1,200+</div>
                  <div className="text-sm text-muted-foreground">Creatives Funded</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">95%</div>
                  <div className="text-sm text-muted-foreground">Approval Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-orange">4.8★</div>
                  <div className="text-sm text-muted-foreground">User Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Creative entrepreneurs in Kenya"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
              
              {/* Floating Score Card */}
              <Card className="absolute -bottom-6 -left-6 p-4 bg-background/95 backdrop-blur-sm border shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                    742
                  </div>
                  <div>
                    <div className="font-semibold">Excellent Score</div>
                    <div className="text-sm text-muted-foreground">Tier A Funding</div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Built for Creative Entrepreneurs
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Traditional banks don't understand your creative business. We do. 
              Our platform considers your unique challenges and opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sector-Aware Scoring</h3>
              <p className="text-muted-foreground">
                Specialized models for film, fashion, music, and art that understand seasonal income patterns.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Behavioral Insights</h3>
              <p className="text-muted-foreground">
                We consider your social media engagement, grant wins, and client testimonials.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent-orange/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-accent-orange" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparent Decisions</h3>
              <p className="text-muted-foreground">
                Clear explanations for every decision with actionable steps to improve your score.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fair & Inclusive</h3>
              <p className="text-muted-foreground">
                Bias-free algorithms that promote gender equality and rural/urban fairness.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Growth Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your progress with visual dashboards and improvement recommendations.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent-orange/10 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-accent-orange" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Portfolio Recognition</h3>
              <p className="text-muted-foreground">
                Your creative work, awards, and exhibitions count towards your creditworthiness.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 bg-gradient-to-br from-primary/5 via-background to-accent/5 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Ready to Get the Credit You Deserve?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of creative entrepreneurs who've accessed fair funding through HEVA+. 
                Start your assessment today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Free Assessment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg">
                  Schedule Demo
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">HEVA+ Credit Platform</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 HEVA+. Fair lending for Africa's creative economy.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;