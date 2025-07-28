import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OAuthTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const startOAuthFlow = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/amazon-auth/start?accountId=test-account&region=na`);
      const data = await response.json();
      
      if (response.ok) {
        setAuthUrl(data.authUrl);
        toast({
          title: "URL de autorização gerada",
          description: "URL OAuth criada com parâmetro version=beta para apps em draft",
        });
      } else {
        toast({
          title: "Erro",
          description: data.message || "Falha ao gerar URL OAuth",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Teste OAuth Amazon SP-API</h1>
        <p className="text-muted-foreground">
          Teste do workflow OAuth com correção para aplicações em estado de draft
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Correção Aplicada
            </CardTitle>
            <CardDescription>
              URL OAuth agora inclui o parâmetro version=beta obrigatório para apps em draft
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Problema Identificado
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Apps em estado "draft" devem usar o parâmetro version=beta na URL de autorização.
                    Sem este parâmetro, a Amazon retorna erro MD1000.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Solução Implementada
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    URL OAuth atualizada para incluir version=beta automaticamente.
                    Formato: https://sellercentral.amazon.com/apps/authorize/consent?application_id=APP_ID&state=STATE&version=beta
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testar OAuth Workflow</CardTitle>
            <CardDescription>
              Gere uma URL de autorização para testar o workflow OAuth corrigido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={startOAuthFlow} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Gerando URL..." : "Gerar URL OAuth"}
              </Button>

              {authUrl && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600">
                      URL Gerada
                    </Badge>
                    <Badge variant="secondary">
                      version=beta incluído
                    </Badge>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg break-all text-sm">
                    {authUrl}
                  </div>
                  
                  <Button 
                    onClick={() => window.open(authUrl, '_blank')}
                    className="w-full"
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir URL de Autorização
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status da Aplicação</CardTitle>
            <CardDescription>
              Informações sobre o estado atual da aplicação Amazon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Estado da App:</span>
                <Badge variant="secondary">Draft</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">OAuth URL:</span>
                <Badge variant="outline" className="text-green-600">
                  Corrigida
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Parâmetro version=beta:</span>
                <Badge variant="outline" className="text-green-600">
                  Incluído
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Domínio:</span>
                <Badge variant="outline">profit.guivasques.app</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Testar o workflow OAuth com a URL corrigida</li>
              <li>Verificar se a página de consentimento da Amazon carrega corretamente</li>
              <li>Completar o processo de autorização</li>
              <li>Após aprovação da app, remover o parâmetro version=beta</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}