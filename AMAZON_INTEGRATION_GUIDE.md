# Guia Completo de Integração Amazon SP-API

## O que foi implementado

Você agora tem um sistema completo de integração Amazon SP-API que inclui:

✅ **Serviço Amazon SP-API** (`server/amazonSPService.ts`)
- Conecta com a API da Amazon usando credenciais seguras
- Sincroniza produtos, pedidos e dados financeiros
- Validação automática de credenciais
- Tratamento de rate limits e erros

✅ **Sistema de Sincronização Automática** (`server/syncScheduler.ts`)
- Sincronização automática a cada hora (pedidos e financeiro)
- Sincronização completa a cada 6 horas
- Sincronização diária às 2h da manhã com atualização de produtos
- Monitoramento de status e logs detalhados

✅ **APIs REST Completas** (`server/routes/amazon.ts`)
- `/api/amazon-accounts` - Gerenciar contas Amazon
- `/api/amazon-accounts/:id/sync-products` - Sincronizar produtos
- `/api/amazon-accounts/:id/sync-orders` - Sincronizar pedidos
- `/api/amazon-accounts/:id/sync-financial` - Sincronizar dados financeiros
- `/api/amazon-accounts/:id/sync-all` - Sincronização completa
- `/api/amazon-accounts/:id/test-connection` - Testar conexão

✅ **Interface de Usuário**
- Modal para conectar novas contas Amazon (`AmazonConnectionModal.tsx`)
- Cards para gerenciar contas existentes (`AmazonAccountCard.tsx`)
- Integração completa com o sistema de autenticação

✅ **Banco de Dados Atualizado**
- Schema atualizado para suportar todas as credenciais SP-API
- Tabelas para produtos, pedidos, itens e transações financeiras
- Relacionamentos completos entre todas as entidades

## Como configurar uma conta Amazon SP-API

### Passo 1: Registrar como Desenvolvedor Amazon

1. **Acesse o Seller Central**
   - Faça login em https://sellercentral.amazon.com
   - Vá em "Apps e Serviços" > "Desenvolver Apps"

2. **Complete o Perfil de Desenvolvedor**
   - Preencha todas as informações solicitadas
   - Para desenvolvedores públicos, será necessário verificação de identidade

3. **Crie uma Aplicação SP-API**
   - Clique em "Criar nova aplicação"
   - Escolha "Private" para uso pessoal ou "Public" para revenda
   - Anote o **LWA App ID** e **LWA Client Secret**

### Passo 2: Configurar AWS

1. **Crie uma conta AWS** (se não tiver)
   - Acesse https://aws.amazon.com
   - Crie uma nova conta ou use existente

2. **Criar usuário IAM**
   - Vá para IAM Console
   - Crie um novo usuário com acesso programático
   - Anote **AWS Access Key** e **AWS Secret Key**

3. **Criar Role para SP-API**
   - No IAM, crie uma nova Role
   - Adicione a policy: `arn:aws:iam::aws:policy/AmazonAPIGatewayInvokeFullAccess`
   - Anote o **ARN da Role** (formato: `arn:aws:iam::123456789:role/NomeDaRole`)

### Passo 3: Obter Refresh Token

1. **Processo de Autorização OAuth**
   - Use a URL de autorização da Amazon:
   ```
   https://sellercentral.amazon.com/apps/authorize/consent?application_id=SEU_LWA_APP_ID&state=state-example&version=beta
   ```

2. **Após autorização**
   - Amazon redirecionará com um código de autorização
   - Troque este código por um refresh token usando a API

3. **Exemplo de troca de código por token**:
   ```bash
   curl -X POST \
     https://api.amazon.com/auth/o2/token \
     -H 'Content-Type: application/x-www-form-urlencoded' \
     -d 'grant_type=authorization_code&code=SEU_CODIGO&redirect_uri=SUA_REDIRECT_URI&client_id=SEU_LWA_APP_ID&client_secret=SEU_LWA_CLIENT_SECRET'
   ```

### Passo 4: Identificar Região e Marketplace

**Regiões disponíveis:**
- **NA (América do Norte)**: EUA, Canadá, México
  - Marketplaces: ATVPDKIKX0DER (EUA), A2EUQ1WTGCTBG2 (Canadá), A1AM78C64UM0Y8 (México)

- **EU (Europa)**: Alemanha, Reino Unido, França, Itália, Espanha, etc.
  - Marketplaces: A1PA6795UKMFR9 (Alemanha), A1F83G8C2ARO7P (Reino Unido), A13V1IB3VIYZZH (França)

- **FE (Extremo Oriente)**: Japão, Austrália, Singapura
  - Marketplaces: A1VC38T7YXB528 (Japão), A39IBJ37TRP1C6 (Austrália), A17E79C6D8DWNP (Singapura)

## Como usar o sistema

### 1. Conectar uma conta Amazon

1. **Acesse o dashboard** do sistema
2. **Clique em "Conectar Conta Amazon"**
3. **Preencha o formulário** com todas as credenciais:
   - Nome da conta (para identificação)
   - Região (NA, EU ou FE)
   - Seller ID (encontrado no Seller Central)
   - Marketplace ID principal
   - Todas as credenciais SP-API e AWS

4. **Teste automático** será executado antes de salvar
5. **Sincronização inicial** começará automaticamente

### 2. Gerenciar contas existentes

- **Testar conexão**: Verifica se as credenciais ainda são válidas
- **Sincronizar produtos**: Atualiza catálogo de produtos
- **Sincronizar pedidos**: Importa pedidos recentes
- **Sincronização completa**: Atualiza tudo (produtos, pedidos, financeiro)
- **Remover conta**: Remove conta e todos os dados associados

### 3. Sincronização automática

O sistema roda automaticamente:
- **A cada hora**: Pedidos e dados financeiros
- **A cada 6 horas**: Sincronização completa
- **Diariamente às 2h**: Atualização completa com produtos

## Dados sincronizados

### Produtos
- Informações básicas (nome, descrição, categoria)
- ASIN e SKU Amazon
- Imagens e atributos
- Status e preços atuais

### Pedidos
- Detalhes completos dos pedidos
- Informações do comprador (quando disponível)
- Status de fulfillment
- Itens individuais com quantidades e preços

### Dados Financeiros
- Comissões Amazon
- Taxas de fulfillment (FBA)
- Taxas de armazenagem
- Reembolsos e ajustes
- Receita líquida calculada

## Cálculo de Lucratividade

O sistema calcula automaticamente:
1. **Receita Bruta**: Preço dos produtos vendidos
2. **Taxas Amazon**: Comissões e taxas de serviço
3. **Receita Líquida**: Receita bruta - taxas Amazon
4. **Custo do Produto**: Usando histórico de custos por data
5. **Lucro**: Receita líquida - custo do produto
6. **Margem**: (Lucro / Receita bruta) × 100

## Monitoramento e Logs

- **Status de conexão** em tempo real
- **Logs detalhados** de sincronização
- **Alertas automáticos** para falhas
- **Métricas de performance** no dashboard

## Solução de Problemas

### Erro de Credenciais
- Verifique se todas as credenciais estão corretas
- Confirme se a role AWS tem as permissões necessárias
- Teste a conexão manualmente

### Falha na Sincronização
- Verifique os logs no console do servidor
- Teste a conexão com a conta
- Confirme se não há problemas de rate limiting

### Dados Inconsistentes
- Execute uma sincronização completa
- Verifique se os marketplace IDs estão corretos
- Confirme se a região está configurada corretamente

## Próximos Passos

Com a integração Amazon SP-API implementada, você pode:

1. **Testar a integração** com uma conta real
2. **Configurar alertas** personalizados
3. **Expandir para outros marketplaces** (Shopee, Mercado Livre)
4. **Implementar análises avançadas** de performance
5. **Automatizar reposição** de estoque

O sistema está pronto para uso em produção e pode handle múltiplas contas Amazon simultaneamente.