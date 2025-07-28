import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Tags, FileDown, Link, TestTube } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      id: "add-product",
      title: "Adicionar Produto",
      icon: Plus,
      action: () => {
        // Navigate to add product page
        console.log("Navigate to add product");
      }
    },
    {
      id: "update-costs",
      title: "Atualizar Custos",
      icon: Tags,
      action: () => {
        // Navigate to costs page
        console.log("Navigate to costs page");
      }
    },
    {
      id: "export-report",
      title: "Exportar Relatório",
      icon: FileDown,
      action: () => {
        // Trigger report export
        console.log("Export report");
      }
    },
    {
      id: "connect-account",
      title: "Conectar Conta",
      icon: Link,
      action: () => {
        // Open marketplace connection modal
        console.log("Open connection modal");
      }
    },
    {
      id: "oauth-test",
      title: "Teste OAuth",
      icon: TestTube,
      action: () => {
        // Navigate to OAuth test page
        window.location.href = "/oauth-test";
      }
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="flex flex-col items-center justify-center p-4 h-auto border border-gray-300 hover:bg-gray-50 transition-colors"
                onClick={action.action}
              >
                <Icon className="text-primary mb-2" size={24} />
                <span className="text-sm font-medium text-gray-900 text-center">
                  {action.title}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
