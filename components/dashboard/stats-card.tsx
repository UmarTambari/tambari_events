import { LucideIcon, TrendingUp, TrendingDown }     from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: number | null;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: StatsCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <Card className="bg-white border-dash-border hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-dash-muted">
          {title}
        </CardTitle>
        <div className="h-10 w-10 rounded-full bg-dash-highlight flex items-center justify-center">
          <Icon className="h-5 w-5 text-dash-ink" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-dash-ink">{value}</div>
        <div className="flex items-center mt-1">
          {trend !== null && trend !== undefined && (
            <span
              className={cn(
                "inline-flex items-center text-xs font-medium mr-2",
                isPositive && "text-green-600",
                isNegative && "text-red-600"
              )}
            >
              {isPositive && <TrendingUp className="h-3 w-3 mr-0.5" />}
              {isNegative && <TrendingDown className="h-3 w-3 mr-0.5" />}
              {Math.abs(trend)}%
            </span>
          )}
          <p className="text-xs text-dash-muted">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
