import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CreditScoreDisplayProps {
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}

const getScoreTier = (score: number) => {
  if (score >= 800) return { tier: "Excellent", color: "score-excellent", textColor: "text-green-600" };
  if (score >= 650) return { tier: "Prime", color: "score-prime", textColor: "text-blue-600" };
  if (score >= 500) return { tier: "Near Prime", color: "score-near-prime", textColor: "text-yellow-600" };
  return { tier: "Subprime", color: "score-subprime", textColor: "text-red-600" };
};

export const CreditScoreDisplay = ({
  score,
  maxScore = 1000,
  size = "lg",
  className,
  animated = true
}: CreditScoreDisplayProps) => {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const scoreTier = getScoreTier(score);
  const percentage = (score / maxScore) * 100;
  
  // Size configurations
  const sizeConfig = {
    sm: {
      wrapper: "w-24 h-24",
      circle: "w-20 h-20",
      score: "text-lg font-bold",
      maxScore: "text-xs",
      tier: "text-xs"
    },
    md: {
      wrapper: "w-36 h-36",
      circle: "w-32 h-32",
      score: "text-2xl font-bold",
      maxScore: "text-sm",
      tier: "text-sm"
    },
    lg: {
      wrapper: "w-48 h-48",
      circle: "w-44 h-44",
      score: "text-4xl font-bold",
      maxScore: "text-lg",
      tier: "text-lg"
    }
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * 80; // radius of 80
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        const increment = score / 50; // Animate over ~50 frames
        const animate = () => {
          setDisplayScore(prev => {
            const next = Math.min(prev + increment, score);
            if (next < score) {
              requestAnimationFrame(animate);
            }
            return next;
          });
        };
        animate();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [score, animated]);

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className={cn("relative", config.wrapper)}>
        <svg className={config.circle} viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={`hsl(var(--${scoreTier.color}))`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)"
            className="score-progress transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(config.score, scoreTier.textColor)}>
            {Math.floor(displayScore)}
          </span>
          <span className={cn(config.maxScore, "text-muted-foreground")}>
            /{maxScore}
          </span>
        </div>
      </div>
      
      {/* Tier label */}
      <div className="mt-4 text-center">
        <span className={cn(
          config.tier, 
          "font-semibold px-3 py-1 rounded-full",
          scoreTier.textColor,
          "bg-current/10"
        )}>
          {scoreTier.tier} Tier
        </span>
      </div>
    </div>
  );
};