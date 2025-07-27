import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-orange-50">
              <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Amazon US</p>
                <p className="text-xs text-gray-500">Conectado</p>
              </div>
              <CheckCircle className="text-green-500" size={16} />
            </div>
            
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-orange-50">
              <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Amazon BR</p>
                <p className="text-xs text-gray-500">Conectado</p>
              </div>
              <CheckCircle className="text-green-500" size={16} />
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600"
            >
              <Plus size={16} className="mr-2" />
              Conectar Marketplace
            </Button>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Status do Sistema</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Última Sync:</span>
              <span className="text-gray-900 font-medium">há 5 min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Produtos:</span>
              <span className="text-gray-900 font-medium">1.247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vendas hoje:</span>
              <span className="text-gray-900 font-medium">R$ 12.450</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
