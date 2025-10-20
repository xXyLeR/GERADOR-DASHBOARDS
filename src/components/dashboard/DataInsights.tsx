import { Card } from "@/components/ui/card";
import { AlertCircle, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface Insight {
  type: "info" | "warning" | "success" | "error";
  title: string;
  description: string;
}

interface DataInsightsProps {
  insights: Insight[];
}

export const DataInsights = ({ insights }: DataInsightsProps) => {
  const getIcon = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-[hsl(45,93%,47%)]" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <TrendingUp className="h-5 w-5 text-primary" />;
    }
  };

  const getBgColor = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return "bg-accent/10";
      case "warning":
        return "bg-[hsl(45,93%,47%)]/10";
      case "error":
        return "bg-destructive/10";
      default:
        return "bg-primary/10";
    }
  };

  return (
    <Card className="p-6 [box-shadow:var(--shadow-card)]">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Insights Automáticos
      </h3>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`flex gap-3 p-4 rounded-lg ${getBgColor(insight.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(insight.type)}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{insight.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
