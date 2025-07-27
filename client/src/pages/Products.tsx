import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Package, AlertCircle } from "lucide-react";

export default function Products() {
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

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

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

            {/* Products List */}
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
                  <p className="text-gray-600 mb-6">
                    Comece adicionando seus primeiros produtos ou sincronize com suas contas Amazon.
                  </p>
                  <div className="flex justify-center space-x-3">
                    <Button className="bg-primary hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Produto
                    </Button>
                    <Button variant="outline">
                      Sincronizar Amazon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">SKU: {product.internalSku}</p>
                        </div>
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center ml-3">
                          <Package className="text-gray-400" size={20} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Categoria:</span>
                          <Badge variant="secondary">{product.category || 'Não definido'}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Listagens:</span>
                          <span className="text-sm font-medium">0 ativas</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <div className="flex items-center space-x-1">
                            <AlertCircle className="text-yellow-500" size={16} />
                            <span className="text-sm text-yellow-600">Sem custo</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            Custos
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
