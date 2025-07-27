import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  region: z.enum(["na", "eu", "fe"], {
    errorMap: () => ({ message: "Selecione uma região válida" })
  }),
  refreshToken: z.string().min(1, "Refresh Token é obrigatório"),
  lwaAppId: z.string().min(1, "LWA App ID é obrigatório"),
  lwaClientSecret: z.string().min(1, "LWA Client Secret é obrigatório"),
  awsAccessKey: z.string().min(1, "AWS Access Key é obrigatório"),
  awsSecretKey: z.string().min(1, "AWS Secret Key é obrigatório"),
  awsRole: z.string().min(1, "AWS Role ARN é obrigatório"),
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
      return await apiRequest("/api/amazon-accounts", {
        method: "POST",
        body: JSON.stringify(data),
      });
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

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você precisa ter uma conta de desenvolvedor Amazon SP-API ativa. 
            <a 
              href="https://developer-docs.amazon.com/sp-api/docs/sp-api-registration-overview" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center ml-1 text-blue-600 hover:underline"
            >
              Saiba mais
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>

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
                      Região onde sua conta está registrada
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
                      <Input placeholder="ATVPDKIKX0DER" {...field} />
                    </FormControl>
                    <FormDescription>
                      ID do marketplace principal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Credenciais SP-API</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lwaAppId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LWA App ID</FormLabel>
                      <FormControl>
                        <Input placeholder="amzn1.sp.solution..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lwaClientSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LWA Client Secret</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="refreshToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Refresh Token</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Atzr|IwEB..." 
                        className="min-h-[80px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Token de refresh obtido na autorização OAuth
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Credenciais AWS</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="awsAccessKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AWS Access Key</FormLabel>
                      <FormControl>
                        <Input placeholder="AKIAIOSFODNN7EXAMPLE" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="awsSecretKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AWS Secret Key</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="awsRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AWS Role ARN</FormLabel>
                    <FormControl>
                      <Input placeholder="arn:aws:iam::123456789:role/SellingPartnerAPIRole" {...field} />
                    </FormControl>
                    <FormDescription>
                      ARN da role IAM configurada para SP-API
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                disabled={isConnecting}
                className="bg-[#FF9900] hover:bg-[#FF9900]/90 text-white"
              >
                {isConnecting ? "Conectando..." : "Conectar Conta"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}