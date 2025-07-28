import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Mail, ExternalLink, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Support() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Central de Suporte</h1>
        <p className="text-muted-foreground">
          Ajuda e recursos para resolver problemas comuns do ProfitHub
        </p>
      </div>

      <div className="grid gap-6">
        {/* Status do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Status do Sistema
            </CardTitle>
            <CardDescription>
              Status atual das integrações e serviços
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Amazon SP-API</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                  Operacional
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">OAuth Authorization</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                  Funcionando
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Sincronização de Dados</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                  Ativa
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problemas Comuns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-500" />
              Problemas Comuns e Soluções
            </CardTitle>
            <CardDescription>
              Soluções para os problemas mais frequentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  Erro "Client authentication failed"
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  <strong>Causa:</strong> Credenciais LWA não correspondem ao Security Profile que gerou o refresh token.
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  <strong>Solução:</strong> Verificar se Client ID e Client Secret são do mesmo Security Profile.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  OAuth retorna erro MD1000
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  <strong>Causa:</strong> Aplicação em estado "draft" requer parâmetro version=beta.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  <strong>Solução:</strong> URL OAuth automaticamente corrigida no sistema.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Dados não aparecem no dashboard
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  <strong>Causa:</strong> Sincronização ainda em processo ou conta não autorizada.
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  <strong>Solução:</strong> Aguardar sincronização completa ou reconectar conta Amazon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recursos Úteis */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos Úteis</CardTitle>
            <CardDescription>
              Links e documentações importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start" asChild>
                <a href="/lwa-setup" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Guia de Configuração LWA
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href="/oauth-diagnostic" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Diagnóstico OAuth
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href="https://developer-docs.amazon.com/sp-api/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Documentação Amazon SP-API
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Precisa de Ajuda?
            </CardTitle>
            <CardDescription>
              Entre em contato conosco para suporte personalizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Mail className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Email de Suporte</p>
                  <a 
                    href="mailto:suporte@guivasques.app" 
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    suporte@guivasques.app
                  </a>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Tempo de resposta:</strong> Até 24 horas durante dias úteis
                </p>
                <p className="mt-1">
                  <strong>Inclua sempre:</strong> Descrição detalhada do problema, prints de tela se possível, e horário do ocorrido
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}