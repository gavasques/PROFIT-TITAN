import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, DollarSign, History, AlertTriangle } from "lucide-react";

export default function Costs() {
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Gestão de Custos</h2>
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Controle histórico de custos com versionamento temporal</p>
                <Button className="bg-primary hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Atualizar Custos
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Produtos com Custo</h3>
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-green-600" size={16} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">847</p>
                  <p className="text-sm text-green-600">68% do total</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Produtos sem Custo</h3>
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="text-red-600" size={16} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">400</p>
                  <p className="text-sm text-red-600">32% do total</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Atualizações Hoje</h3>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <History className="text-blue-600" size={16} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">23</p>
                  <p className="text-sm text-blue-600">+15 vs ontem</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      placeholder="Buscar produtos por nome, SKU ou categoria..."
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Costs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Custo Atual
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Última Atualização
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Versões
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
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
                          <div className="text-sm text-gray-900 font-medium">R$ 470,00</div>
                          <div className="text-sm text-gray-500">Custo total</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          26/01/2025
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary">v3</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-green-100 text-green-800">Atualizado</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Histórico</Button>
                            <Button variant="outline" size="sm">Editar</Button>
                          </div>
                        </td>
                      </tr>

                      <tr className="hover:bg-gray-50">
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
                          <div className="text-sm text-gray-900 font-medium">R$ 120,00</div>
                          <div className="text-sm text-gray-500">Custo total</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          25/01/2025
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary">v2</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-green-100 text-green-800">Atualizado</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Histórico</Button>
                            <Button variant="outline" size="sm">Editar</Button>
                          </div>
                        </td>
                      </tr>

                      <tr className="hover:bg-gray-50">
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
                          <div className="text-sm text-red-600 font-medium">Sem custo</div>
                          <div className="text-sm text-gray-500">Não definido</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          -
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">v0</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="destructive">Pendente</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button variant="outline" size="sm" className="bg-primary text-white">
                            Definir Custo
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">1</span> a <span className="font-medium">10</span> de{" "}
                    <span className="font-medium">1.247</span> resultados
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
