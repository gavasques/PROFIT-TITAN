import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { 
  PieChart, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  BarChart3, 
  Warehouse,
  Plus,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function Sidebar() {
  const [location, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  // Fetch Amazon accounts for marketplace display
  const { data: amazonAccounts = [] } = useQuery({
    queryKey: ["/api/amazon-accounts"],
    enabled: isAuthenticated,
  });

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: PieChart,
      active: location === "/",
    },
    {
      name: "Produtos",
      path: "/products",
      icon: Package,
      active: location === "/products",
    },
    {
      name: "Custos",
      path: "/costs",
      icon: DollarSign,
      active: location === "/costs",
    },
    {
      name: "Vendas",
      path: "/sales",
      icon: ShoppingCart,
      active: location === "/sales",
    },
    {
      name: "Relatórios",
      path: "/reports",
      icon: BarChart3,
      active: location === "/reports",
    },
    {
      name: "Inventário",
      path: "/inventory",
      icon: Warehouse,
      active: location === "/inventory",
    },
  ];

  return (
    <nav className="w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        {/* Navigation Menu */}
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left",
                    item.active
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon size={16} />
                  <span className="font-medium">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Marketplace Connections */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Marketplaces
          </h3>
          <div className="space-y-2">
            {isAuthenticated && amazonAccounts.length > 0 ? (
              <>
                {amazonAccounts.map((account: any) => (
                  <div key={account.id} className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-orange-50">
                    <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      A
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{account.accountName}</p>
                      <p className="text-xs text-gray-500">
                        {account.status === 'connected' ? 'Conectado' : 
                         account.status === 'error' ? 'Erro' : 
                         account.status === 'pending' ? 'Pendente' : 'Desconectado'}
                      </p>
                    </div>
                    {account.status === 'connected' ? (
                      <CheckCircle className="text-green-500" size={16} />
                    ) : (
                      <AlertCircle className="text-red-500" size={16} />
                    )}
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-start border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600"
                  onClick={() => navigate("/")}
                >
                  <Plus size={16} className="mr-2" />
                  Conectar Marketplace
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-gray-500 mb-2">Nenhuma conta conectada</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-start border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600"
                  onClick={() => navigate("/")}
                >
                  <Plus size={16} className="mr-2" />
                  Conectar Marketplace
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        {isAuthenticated && amazonAccounts.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Status do Sistema</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Contas conectadas:</span>
                <span className="text-gray-900 font-medium">{amazonAccounts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Operacional</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
