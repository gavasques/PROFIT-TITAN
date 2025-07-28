import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ExternalLink } from "lucide-react";

const amazonAccountSchema = z.object({
  accountName: z.string().min(1, "Nome da conta é obrigatório"),
  sellerId: z.string().min(1, "Seller ID é obrigatório"),
  marketplaceId: z.string().min(1, "Marketplace ID é obrigatório"),
  region: z.enum(["na", "eu", "fe", "br"], {
    errorMap: () => ({ message: "Selecione uma região válida" })
  }),
  refreshToken: z.string().optional(),
  lwaAppId: z.string().optional(),
  lwaClientSecret: z.string().optional(),
  awsAccessKey: z.string().optional(),
  awsSecretKey: z.string().optional(),
  awsRole: z.string().optional(),
});

type AmazonAccountFormData = z.infer<typeof amazonAccountSchema>;

interface AmazonConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AmazonConnectionModal({ open, onOpenChange }: AmazonConnectionModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();

  const form = useForm<AmazonAccountFormData>({
    resolver: zodResolver(amazonAccountSchema),
    defaultValues: {
      accountName: "",
      sellerId: "",
      marketplaceId: "",
      region: "na",
      refreshToken: "",
      lwaAppId: "",
      lwaClientSecret: "",
      awsAccessKey: "",
      awsSecretKey: "",
      awsRole: "",
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: AmazonAccountFormData) => {
      setIsConnecting(true);
      // Use form data directly - credentials are pre-configured in environment
      
      const response = await apiRequest("POST", "/api/amazon-accounts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Conta Amazon conectada com sucesso. Iniciando sincronização...",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/amazon-accounts"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("Erro ao conectar conta:", error);
      
      if (isUnauthorizedError(error)) {
        toast({
          title: "Login necessário",
          description: "Você precisa fazer login primeiro. Redirecionando...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      
      toast({
        title: "Erro na conexão",
        description: error.message || "Falha ao conectar com a Amazon. Verifique suas credenciais.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsConnecting(false);
    },
  });

  const regionOptions = [
    { value: "na", label: "América do Norte (EUA, Canadá, México)", marketplaces: "ATVPDKIKX0DER, A2EUQ1WTGCTBG2, A1AM78C64UM0Y8" },
    { value: "eu", label: "Europa (Alemanha, Reino Unido, França, etc.)", marketplaces: "A1PA6795UKMFR9, A1F83G8C2ARO7P, A13V1IB3VIYZZH" },
    { value: "fe", label: "Extremo Oriente (Japão, Austrália, Singapura)", marketplaces: "A1VC38T7YXB528, A39IBJ37TRP1C6, A17E79C6D8DWNP" },
    { value: "br", label: "Brasil", marketplaces: "A2Q3Y263D00KWC" },
  ];

  const handleSubmit = (data: AmazonAccountFormData) => {
    createAccountMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Conectar Conta Amazon</DialogTitle>
          <DialogDescription>
            Configure sua conta Amazon SP-API para sincronizar produtos, vendas e dados financeiros.
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated && !isLoading && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Login necessário:</strong> Você precisa fazer login para conectar contas Amazon.{" "}
              <button 
                onClick={() => window.location.href = "/api/login"}
                className="underline font-medium hover:no-underline"
              >
                Clique aqui para fazer login
              </button>
            </AlertDescription>
          </Alert>
        )}

        {isAuthenticated && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Credenciais temporárias:</strong> O sistema criará a conta com credenciais de desenvolvimento. Você precisará fornecer credenciais SP-API válidas posteriormente para sincronização completa.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Conta</FormLabel>
                    <FormControl>
                      <Input placeholder="Amazon EUA Principal" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nome para identificar esta conta
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Região</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a região" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Região onde sua conta está registrada. Brasil: A2Q3Y263D00KWC
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sellerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seller ID</FormLabel>
                    <FormControl>
                      <Input placeholder="A1B2C3D4E5F6G7" {...field} />
                    </FormControl>
                    <FormDescription>
                      Seu ID de vendedor Amazon
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketplaceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marketplace ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Brasil: A2Q3Y263D00KWC, EUA: ATVPDKIKX0DER" {...field} />
                    </FormControl>
                    <FormDescription>
                      ID do marketplace principal. Brasil: A2Q3Y263D00KWC
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Alert className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Credenciais já configuradas:</strong> As credenciais SP-API e AWS já estão configuradas no sistema. 
                Você só precisa fornecer as informações específicas da sua conta Amazon acima.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isConnecting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isConnecting || !isAuthenticated}
                className="bg-[#FF9900] hover:bg-[#FF9900]/90 text-white disabled:opacity-50"
              >
                {isConnecting ? "Conectando..." : 
                 !isAuthenticated ? "Login necessário" : 
                 "Conectar Conta"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}