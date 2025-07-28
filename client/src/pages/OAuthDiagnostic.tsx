import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, ExternalLink, AlertTriangle, CheckCircle, Info, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OAuthDiagnostic() {
  const [testResults, setTestResults] = useState<any>(null);
  const [credentialsTest, setCredentialsTest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingCredentials, setIsTestingCredentials] = useState(false);
  const { toast } = useToast();

  const runDiagnostic = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/amazon-auth/diagnostic');
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao executar diagnóstico",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testCredentials = async () => {
    setIsTestingCredentials(true);
    try {
      const response = await fetch('/api/amazon-auth/test-credentials');
      const data = await response.json();
      setCredentialsTest(data);
      
      if (data.success) {
        toast({
          title: "Sucesso!",
          description: "Credenciais LWA estão funcionando corretamente",
        });
      } else {
        toast({
          title: "Erro",
          description: data.message || "Falha no teste de credenciais",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao testar credenciais",
        variant: "destructive",
      });
    } finally {
      setIsTestingCredentials(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Diagnóstico OAuth Amazon</h1>
        <p className="text-muted-foreground">
          Diagnóstico do erro "Client authentication failed" no OAuth
        </p>
      </div>

      <div className="grid gap-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro Identificado:</strong> Client authentication failed - As credenciais LWA (Login with Amazon) estão incorretas ou mal configuradas.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração Necessária
            </CardTitle>
            <CardDescription>
              Para resolver o erro, você precisa verificar as configurações na Amazon Developer Console
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-lg">1. Verificar Redirect URIs</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Na Amazon Developer Console, vá em LWA App Settings e verifique se este URL está configurado:
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg font-mono text-sm">
                  https://profit.guivasques.app/api/amazon-auth/callback
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => copyToClipboard("https://profit.guivasques.app/api/amazon-auth/callback")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar URL
                </Button>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-lg">2. Verificar Client ID e Client Secret</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Confirme se as credenciais LWA estão corretas:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium min-w-32">LWA App ID:</span>
                    <Badge variant="outline" className="font-mono">
                      {process.env.VITE_LWA_APP_ID ? `${process.env.VITE_LWA_APP_ID.substring(0, 15)}...` : 'Não definido'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium min-w-32">Client Secret:</span>
                    <Badge variant="outline">
                      {process.env.VITE_LWA_CLIENT_SECRET ? 'Configurado' : 'Não definido'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-lg">3. Configurar Domínios Permitidos</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Na seção "Allowed Origins", adicione:
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg font-mono text-sm">
                  https://profit.guivasques.app
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => copyToClipboard("https://profit.guivasques.app")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Domínio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links Úteis</CardTitle>
            <CardDescription>
              Acesso direto às configurações Amazon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open('https://developer.amazon.com/lwa/sp/overview.html', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Amazon Developer Console - LWA Settings
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open('https://developer-docs.amazon.com/sp-api/docs/connecting-to-the-selling-partner-api', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Documentação SP-API - Conexão
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open('https://sellercentral.amazon.com/developer', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Seller Central - Developer Console
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teste de Credenciais LWA</CardTitle>
            <CardDescription>
              Teste se as credenciais LWA estão funcionando corretamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testCredentials}
              disabled={isTestingCredentials}
              className="w-full mb-4"
              variant={credentialsTest?.success ? "default" : "destructive"}
            >
              {isTestingCredentials ? "Testando..." : "Testar Credenciais LWA"}
            </Button>

            {credentialsTest && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {credentialsTest.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                  <h4 className="font-semibold">
                    {credentialsTest.success ? "Credenciais OK" : "Credenciais com Problema"}
                  </h4>
                </div>
                <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(credentialsTest, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teste de Diagnóstico</CardTitle>
            <CardDescription>
              Execute um teste para verificar as configurações atuais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runDiagnostic}
              disabled={isLoading}
              className="w-full mb-4"
            >
              {isLoading ? "Executando..." : "Executar Diagnóstico"}
            </Button>

            {testResults && (
              <div className="space-y-3">
                <h4 className="font-semibold">Resultados:</h4>
                <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Acesse a Amazon Developer Console</li>
              <li>Vá para a seção LWA (Login with Amazon)</li>
              <li>Configure o redirect URI: https://profit.guivasques.app/api/amazon-auth/callback</li>
              <li>Adicione o domínio permitido: https://profit.guivasques.app</li>
              <li>Copie o Client ID e Client Secret corretos</li>
              <li>Atualize as variáveis de ambiente AMAZON_LWA_APP_ID e AMAZON_LWA_CLIENT_SECRET</li>
              <li>Teste novamente o OAuth workflow</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}