import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend: "up" | "down";
}

export default function KPICard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor, 
  iconBg, 
  trend 
}: KPICardProps) {
  const isPositive = trend === "up";
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", iconBg)}>
            <Icon className={iconColor} size={16} />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className={cn(
          "text-sm flex items-center",
          isPositive ? "text-green-600" : "text-red-600"
        )}>
          {isPositive ? (
            <ArrowUp className="mr-1" size={16} />
          ) : (
            <ArrowDown className="mr-1" size={16} />
          )}
          {change} vs período anterior
        </p>
      </CardContent>
    </Card>
  );
}
