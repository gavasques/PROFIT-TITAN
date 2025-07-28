import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  MessageCircle, 
  HelpCircle, 
  BookOpen, 
  ExternalLink,
  Clock,
  CheckCircle,
  TrendingUp
} from "lucide-react";

export default function Support() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">ProfitHub</h1>
              <p className="text-sm text-gray-500">Sistema de Gestão Multi-Marketplace</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Central de Suporte</h1>
          <p className="text-gray-600">
            Encontre ajuda, documentação e entre em contato conosco para resolver suas dúvidas sobre o ProfitHub.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Email de Suporte</CardTitle>
                  <CardDescription>Resposta em até 24 horas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Para dúvidas técnicas, problemas de integração ou questões sobre funcionalidades.
              </p>
              <Button 
                className="w-full" 
                onClick={() => window.open('mailto:suporte@guivasques.app', '_blank')}
              >
                <Mail className="w-4 h-4 mr-2" />
                suporte@guivasques.app
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Chat Ao Vivo</CardTitle>
                  <CardDescription>Horário comercial</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Disponível de segunda a sexta, das 9h às 18h (horário de Brasília).
              </p>
              <Button variant="outline" className="w-full" disabled>
                <Clock className="w-4 h-4 mr-2" />
                Em breve
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Status do Sistema</CardTitle>
                  <CardDescription>Todos os serviços operacionais</CardDescription>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                Operacional
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">API Amazon SP-API</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Sincronização</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Dashboard</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Perguntas Frequentes</CardTitle>
                <CardDescription>Dúvidas mais comuns sobre o ProfitHub</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Como conectar minha conta Amazon?</h4>
              <p className="text-sm text-gray-600 mb-2">
                Vá para "Conectar Conta Amazon", insira suas credenciais e autorize o acesso via OAuth. 
                É necessário ter as permissões adequadas no Seller Central.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Por que meus dados não estão sincronizando?</h4>
              <p className="text-sm text-gray-600 mb-2">
                Verifique se sua conta Amazon está autorizada e se as credenciais estão válidas. 
                Entre em contato conosco se o problema persistir.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Como cadastrar custos de produtos?</h4>
              <p className="text-sm text-gray-600 mb-2">
                Acesse a seção "Custos", selecione o produto e adicione o custo com data de vigência. 
                O sistema mantém histórico completo de alterações.
              </p>
            </div>

            <Separator />
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Posso usar múltiplas contas Amazon?</h4>
              <p className="text-sm text-gray-600 mb-2">
                Sim, o ProfitHub suporta múltiplas contas Amazon com gestão centralizada 
                e relatórios consolidados.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Documentação</CardTitle>
                <CardDescription>Guias e tutoriais detalhados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold mb-1">Guia de Início Rápido</div>
                  <div className="text-sm text-gray-600">Configure sua primeira conta em 5 minutos</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold mb-1">Integração Amazon SP-API</div>
                  <div className="text-sm text-gray-600">Como conectar e autorizar sua conta</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold mb-1">Gestão de Custos</div>
                  <div className="text-sm text-gray-600">Controle histórico e versionamento</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold mb-1">Relatórios Financeiros</div>
                  <div className="text-sm text-gray-600">Análise de lucratividade e KPIs</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}