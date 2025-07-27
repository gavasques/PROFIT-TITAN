# Pesquisa Amazon Selling Partner API (SP-API)

## Status da Documentação
- O repositório oficial `selling-partner-api-docs` foi arquivado em 27 de junho de 2024
- A documentação oficial agora está em: https://developer-docs.amazon.com/sp-api
- Repositório ativo para modelos e exemplos: `selling-partner-api-models`
- Repositório de exemplos: `selling-partner-api-samples`

## Diretrizes de Design do Sistema
- **Estilo**: Minimalista, leve, poucos efeitos
- **Interface**: Listagens simples mas totalmente funcionais
- **Cores**: Paleta reduzida, sem excessos visuais
- **Foco**: Funcionalidade sobre estética

## Funcionalidades Principais Identificadas
1. **Gestão de Produtos**: Cadastro básico de produtos
2. **Conexão de Contas**: Múltiplas contas Amazon (futuro: Shopee)
3. **Sincronização**: Puxar cadastros dos canais e vincular aos produtos
4. **Gestão de Custos**: 
   - Informar custo do produto
   - Histórico de custos com data de validade
   - Nunca atualizar custos do passado
5. **Gestão de Vendas**:
   - Puxar todas as vendas
   - Capturar todos os descontos (comissão, taxas, frete)
   - Relatório geral de vendas

## Próximos Passos
- Acessar repositório de modelos SP-API
- Estudar processo de autenticação
- Analisar endpoints disponíveis
- Pesquisar sobre Replit e implementação no-code



## APIs Disponíveis na Amazon SP-API

### APIs Principais Identificadas (relevantes para o sistema):

1. **catalog-items-api-model** - Gestão de catálogo de produtos
2. **finances-api-model** - Dados financeiros e transações
3. **fba-inventory-api-model** - Inventário FBA
4. **orders-api-model** - Gestão de pedidos
5. **listings-items-api-model** - Listagens de produtos
6. **product-pricing-api-model** - Preços de produtos
7. **reports-api-model** - Relatórios
8. **feeds-api-model** - Feeds para upload de dados

### APIs Complementares:
- amazon-warehousing-and-distribution-model
- aplus-content-api-model
- application-integrations-api-model
- application-management-api-model
- authorization-api-model
- customer-feedback-api-model
- data-kiosk-api-model
- easy-ship-model
- fba-inbound-eligibility-api-model
- fba-small-and-light-api-model
- fulfillment-inbound-api-model
- fulfillment-outbound-api-model
- invoices-api-model



### APIs Adicionais Importantes:
- **orders-api-model** - Gestão de pedidos (FUNDAMENTAL)
- **product-pricing-api-model** - Preços de produtos (FUNDAMENTAL)
- **reports-api-model** - Relatórios (FUNDAMENTAL)
- **sales-api-model** - Dados de vendas (FUNDAMENTAL)
- **seller-wallet-api-model** - Carteira do vendedor
- **product-fees-api-model** - Taxas de produtos
- **notifications-api-model** - Notificações
- **messaging-api-model** - Mensagens
- **merchant-fulfillment-api-model** - Fulfillment
- **listings-restrictions-api-model** - Restrições de listagens
- **replenishment-api-model** - Reposição
- **services-api-model** - Serviços
- **shipment-invoicing-api-model** - Faturamento de envios

### APIs Fundamentais para o Sistema:
1. **Authorization API** - Autenticação e autorização
2. **Orders API** - Dados de pedidos e vendas
3. **Finances API** - Dados financeiros, comissões, taxas
4. **Catalog Items API** - Catálogo de produtos
5. **Listings Items API** - Listagens de produtos
6. **Product Pricing API** - Preços
7. **Reports API** - Relatórios detalhados
8. **Sales API** - Dados de vendas
9. **Product Fees API** - Taxas e comissões


## Detalhes da API de Orders (ordersV0)

### Endpoint Principal: /orders/v0/orders

### Parâmetros de Consulta Disponíveis:
- **CreatedAfter**: Data de criação após (filtro temporal)
- **CreatedBefore**: Data de criação antes (filtro temporal)
- **LastUpdatedAfter**: Última atualização após (filtro temporal)
- **LastUpdatedBefore**: Última atualização antes (filtro temporal)
- **OrderStatuses**: Status dos pedidos (array de valores)
- **MarketplaceIds**: IDs dos marketplaces (obrigatório)
- **FulfillmentChannels**: Canais de fulfillment (AFN, MFN)
- **PaymentMethods**: Métodos de pagamento
- **BuyerEmail**: Email do comprador

### Funcionalidades Identificadas:
1. **Buscar Pedidos**: Filtrar por data, status, marketplace
2. **Detalhes do Pedido**: Informações completas de cada pedido
3. **Itens do Pedido**: Produtos vendidos em cada pedido
4. **Informações de Pagamento**: Métodos de pagamento utilizados
5. **Dados de Fulfillment**: Como o pedido foi processado

### Rate Limits:
- Baseado em planos de uso
- Headers de resposta contêm limites atuais
- Diferentes limites para diferentes operações


## Processo de Autenticação da Amazon SP-API

### Arquitetura de Autorização
A SP-API gerencia dois ciclos de vida de autorização distintos:

#### 1. Ciclo de Vida do Cliente da Aplicação:
- **Client ID e Client Secret**: Credenciais únicas da aplicação
- **Rotação de Credenciais**: Rotação periódica do client secret por segurança
- **Notificações SQS**: Configuração para gerenciar atualizações de credenciais
- **AWS Secrets Manager**: Armazenamento seguro das credenciais

#### 2. Ciclo de Vida de Autorização do Tenant:
- **Refresh Tokens**: Tokens para cada vendedor/fornecedor conectado
- **Access Tokens**: Tokens padrão para operações regulares da API
- **Restricted Data Tokens (RDTs)**: Tokens especializados para acessar PII
- **Reautorização**: Quando permissões mudam
- **Gerenciamento de Revogações**: Processamento de revogações de autorização

### Fluxos de Autorização Disponíveis:

#### 1. Website Authorization Flow (OAuth 2.0)
- Fluxo padrão baseado em redirecionamento para aplicações web
- Suporta contas de vendedores e fornecedores
- Processo:
  1. Aplicação inicia fluxo OAuth
  2. Parceiro concede permissão na página de consentimento da Amazon
  3. Aplicação troca código de autorização por tokens

#### 2. App Store Authorization Flow
- Para aplicações listadas no Amazon Marketplace Appstore
- Processo simplificado através do ecossistema Amazon
- Processo:
  1. Vendedor autoriza aplicação através da Appstore
  2. Amazon gerencia consentimento durante inicialização
  3. Aplicação recebe detalhes de autorização automaticamente

#### 3. Self-Authorization
- Acesso direto à própria conta de vendedor/fornecedor
- Não requer fluxos OAuth para terceiros
- Casos de uso:
  - Ferramentas internas personalizadas
  - Ambiente de desenvolvimento e teste
  - Aplicações de conta única

### Operações Grantless
- Subset de endpoints que operam apenas com credenciais da aplicação
- Não requerem autorização específica do tenant
- Usadas para gerenciamento de infraestrutura da aplicação

### Comparação dos Fluxos de Autorização:

| Característica | Website Auth | App Store Auth | Self Auth |
|----------------|--------------|----------------|-----------|
| Alvo | Todas as aplicações públicas | Aplicações da Appstore | Sua própria conta |
| Fluxo OAuth | Iniciado das aplicações | Iniciado da Appstore | Não precisa OAuth |
| Tipo de Parceiro | Vendedores e Fornecedores | Apenas vendedores | Sua conta vendedor/fornecedor |
| Complexidade | Média | Baixa (após aprovação) | Mais baixa |
| Descoberta | Seus próprios canais | Amazon Appstore | N/A |


## Detalhes da API de Finances (finances_2024-06-19)

### Endpoint Principal: /finances/2024-06-19/transactions

### Parâmetros de Consulta Disponíveis:
- **postedAfter**: Data de postagem após (filtro temporal)
- **postedBefore**: Data de postagem antes (filtro temporal)
- **marketplaceId**: ID do marketplace (obrigatório)
- **transactionStatus**: Status da transação (DEFERRED, RELEASED)
- **nextToken**: Token para paginação

### Funcionalidades Identificadas:
1. **Transações Financeiras**: Acesso a todas as transações financeiras
2. **Eventos Financeiros**: Dados de eventos que podem não incluir pedidos
3. **Filtros Temporais**: Busca por período específico
4. **Status de Transação**: Filtrar por status (diferido, liberado)
5. **Paginação**: Suporte a grandes volumes de dados

### Dados Financeiros Disponíveis:
- Comissões da Amazon
- Taxas de fulfillment
- Taxas de armazenagem
- Reembolsos
- Ajustes
- Transferências
- Pagamentos

### Versões Disponíveis:
- **financesV0.json**: Versão original
- **finances_2024-06-19.json**: Versão mais recente
- **transfers_2024-06-01.json**: API específica para transferências

### Rate Limits:
- Baseado em planos de uso
- Headers de resposta contêm limites atuais
- Paginação para grandes volumes de dados

