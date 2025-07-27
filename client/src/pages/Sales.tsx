import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, TrendingUp, DollarSign, Percent } from "lucide-react";

export default function Sales() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Vendas</h2>
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Análise detalhada de vendas e lucratividade</p>
                <div className="flex items-center space-x-3">
                  <Select defaultValue="30days">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Últimos 7 dias</SelectItem>
                      <SelectItem value="30days">Últimos 30 dias</SelectItem>
                      <SelectItem value="thismonth">Este mês</SelectItem>
                      <SelectItem value="lastmonth">Mês anterior</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="bg-primary hover:bg-blue-700">
                    Exportar Relatório
                  </Button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Total de Vendas</h3>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="text-blue-600" size={16} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">2.847</p>
                  <p className="text-sm text-green-600">+12.5% vs período anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Receita Bruta</h3>
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-green-600" size={16} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">R$ 127.450</p>
                  <p className="text-sm text-green-600">+8.3% vs período anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Receita Líquida</h3>
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-yellow-600" size={16} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">R$ 89.215</p>
                  <p className="text-sm text-green-600">+15.2% vs período anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Ticket Médio</h3>
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Percent className="text-purple-600" size={16} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">R$ 44,78</p>
                  <p className="text-sm text-green-600">+2.1% vs período anterior</p>
                </CardContent>
              </Card>
            </div>

            {/* Sales Chart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Evolução de Vendas e Lucratividade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="text-4xl text-gray-400 mb-2 mx-auto" size={48} />
                    <p className="text-gray-500">Gráfico de evolução de vendas</p>
                    <p className="text-sm text-gray-400">Integração com biblioteca de gráficos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sales Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes de Vendas</CardTitle>
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
                          Qtd
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
                          Custo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lucro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Margem
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          27/01/2025
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">Smartphone XYZ Pro</div>
                              <div className="text-sm text-gray-500">SKU: SPH-001</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-orange-600 mr-2">🟠</span>
                            <span className="text-sm text-gray-900">Amazon US</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          R$ 899,00
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          -R$ 134,85
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          R$ 764,15
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ 470,00
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          R$ 294,15
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-green-100 text-green-800">38.5%</Badge>
                        </td>
                      </tr>

                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          27/01/2025
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">Fone Bluetooth Ultra</div>
                              <div className="text-sm text-gray-500">SKU: FBT-002</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-orange-600 mr-2">🟠</span>
                            <span className="text-sm text-gray-900">Amazon BR</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          R$ 499,80
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          -R$ 74,97
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          R$ 424,83
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ 240,00
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          R$ 184,83
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-green-100 text-green-800">43.5%</Badge>
                        </td>
                      </tr>

                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          26/01/2025
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">Carregador Wireless</div>
                              <div className="text-sm text-gray-500">SKU: CWL-003</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-orange-600 mr-2">🟠</span>
                            <span className="text-sm text-gray-900">Amazon US</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          R$ 189,90
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          -R$ 28,49
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          R$ 161,41
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          Sem custo
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          -
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="destructive">N/A</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">1</span> a <span className="font-medium">10</span> de{" "}
                    <span className="font-medium">2.847</span> resultados
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
          </div>
        </main>
      </div>
    </div>
  );
}
