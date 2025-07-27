import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Bell, User } from "lucide-react";

export default function Header() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">ProfitHub</h1>
              <p className="text-sm text-gray-500">Sistema de Gestão Multi-Marketplace</p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            {/* Sync Status */}
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">Sincronizado</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName || user?.email || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer" onClick={handleLogout}>
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="text-white" size={16} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
