import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ProductSyncButtonProps {
  amazonAccountId: string;
  accountName: string;
}

interface SyncResult {
  success: boolean;
  message: string;
  data?: {
    existingCount: number;
    newCount: number;
    totalCount: number;
  };
}

export default function ProductSyncButton({ amazonAccountId, accountName }: ProductSyncButtonProps) {
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/products/sync/${amazonAccountId}`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: (data: SyncResult) => {
      setSyncResult(data);
      toast({
        title: "Sincronização concluída",
        description: data.message,
      });
      // Invalidate products cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: Error) => {
      console.error('Product sync error:', error);
      setSyncResult({
        success: false,
        message: error.message || "Erro ao sincronizar produtos"
      });
      toast({
        title: "Erro na sincronização",
        description: error.message || "Falha ao sincronizar produtos da Amazon",
        variant: "destructive",
      });
    },
  });

  const handleSync = () => {
    setSyncResult(null);
    syncMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Sincronizar Produtos - {accountName}
        </CardTitle>
        <CardDescription>
          Importe produtos da sua conta Amazon e faça o match com produtos existentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={handleSync} 
            disabled={syncMutation.isPending}
            className="w-full"
          >
            {syncMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sincronizar Produtos
              </>
            )}
          </Button>

          {syncResult && (
            <div className={`p-4 rounded-lg border ${
              syncResult.success 
                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {syncResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    syncResult.success 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {syncResult.success ? 'Sincronização realizada com sucesso!' : 'Erro na sincronização'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    syncResult.success 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {syncResult.message}
                  </p>
                  
                  {syncResult.success && syncResult.data && (
                    <div className="flex gap-2 mt-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        {syncResult.data.existingCount} já existentes
                      </Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        {syncResult.data.newCount} novos adicionados
                      </Badge>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                        {syncResult.data.totalCount} total processados
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}