import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import KPICard from "@/components/KPICard";
import TopProducts from "@/components/TopProducts";
import TransactionsTable from "@/components/TransactionsTable";
import AlertsPanel from "@/components/AlertsPanel";
import QuickActions from "@/components/QuickActions";
import { AmazonConnectionModal } from "@/components/AmazonConnectionModal";
import { AmazonAccountCard } from "@/components/AmazonAccountCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Coins, Percent, FolderSync, Plus } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showAmazonModal, setShowAmazonModal] = useState(false);

  // Fetch Amazon accounts
  const { data: amazonAccounts = [], isLoading: loadingAccounts, error: accountsError } = useQuery({
    queryKey: ["/api/amazon-accounts"],
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        // Redirect to login on unauthorized error
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    }
  });

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

            {/* Amazon Accounts Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Contas Amazon</h3>
                <Button 
                  onClick={() => setShowAmazonModal(true)}
                  className="bg-[#FF9900] hover:bg-[#FF9900]/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Conectar Conta Amazon
                </Button>
              </div>
              
              {loadingAccounts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : amazonAccounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {amazonAccounts.map((account: any) => (
                    <AmazonAccountCard key={account.id} account={account} />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#FF9900]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FolderSync className="w-8 h-8 text-[#FF9900]" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhuma conta Amazon conectada
                      </h3>
                      <p className="text-gray-600 mb-4 max-w-sm">
                        Conecte sua conta Amazon para começar a sincronizar produtos, pedidos e dados financeiros automaticamente.
                      </p>
                      <Button 
                        onClick={() => setShowAmazonModal(true)}
                        className="bg-[#FF9900] hover:bg-[#FF9900]/90 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Conectar Primeira Conta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Alerts and Quick Actions */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AlertsPanel />
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
      
      {/* Amazon Connection Modal */}
      <AmazonConnectionModal 
        open={showAmazonModal} 
        onOpenChange={setShowAmazonModal} 
      />
    </div>
  );
}
