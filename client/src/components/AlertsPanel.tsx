import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, FolderSync } from "lucide-react";

export default function AlertsPanel() {
  const alerts = [
    {
      id: "1",
      type: "error",
      icon: AlertTriangle,
      title: "Produtos sem custo",
      description: "3 produtos não possuem custo cadastrado",
      bgColor: "bg-red-50",
      iconColor: "text-red-600"
    },
    {
      id: "2",
      type: "warning",
      icon: TrendingDown,
      title: "Margem baixa detectada",
      description: "2 produtos com margem inferior a 20%",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600"
    },
    {
      id: "3",
      type: "info",
      icon: FolderSync,
      title: "Sincronização pendente",
      description: "Amazon US - último sync há 2 horas",
      bgColor: "bg-blue-50",
      iconColor: "text-primary"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas Importantes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div
                key={alert.id}
                className={`flex items-start space-x-3 p-3 rounded-lg ${alert.bgColor} cursor-pointer hover:opacity-90 transition-opacity`}
              >
                <Icon className={`${alert.iconColor} mt-1 flex-shrink-0`} size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {alert.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
