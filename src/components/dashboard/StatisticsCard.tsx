import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  bgColor: string;
  iconColor: string;
}

export const StatisticsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  bgColor, 
  iconColor 
}: StatisticsCardProps) => {
  return (
    <Card className="p-6 [box-shadow:var(--shadow-card)] hover:[box-shadow:var(--shadow-hover)] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </p>
        </div>
        <div className={`rounded-full ${bgColor} p-3`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
};
