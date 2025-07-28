import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { 
  MoreHorizontal, 
  RefreshCw, 
  Settings, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Package,
  ShoppingCart,
  DollarSign,
  Key
} from "lucide-react";

interface AmazonAccount {
  id: string;
  accountName: string;
  region: string | null;
  status: 'pending' | 'connected' | 'error' | 'disconnected';
  sellerId: string;
  marketplaceId: string;
  lastSyncAt?: string;
  createdAt: string;
}

interface AmazonAccountCardProps {
  account: AmazonAccount;
}

export function AmazonAccountCard({ account }: AmazonAccountCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'connected':
        return {
          label: 'Conectado',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
        };
      case 'error':
        return {
          label: 'Erro',
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
        };
      case 'pending':
        return {
          label: 'Pendente',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
        };
      default:
        return {
          label: 'Desconectado',
          color: 'bg-gray-100 text-gray-800',
          icon: XCircle,
        };
    }
  };

  const getRegionLabel = (region: string | null) => {
    if (!region) return 'Região não definida';
    
    switch (region) {
      case 'na':
        return 'América do Norte';
      case 'eu':
        return 'Europa';
      case 'fe':
        return 'Extremo Oriente';
      case 'br':
        return 'Brasil';
      default:
        return region.toUpperCase();
    }
  };

  const syncProductsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/amazon-accounts/${account.id}/sync-products`, {
        method: "POST"
      });
    },
    onSuccess: () => {
      toast({
        title: "Sincronização iniciada",
        description: "Produtos estão sendo sincronizados da Amazon.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/amazon-accounts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro na sincronização",
        description: error.message || "Falha ao sincronizar produtos.",
        variant: "destructive",
      });
    },
  });

  const syncOrdersMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/amazon-accounts/${account.id}/sync-orders`, {
        method: "POST"
      });
    },
    onSuccess: () => {
      toast({
        title: "Sincronização iniciada",
        description: "Pedidos estão sendo sincronizados da Amazon.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/amazon-accounts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro na sincronização",
        description: error.message || "Falha ao sincronizar pedidos.",
        variant: "destructive",
      });
    },
  });

  const syncAllMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/amazon-accounts/${account.id}/sync-all`, {
        method: "POST"
      });
    },
    onSuccess: () => {
      toast({
        title: "Sincronização completa iniciada",
        description: "Todos os dados estão sendo sincronizados da Amazon.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/amazon-accounts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro na sincronização",
        description: error.message || "Falha na sincronização completa.",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/amazon-accounts/${account.id}/test-connection`, {
        method: "POST"
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: data.connected ? "Conexão OK" : "Falha na conexão",
        description: data.connected 
          ? "Conexão com Amazon estabelecida com sucesso." 
          : "Não foi possível conectar com a Amazon. Verifique as credenciais.",
        variant: data.connected ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/amazon-accounts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no teste",
        description: error.message || "Falha ao testar conexão.",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/amazon-accounts/${account.id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      toast({
        title: "Conta removida",
        description: "Conta Amazon foi removida com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/amazon-accounts"] });
      setShowDeleteDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover",
        description: error.message || "Falha ao remover conta.",
        variant: "destructive",
      });
    },
  });

  const statusInfo = getStatusInfo(account.status);
  const StatusIcon = statusInfo.icon;

  const isLoading = syncProductsMutation.isPending || 
                   syncOrdersMutation.isPending || 
                   syncAllMutation.isPending ||
                   testConnectionMutation.isPending ||
                   deleteAccountMutation.isPending;

  return (
    <>
      <Card className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {account.accountName}
                <Badge className={statusInfo.color} variant="secondary">
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </CardTitle>
              <CardDescription>
                {getRegionLabel(account.region)} • {account.sellerId}
              </CardDescription>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoading}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={async () => {
                    try {
                      const response = await apiRequest(
                        `/api/amazon-auth/start?accountId=${account.id}&region=${account.region}`,
                        { method: "GET" }
                      );
                      if (response.authUrl) {
                        window.location.href = response.authUrl;
                      }
                    } catch (error) {
                      toast({
                        title: "Erro ao iniciar autorização",
                        description: error instanceof Error ? error.message : "Erro desconhecido",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Autorizar na Amazon
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => testConnectionMutation.mutate()}>
                  <Settings className="w-4 h-4 mr-2" />
                  Testar Conexão
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={async () => {
                    try {
                      const response = await apiRequest(`/api/amazon-accounts/${account.id}/test-auth`, {
                        method: "POST"
                      });
                      console.log('Auth test result:', response);
                      toast({
                        title: "Teste de Autenticação",
                        description: response.message || "Teste concluído"
                      });
                    } catch (error) {
                      console.error('Auth test error:', error);
                      toast({
                        title: "Erro no teste de autenticação",
                        description: error instanceof Error ? error.message : "Erro desconhecido",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Testar Autenticação
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => syncProductsMutation.mutate()}>
                  <Package className="w-4 h-4 mr-2" />
                  Sincronizar Produtos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => syncOrdersMutation.mutate()}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Sincronizar Pedidos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => syncAllMutation.mutate()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronização Completa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover Conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium">Marketplace:</span>
              <span>{account.marketplaceId}</span>
            </div>
            
            {account.lastSyncAt && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Última sincronização:</span>
                <span>{new Date(account.lastSyncAt).toLocaleString('pt-BR')}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Criada em:</span>
              <span>{new Date(account.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          {account.status === 'connected' && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncProductsMutation.mutate()}
                  disabled={isLoading}
                  className="text-xs"
                >
                  <Package className="w-3 h-3 mr-1" />
                  Produtos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncOrdersMutation.mutate()}
                  disabled={isLoading}
                  className="text-xs"
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Pedidos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncAllMutation.mutate()}
                  disabled={isLoading}
                  className="text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Tudo
                </Button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processando...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover conta Amazon?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente a conta "{account.accountName}" e todos os dados 
              associados. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAccountMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              Remover Conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}