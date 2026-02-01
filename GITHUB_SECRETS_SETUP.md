# 🔐 Configuração de Secrets GitHub

Este documento descreve como configurar os secrets necessários para o CI/CD automático funcionar.

## 📋 Secrets Necessários

### 1. EXPO_TOKEN
**O quê é:** Token de autenticação para o Expo EAS Build
**Duração:** 1 ano (renovar periodicamente)

#### Como gerar:

```bash
# Instale EAS CLI globalmente
npm install -g eas-cli

# Faça login na sua conta Expo
eas auth login
# Será aberto um navegador para autenticação

# Crie um token para CI/CD
eas token create --non-interactive
# Copie o token exibido
```

#### Onde adicionar:

1. Vá para: `https://github.com/SEU_USER/etanol-gasolina/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. **Name:** `EXPO_TOKEN`
4. **Value:** Cole o token copiado
5. Clique **"Add secret"**

---

### 2. PLAY_STORE_SERVICE_ACCOUNT_JSON
**O quê é:** Credenciais para fazer upload na Google Play Console
**Onde vem:** Google Cloud Console (associado ao seu Google Play Console)

#### Como gerar:

##### Passo A: Criar projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione existente
3. Ative a API: Google Play Android Developer API
   - Menu: APIs e Serviços → Biblioteca
   - Procure: "Google Play Android Developer API"
   - Clique em "Ativar"

##### Passo B: Criar Service Account

1. Menu: APIs e Serviços → Credenciais
2. Clique em "Criar credenciais" → "Service Account"
3. Preencha:
   - **Nome:** `github-actions`
   - **ID:** `github-actions` (auto-preenchido)
   - Clique em "Criar e Continuar"
4. **Conceder acesso:**
   - Role: `Editor`
   - Clique em "Continuar"
5. Clique em "Concluído"

##### Passo C: Gerar Chave JSON

1. Menu: APIs e Serviços → Credenciais
2. Em "Service Accounts", clique em `github-actions@...`
3. Abra a aba "Chaves"
4. Clique em "Adicionar chave" → "Criar nova chave"
5. Selecione **"JSON"**
6. Clique em "Criar"
   - Um arquivo `xxxxx-xxxxx.json` será baixado
   - Salve em local seguro

##### Passo D: Copiar conteúdo JSON

1. Abra o arquivo JSON com um editor de texto
2. Copie TODO o conteúdo (desde `{` até `}`)

#### Onde adicionar:

1. Vá para: `https://github.com/SEU_USER/etanol-gasolina/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. **Name:** `PLAY_STORE_SERVICE_ACCOUNT_JSON`
4. **Value:** Cole o conteúdo JSON completo
5. Clique **"Add secret"**

---

## ✅ Verificação

### Confirmar que os secrets foram adicionados:

1. Vá para: https://github.com/SEU_USER/etanol-gasolina/settings/secrets/actions
2. Você deve ver 2 secrets:
   - ✓ `EXPO_TOKEN` (valor oculto)
   - ✓ `PLAY_STORE_SERVICE_ACCOUNT_JSON` (valor oculto)

### Testar o workflow:

1. Faça um commit e push para `main`:
   ```bash
   git add .
   git commit -m "Release v1.0.0"
   git push origin main
   ```

2. Vá para: `https://github.com/SEU_USER/etanol-gasolina/actions`

3. Você deve ver o workflow **"Build and Deploy to Play Store"** em execução

4. Aguarde conclusão (leva ~10-15 minutos)

---

## 🔒 Segurança

### ⚠️ Importante

- ✓ **Nunca** compartilhe seus secrets
- ✓ **Nunca** faça commit do arquivo JSON
- ✓ **Nunca** publique tokens em issues/pull requests
- ✓ GitHub oculta automaticamente valores de secrets em logs
- ✓ Se vazar acidentalmente, pode-se revogar o token

### Revogar um Token (se vazar)

```bash
# Remover token atual
eas token revoke <TOKEN_ID>

# Gerar novo
eas token create --non-interactive
```

---

## 📝 Checklist de Setup

- [ ] Conta Expo criada (https://expo.dev)
- [ ] `eas-cli` instalado globalmente
- [ ] `eas auth login` executado
- [ ] Token Expo gerado com `eas token create --non-interactive`
- [ ] Projeto Google Cloud Console criado
- [ ] Google Play Android Developer API ativada
- [ ] Service Account criado (`github-actions`)
- [ ] Chave JSON gerada e baixada
- [ ] Secret `EXPO_TOKEN` adicionado no GitHub
- [ ] Secret `PLAY_STORE_SERVICE_ACCOUNT_JSON` adicionado no GitHub
- [ ] Commit pushed para `main`
- [ ] Workflow executado com sucesso em Actions

---

## 🆘 Troubleshooting

### Erro: "Unauthorized" no EAS Build

**Causa:** Token expirado ou inválido

**Solução:**
```bash
eas logout
eas auth login
eas token create --non-interactive
# Atualizar secret EXPO_TOKEN no GitHub
```

### Erro: "Invalid service account key"

**Causa:** JSON inválido ou incompleto

**Solução:**
1. Verifique se o arquivo JSON está completo
2. Copie novamente do Google Cloud Console
3. Teste localmente: `cat service-account-key.json | jq .`
4. Atualize o secret no GitHub

### Workflow não é acionado

**Causa:** Push foi para branch errada

**Solução:** O workflow só roda em `main` ou `master`
```bash
git push origin main
```

### Build falha com erro de permissões

**Causa:** Service account não tem permissões

**Solução:**
1. Volte ao Google Cloud Console
2. IAM & Admin → Concessões de função
3. Adicione papel `Publish Apps` para o service account

---

## 📚 Referências

- [Expo EAS CLI](https://docs.expo.dev/build/setup/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Play Console](https://play.google.com/console)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Quando estiver pronto, vá para [SETUP_FINAL.md](SETUP_FINAL.md) Passo 5 para fazer o deploy! 🚀**
