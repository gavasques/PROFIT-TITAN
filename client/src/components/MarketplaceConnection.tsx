import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertCircle, Plus, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertAmazonAccountSchema } from "@shared/schema";

export default function MarketplaceConnection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: amazonAccounts = [], isLoading, error } = useQuery({
    queryKey: ["/api/amazon-accounts"],
  }) as { data: any[], isLoading: boolean, error: any };

  const createAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/amazon-accounts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/amazon-accounts"] });
      setIsDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Conta Amazon conectada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao conectar conta Amazon",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const data = {
      marketplaceId: formData.get("marketplaceId") as string,
      sellerId: formData.get("sellerId") as string,
      accountName: formData.get("accountName") as string,
      connectionStatus: "active",
    };

    try {
      const validatedData = insertAmazonAccountSchema.parse(data);
      createAccountMutation.mutate(validatedData);
    } catch (error) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, verifique os dados informados",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="text-green-500" size={16} />;
      case "error":
        return <AlertCircle className="text-red-500" size={16} />;
      default:
        return <AlertCircle className="text-yellow-500" size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
      case "error":
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Marketplaces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Marketplaces</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Conectar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Conectar Conta Amazon</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="accountName">Nome da Conta</Label>
                  <Input
                    id="accountName"
                    name="accountName"
                    placeholder="ex: Amazon US, Amazon BR"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="marketplaceId">Marketplace</Label>
                  <Select name="marketplaceId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o marketplace" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ATVPDKIKX0DER">Amazon US</SelectItem>
                      <SelectItem value="A2Q3Y263D00KWC">Amazon BR</SelectItem>
                      <SelectItem value="A1PA6795UKMFR9">Amazon DE</SelectItem>
                      <SelectItem value="A13V1IB3VIYZZH">Amazon FR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sellerId">Seller ID</Label>
                  <Input
                    id="sellerId"
                    name="sellerId"
                    placeholder="Seu Amazon Seller ID"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createAccountMutation.isPending}
                    className="bg-primary hover:bg-blue-700"
                  >
                    {createAccountMutation.isPending ? "Conectando..." : "Conectar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {amazonAccounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-amazon-orange rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Nenhuma conta Amazon conectada
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Conectar primeira conta
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <>
              {amazonAccounts.map((account: any) => (
                <div
                  key={account.id}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-orange-50 border border-orange-100"
                >
                  <div className="w-8 h-8 bg-amazon-orange rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {account.accountName}
                    </p>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(account.connectionStatus)}
                      {account.lastSyncAt && (
                        <span className="text-xs text-gray-500">
                          Sync: {new Date(account.lastSyncAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(account.connectionStatus)}
                    <Button variant="ghost" size="sm">
                      <Settings size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
