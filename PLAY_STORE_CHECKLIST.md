# ✅ Checklist para Publicação na Play Store

## Pré-requisitos Completados

- [x] Versão estabilizada (v1.0.0)
- [x] Funcionalidades completas e testadas
- [x] Simulações desabilitadas (sem crashes)
- [x] SDK atualizado para Android 12 (API 31)
- [x] Permissões configuradas

## 🔐 Passo 1: Configurar Google Maps API Key

**OBRIGATÓRIO antes do build de produção!**

```bash
# Editar: android/app/src/main/AndroidManifest.xml
# Linha 17: Substituir YOUR_GOOGLE_MAPS_API_KEY_HERE pela sua chave
```

Como obter a chave:
1. https://console.cloud.google.com/
2. Criar projeto → Habilitar "Maps SDK for Android"
3. APIs & Services → Credentials → Create API Key
4. Copiar e colar no AndroidManifest.xml

## 🔑 Passo 2: Gerar Keystore de Produção

```bash
cd android/app

# Gerar keystore (GUARDE A SENHA COM SEGURANÇA!)
keytool -genkeypair -v -storetype PKCS12 \
  -keystore etanol-release.keystore \
  -alias etanol-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Dados que serão solicitados:
# - Senha do keystore (min 6 caracteres)
# - Nome completo
# - Unidade organizacional
# - Organização
# - Cidade
# - Estado
# - Código do país (BR)
```

**⚠️ IMPORTANTE:**
- Guarde a senha em local seguro (ex: gerenciador de senhas)
- Faça backup do arquivo `etanol-release.keystore`
- Se perder, não conseguirá atualizar o app na Play Store!

## ⚙️ Passo 3: Configurar Signing

Criar/editar `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=etanol-release.keystore
MYAPP_RELEASE_KEY_ALIAS=etanol-key
MYAPP_RELEASE_STORE_PASSWORD=sua_senha_aqui
MYAPP_RELEASE_KEY_PASSWORD=sua_senha_aqui
```

Editar `android/app/build.gradle`:

```gradle
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
}

buildTypes {
    debug {
        signingConfig signingConfigs.debug
    }
    release {
        signingConfig signingConfigs.release  // <-- ADICIONAR ESTA LINHA
        minifyEnabled enableProguardInReleaseBuilds
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

## 📦 Passo 4: Gerar AAB para Play Store

```bash
cd android

# Limpar builds anteriores
./gradlew clean

# Gerar AAB (recomendado para Play Store)
./gradlew bundleRelease

# OU gerar APK (para testes locais)
./gradlew assembleRelease
```

Arquivos gerados:
- **AAB:** `android/app/build/outputs/bundle/release/app-release.aab`
- **APK:** `android/app/build/outputs/apk/release/app-release.apk`

## 🎨 Passo 5: Preparar Assets da Play Store

### Ícone do App
- [x] Já configurado em `android/app/src/main/res/mipmap-*/`

### Screenshots Necessários (mínimo 2, máximo 8):
- Calculadora em ação
- Mapa de postos
- Detalhes de posto
- Garagem com veículos

Resoluções recomendadas:
- 1080x1920 (vertical) ou
- 1920x1080 (horizontal)

### Feature Graphic (obrigatório):
- Tamanho: 1024 x 500 px
- Formato: PNG ou JPEG
- Sem transparência

### Descrição do App

**Descrição Curta (80 caracteres):**
```
Descubra se vale mais a pena abastecer com etanol ou gasolina
```

**Descrição Longa:**
```
🚗⛽ Etanol ou Gasolina?

O app definitivo para descobrir qual combustível compensa mais no Brasil!

✨ RECURSOS PRINCIPAIS:

📊 Calculadora Inteligente
• Cálculo baseado na regra dos 70%
• Considera o consumo do seu veículo
• Recomendação instantânea

🗺️ Mapa de Postos
• Veja postos próximos no mapa
• Compare preços rapidamente
• Filtre por promoções
• Encontre o melhor preço

⭐ Favoritos
• Marque seus postos preferidos
• Receba alertas de promoções
• Análise de mercado em tempo real

🚙 Garagem
• Cadastre seus veículos
• Registre abastecimentos
• Acompanhe estatísticas
• Veja quanto você economizou

🎮 Gamificação
• Sistema de pontos e níveis
• Desbloqueie conquistas
• Compartilhe suas economias

🎨 Interface Moderna
• Tema claro e escuro
• Design intuitivo
• Animações suaves

Economize combustível de forma inteligente! 💰
```

### Categoria:
- Ferramentas

### Tags:
- combustível
- gasolina
- etanol
- economia
- postos
- preços

## 🏪 Passo 6: Publicar na Play Console

1. Acesse https://play.google.com/console
2. Criar novo app
3. Upload do AAB
4. Preencher formulário da loja:
   - Descrição (usar texto acima)
   - Screenshots (mínimo 2)
   - Feature graphic
   - Ícone do app
   - Categoria
5. Questionário de conteúdo
6. Classificação indicativa
7. Criar release interna/fechada primeiro (teste com usuários)
8. Depois promover para produção

## ✅ Checklist Final

Antes de publicar, verifique:

- [ ] Google Maps API Key configurada
- [ ] Keystore de produção gerado e guardado
- [ ] AAB gerado com sucesso
- [ ] App testado em device real Android
- [ ] Screenshots capturados
- [ ] Feature graphic criado
- [ ] Descrições escritas
- [ ] Política de privacidade criada (se coletar dados)
- [ ] Conta Google Play Console criada ($25 taxa única)

## 🔄 Atualizações Futuras

Para publicar novas versões:

1. Atualizar `versionCode` e `versionName` em `android/app/build.gradle`
2. Gerar novo AAB com `./gradlew bundleRelease`
3. Upload na Play Console
4. Descrever mudanças no changelog

Exemplo:
```gradle
versionCode 2        // incrementar sempre
versionName "1.0.1"  // seguir semantic versioning
```

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs: `adb logcat`
2. Testar APK em device antes do AAB
3. Consultar documentação: https://developer.android.com/studio/publish

---

**Boa sorte com a publicação! 🚀**
