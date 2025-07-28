import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductsTable from "@/components/ProductsTable";
import ProductSyncButton from "@/components/ProductSyncButton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Products() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Get Amazon accounts for sync buttons
  const { data: amazonAccounts = [] } = useQuery({
    queryKey: ['/api/amazon-accounts'],
    enabled: isAuthenticated,
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Produtos</h2>
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Gerencie seu catálogo de produtos e sincronização com marketplaces</p>
                <Button className="bg-primary hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto
                </Button>
              </div>
            </div>

            {/* Sync Buttons */}
            {Array.isArray(amazonAccounts) && amazonAccounts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sincronizar Produtos</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {amazonAccounts.map((account: any) => (
                    <ProductSyncButton
                      key={account.id}
                      amazonAccountId={account.id}
                      accountName={account.accountName}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Products Table */}
            <ProductsTable />
          </div>
        </main>
      </div>
    </div>
  );
}
