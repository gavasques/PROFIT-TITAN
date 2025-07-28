# Guia de Configuração OAuth Amazon SP-API

## Resumo da Implementação

Implementei o fluxo completo de autorização OAuth da Amazon SP-API seguindo a documentação oficial. O sistema agora permite:

1. **Iniciar autorização**: Clique nos três pontinhos (...) → "Autorizar na Amazon"
2. **Redirecionamento**: O usuário é direcionado ao Seller Central da Amazon
3. **Login e autorização**: O vendedor faz login e autoriza o aplicativo
4. **Callback**: Amazon retorna com código de autorização
5. **Troca por token**: Sistema troca código por refresh token automaticamente

## Configuração Necessária

Para o fluxo funcionar completamente, você precisa:

### 1. Registrar seu aplicativo na Amazon

1. Acesse o [Developer Central da Amazon](https://developer.amazon.com/)
2. Registre um novo aplicativo SP-API
3. Configure as permissões necessárias (Catalog Items, Orders, Finances, etc.)
4. Adicione a URL de callback: `https://seu-dominio.replit.app/api/amazon-auth/callback`

### 2. Configurar variáveis de ambiente

```
AMAZON_SP_API_APP_ID=amzn1.sellerapps.app.xxxxx
AMAZON_LWA_APP_ID=amzn1.application-oa2-client.xxxxx
AMAZON_LWA_CLIENT_SECRET=xxxxx
```

### 3. Status Atual

✅ Fluxo OAuth implementado no backend
✅ Interface de autorização no frontend
✅ Endpoints de callback configurados
✅ Troca de código por token implementada
❌ Precisa de credenciais reais da Amazon para funcionar

## Próximos Passos

1. Registre seu aplicativo na Amazon Developer Central
2. Configure as variáveis de ambiente com as credenciais reais
3. Teste o fluxo completo de autorização

## Referências

- [Website Authorization Workflow](https://developer-docs.amazon.com/sp-api/docs/website-authorization-workflow)
- [Authorize Public Applications](https://developer-docs.amazon.com/sp-api/docs/authorize-public-applications)
- [Renew Authorizations](https://developer-docs.amazon.com/sp-api/docs/renew-authorizations)