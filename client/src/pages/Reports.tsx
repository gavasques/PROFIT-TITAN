import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart } from "lucide-react";

export default function Reports() {
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Relatórios</h2>
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Análises detalhadas e relatórios personalizados</p>
                <Button className="bg-primary hover:bg-blue-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Novo Relatório
                </Button>
              </div>
            </div>

            {/* Quick Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-blue-600" size={24} />
                    </div>
                    <Badge variant="secondary">Últimos 30 dias</Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Financeira</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Análise completa de receitas, custos e lucratividade por produto e marketplace.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Atualizado há 2h</span>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="text-green-600" size={24} />
                    </div>
                    <Badge variant="secondary">Este mês</Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Produtos</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Ranking dos produtos mais lucrativos com análise de margem e volume de vendas.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Atualizado há 1h</span>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <PieChart className="text-orange-600" size={24} />
                    </div>
                    <Badge variant="secondary">Últimos 90 dias</Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Evolução de Custos</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Histórico de alterações de custos e impacto na lucratividade por período.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Atualizado há 4h</span>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Custom Report Builder */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Gerador de Relatórios Personalizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Relatório
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Vendas</SelectItem>
                        <SelectItem value="costs">Custos</SelectItem>
                        <SelectItem value="profit">Lucratividade</SelectItem>
                        <SelectItem value="products">Produtos</SelectItem>
                        <SelectItem value="marketplace">Marketplace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Período
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">Últimos 7 dias</SelectItem>
                        <SelectItem value="30days">Últimos 30 dias</SelectItem>
                        <SelectItem value="thismonth">Este mês</SelectItem>
                        <SelectItem value="lastmonth">Mês anterior</SelectItem>
                        <SelectItem value="custom">Período personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marketplace
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os marketplaces" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="amazon-us">Amazon US</SelectItem>
                        <SelectItem value="amazon-br">Amazon BR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formato
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Formato do arquivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar
                  </Button>
                  <Button className="bg-primary hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Scheduled Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Agendados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Relatório Mensal de Lucratividade</h4>
                        <p className="text-sm text-gray-500">Todo primeiro dia do mês às 08:00</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="outline" size="sm">Pausar</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="text-green-600" size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Relatório Semanal de Vendas</h4>
                        <p className="text-sm text-gray-500">Toda segunda-feira às 09:00</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="outline" size="sm">Pausar</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <PieChart className="text-orange-600" size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Análise Trimestral de Custos</h4>
                        <p className="text-sm text-gray-500">A cada 3 meses no dia 1º às 10:00</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">Pausado</Badge>
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="outline" size="sm">Ativar</Button>
                    </div>
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
