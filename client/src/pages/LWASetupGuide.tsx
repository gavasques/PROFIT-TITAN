import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, ExternalLink, AlertTriangle, CheckCircle, Info, Settings, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LWASetupGuide() {
  const { toast } = useToast();

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
        <h1 className="text-3xl font-bold mb-2">Guia de Configuração LWA</h1>
        <p className="text-muted-foreground">
          Passo a passo completo para configurar Login with Amazon (LWA) corretamente
        </p>
      </div>

      <div className="grid gap-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Problema Identificado:</strong> Baseado na documentação oficial da Amazon, o erro "Client authentication failed" indica que o redirect URI não está configurado corretamente no Amazon Developer Console ou as credenciais LWA estão incorretas.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração no Amazon Developer Console
            </CardTitle>
            <CardDescription>
              Siga estes passos exatos conforme a documentação oficial da Amazon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  Acessar Amazon Developer Console
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Acesse o console de desenvolvedor Amazon e vá para a seção LWA:
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg font-mono text-sm">
                  https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.open('https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Console
                </Button>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  Configurar Security Profile
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  No seu Security Profile existente, clique no ícone de engrenagem e selecione "Web Settings"
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Allowed Return URLs (OBRIGATÓRIO):</p>
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
                    <p className="text-sm font-medium mb-2">Allowed Origins (OBRIGATÓRIO):</p>
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
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                  Verificar Credenciais
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Copie as credenciais corretas da sua Security Profile:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium min-w-32">Client ID:</span>
                    <span className="text-sm text-muted-foreground">Copie da seção "Security Profile"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium min-w-32">Client Secret:</span>
                    <span className="text-sm text-muted-foreground">Clique em "Show Secret" e copie</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                  Verificar Endpoint Regional
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Para Brasil, certifique-se de usar o endpoint correto:
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg font-mono text-sm">
                  Token Endpoint: https://api.amazon.com/auth/o2/token
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Nota: Conforme documentação, aplicações não são específicas por região. Você pode usar qualquer endpoint regional LWA.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Problemas Comuns Identificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <h5 className="font-semibold text-red-900 dark:text-red-100 mb-2">1. Redirect URI Exato</h5>
                <p className="text-sm text-red-700 dark:text-red-300">
                  O redirect_uri deve corresponder EXATAMENTE ao configurado no Amazon Developer Console. 
                  Até mesmo barras no final importam.
                </p>
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <h5 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">2. HTTPS Obrigatório</h5>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Todos os URLs de produção devem usar HTTPS. HTTP só é permitido para localhost em desenvolvimento.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">3. Credenciais LWA Corretas</h5>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Client ID e Client Secret devem ser copiados exatamente da Security Profile no Amazon Developer Console.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Checklist de Verificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">URL configurado em Allowed Return URLs</span>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Domínio configurado em Allowed Origins</span>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Client ID copiado corretamente</span>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Client Secret copiado corretamente</span>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Variáveis de ambiente atualizadas</span>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Aplicação reiniciada após mudanças</span>
              </div>
            </div>
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
              <li>Complete todas as configurações no Amazon Developer Console</li>
              <li>Atualize as variáveis de ambiente AMAZON_LWA_APP_ID e AMAZON_LWA_CLIENT_SECRET</li>
              <li>Reinicie a aplicação</li>
              <li>Teste o OAuth workflow novamente</li>
              <li>Se o erro persistir, verifique os logs detalhados no console</li>
            </ol>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Nota Importante:</strong> Após fazer as configurações, pode levar alguns minutos para que as mudanças sejam propagadas nos servidores da Amazon. Se o erro persistir, aguarde 5-10 minutos e tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}