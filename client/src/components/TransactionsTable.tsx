import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Package } from "lucide-react";

export default function TransactionsTable() {
  // Mock data structure - in real implementation this would come from API
  const transactions = [
    {
      id: "1",
      date: "27/01/2025",
      product: {
        name: "Smartphone XYZ Pro",
        sku: "SPH-001",
        image: null
      },
      marketplace: {
        name: "Amazon US",
        icon: "🟠"
      },
      grossRevenue: 899.00,
      deductions: -134.85,
      netRevenue: 764.15,
      profit: 294.15,
      status: "Processado"
    },
    {
      id: "2",
      date: "27/01/2025",
      product: {
        name: "Fone Bluetooth Ultra",
        sku: "FBT-002",
        image: null
      },
      marketplace: {
        name: "Amazon BR",
        icon: "🟠"
      },
      grossRevenue: 249.90,
      deductions: -37.49,
      netRevenue: 212.41,
      profit: 92.41,
      status: "Processado"
    },
    {
      id: "3",
      date: "26/01/2025",
      product: {
        name: "Carregador Wireless",
        sku: "CWL-003",
        image: null
      },
      marketplace: {
        name: "Amazon US",
        icon: "🟠"
      },
      grossRevenue: 189.90,
      deductions: -28.49,
      netRevenue: 161.41,
      profit: 25.41,
      status: "Processando"
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Processado":
        return <Badge className="bg-green-100 text-green-800">Processado</Badge>;
      case "Processando":
        return <Badge className="bg-yellow-100 text-yellow-800">Processando</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transações Recentes</CardTitle>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Buscar transações..."
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filtros
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marketplace
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita Bruta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deduções
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita Líquida
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lucro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded mr-3 flex items-center justify-center">
                        <Package size={16} className="text-gray-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {transaction.product.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{transaction.marketplace.icon}</span>
                      <span className="text-sm text-gray-900">
                        {transaction.marketplace.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(transaction.grossRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {formatCurrency(transaction.deductions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(transaction.netRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-success font-medium">
                    {formatCurrency(transaction.profit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">1</span> a{" "}
            <span className="font-medium">10</span> de{" "}
            <span className="font-medium">247</span> resultados
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-white">
              1
            </Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">
              Próximo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
