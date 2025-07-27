import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ShieldCheck, BarChart3, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">ProfitHub</h1>
                <p className="text-sm text-gray-500">Sistema de Gestão Multi-Marketplace</p>
              </div>
            </div>
            <Button onClick={handleLogin} className="bg-primary hover:bg-blue-700">
              Entrar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Controle Total da Sua Operação Amazon
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sistema completo de gestão de profit para vendedores Amazon com controle de custos históricos, 
            análise de lucratividade real e integração direta com Amazon SP-API.
          </p>
          <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-blue-700 text-lg px-8 py-3">
            Começar Agora
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-primary" size={24} />
              </div>
              <CardTitle className="text-lg">Análise de Lucratividade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Cálculo automático do lucro real considerando todas as taxas Amazon, 
                incluindo comissões, fulfillment e armazenagem.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="text-green-600" size={24} />
              </div>
              <CardTitle className="text-lg">Custos Históricos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Sistema de versionamento que nunca altera custos do passado, 
                garantindo análises históricas sempre precisas.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-orange-600" size={24} />
              </div>
              <CardTitle className="text-lg">Relatórios Detalhados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Dashboards e relatórios focados em dados que realmente importam 
                para tomar decisões estratégicas.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="text-purple-600" size={24} />
              </div>
              <CardTitle className="text-lg">Múltiplas Contas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Gerencie múltiplas contas Amazon de forma centralizada, 
                ideal para agências e vendedores multi-mercado.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Pronto para Maximizar Seus Lucros?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Comece agora mesmo e tenha visibilidade total sobre a lucratividade 
            real da sua operação Amazon. Interface simples, dados precisos, resultados comprovados.
          </p>
          <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-blue-700">
            Entrar no Sistema
          </Button>
        </div>
      </main>
    </div>
  );
}
