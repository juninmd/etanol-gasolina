# 🚀 Setup Expo para Etanol ou Gasolina

## Instalação Inicial

```bash
# Instalar dependências
pnpm install

# OU com npm
npm install

# OU com yarn
yarn install
```

## Desenvolvimento

### Web Preview (Recomendado para testes)
```bash
pnpm web
```
Abre automaticamente em `http://localhost:8081`

### Mobile (Android)
```bash
# Desenvolvimento com Expo Go
pnpm start --android

# OU Build nativo
pnpm run:android
```

### Mobile (iOS)
```bash
pnpm run:ios
```

## Build para Produção

### Pré-requisitos

1. **Conta Expo**: https://expo.dev
2. **EAS CLI instalado**:
   ```bash
   npm install -g eas-cli
   ```
3. **Autenticação Expo**:
   ```bash
   eas login
   ```

### Build APK para Testes (Android)
```bash
eas build --platform android --profile preview
```
Resultado: APK que você pode instalar diretamente em um device

### Build AAB para Play Store (Android)
```bash
eas build --platform android --profile production
```
Resultado: AAB pronto para upload na Play Store

## CI/CD com GitHub Actions

### Configurar Secrets no GitHub

1. Vá para `Settings → Secrets and variables → Actions`
2. Adicione:

#### `EXPO_TOKEN`
```bash
# Obter token Expo
eas token create --non-interactive
```
Cole o token no GitHub Secret

#### `PLAY_STORE_SERVICE_ACCOUNT_JSON`
1. Crie um projeto no Google Cloud Console
2. Gere uma service account key em JSON
3. Cole o conteúdo do JSON como secret

### Workflow Automático

O arquivo `.github/workflows/build-and-deploy.yml` define:
- ✅ Trigger em push para `main` ou `master`
- ✅ Instalação de dependências
- ✅ Build com Expo
- ✅ Upload automático na Play Store

Apenas faça commit e push para `main`:
```bash
git add .
git commit -m "feat: nova feature"
git push origin main
```

O build e deploy acontecem automaticamente!

## Estrutura de Arquivos

```
etanol-gasolina/
├── app.json              # Configuração Expo
├── eas.json              # Profiles de build
├── babel.config.js       # Babel com decorators MobX
├── package.json          # Dependências
├── src/
│   ├── App.tsx           # Entry point
│   ├── index.tsx         # Root
│   ├── stores/           # MobX stores
│   ├── containers/       # Telas
│   ├── components/       # Componentes
│   └── routes/           # Navegação
├── assets/               # Icons e splashes
└── .github/
    └── workflows/
        └── build-and-deploy.yml
```

## Troubleshooting

### "Command not found: eas"
```bash
npm install -g eas-cli@latest
```

### Build falha localmente
```bash
# Limpar cache
pnpm install --force

# Tentar build novamente
eas build --platform android --profile preview
```

### Web não abre
```bash
# Verificar se porta 8081 está livre
lsof -i :8081  # macOS/Linux
netstat -ano | findstr :8081  # Windows

# Se ocupada, matar processo
kill -9 <PID>  # macOS/Linux
```

## Versioning

Para incrementar versão:

1. Editar `package.json` versão
2. Editar `app.json` versão e `versionCode`
3. Commit com tag:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

## Play Store Submission

1. Upload do AAB é automático via GitHub Actions
2. Acesse https://play.google.com/console
3. Revisar submissão
4. Publicar quando pronto

## Documentação Oficial

- Expo: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/eas-update/getting-started
- Play Store: https://developer.android.com/studio/publish

---

**Próximo passo**: Execute `pnpm install` e depois `pnpm web` para visualizar o app em desenvolvimento! 🎉
