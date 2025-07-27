import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import KPICard from "@/components/KPICard";
import TopProducts from "@/components/TopProducts";
import TransactionsTable from "@/components/TransactionsTable";
import AlertsPanel from "@/components/AlertsPanel";
import QuickActions from "@/components/QuickActions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Coins, Percent, FolderSync } from "lucide-react";

export default function Dashboard() {
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

  const handleSync = () => {
    toast({
      title: "Sincronização Iniciada",
      description: "Importando dados da Amazon...",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h2>
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Visão geral da sua operação multi-marketplace</p>
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
                  <Button onClick={handleSync} className="bg-primary hover:bg-blue-700">
                    <FolderSync className="w-4 h-4 mr-2" />
                    Sincronizar
                  </Button>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <KPICard
                title="Receita Bruta"
                value="R$ 127.450"
                change="+12.5%"
                icon={DollarSign}
                iconColor="text-primary"
                iconBg="bg-primary/10"
                trend="up"
              />
              <KPICard
                title="Receita Líquida"
                value="R$ 89.215"
                change="+8.3%"
                icon={TrendingUp}
                iconColor="text-green-600"
                iconBg="bg-green-100"
                trend="up"
              />
              <KPICard
                title="Lucro Total"
                value="R$ 34.680"
                change="+15.2%"
                icon={Coins}
                iconColor="text-yellow-600"
                iconBg="bg-yellow-100"
                trend="up"
              />
              <KPICard
                title="Margem Média"
                value="38.9%"
                change="+2.1%"
                icon={Percent}
                iconColor="text-gray-600"
                iconBg="bg-gray-100"
                trend="up"
              />
            </div>

            {/* Charts and Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Evolução da Receita</h3>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="bg-primary text-white border-primary">30d</Button>
                    <Button variant="outline" size="sm">7d</Button>
                    <Button variant="outline" size="sm">1d</Button>
                  </div>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="text-4xl text-gray-400 mb-2 mx-auto" size={48} />
                    <p className="text-gray-500">Gráfico de evolução da receita</p>
                    <p className="text-sm text-gray-400">Integração com biblioteca de gráficos</p>
                  </div>
                </div>
              </div>

              <TopProducts />
            </div>

            <TransactionsTable />

            {/* Alerts and Quick Actions */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AlertsPanel />
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
