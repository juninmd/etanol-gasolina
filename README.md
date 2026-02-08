# Etanol ou Gasolina? 🚗⛽

Aplicativo para calcular se vale mais a pena abastecer com etanol ou gasolina no Brasil.

## 📱 Features Implementadas

✅ **Calculadora de Combustível**
- Cálculo baseado na regra dos 70%
- Suporte para consumo personalizado por veículo
- Recomendação inteligente

✅ **Postos de Combustível**
- Visualização em lista e mapa
- Filtro de promoções
- Busca pelo melhor preço
- Histórico de preços

✅ **Favoritos**
- Marcar postos favoritos
- Ver informações detalhadas
- Comentários e avaliações

✅ **Garagem**
- Gerenciar múltiplos veículos
- Registrar abastecimentos
- Estatísticas de consumo
- Histórico de economia

✅ **Gamificação**
- Sistema de pontos
- Badges/conquistas
- Níveis de progresso

✅ **Temas**
- Modo claro/escuro

## 🚀 Setup do Projeto

### Pré-requisitos
- Node.js 14+
- pnpm (ou npm/yarn)
- Android Studio com SDK configurado
- JDK 11

### Instalação

```bash
# Instalar dependências
pnpm install

# Rodar no Android
npm run android

# Rodar versão Web (desenvolvimento)
npm run web

# Build para produção Web
npm run build
```

## 🗺️ Configuração do Google Maps

**IMPORTANTE:** Para o mapa funcionar, você precisa configurar a API Key do Google Maps:

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto e habilite a "Maps SDK for Android"
3. Crie uma API Key
4. Substitua `YOUR_GOOGLE_MAPS_API_KEY_HERE` em `android/app/src/main/AndroidManifest.xml`

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="SUA_CHAVE_AQUI"/>
```

## 📦 Build para Play Store

### 1. Gerar Keystore de Produção

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore etanol-release.keystore -alias etanol-key -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configurar gradle.properties

Criar/editar `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=etanol-release.keystore
MYAPP_RELEASE_KEY_ALIAS=etanol-key
MYAPP_RELEASE_STORE_PASSWORD=sua_senha_aqui
MYAPP_RELEASE_KEY_PASSWORD=sua_senha_aqui
```

### 3. Atualizar build.gradle

Em `android/app/build.gradle`, adicione no bloco `signingConfigs`:

```gradle
release {
    if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
        storeFile file(MYAPP_RELEASE_STORE_FILE)
        storePassword MYAPP_RELEASE_STORE_PASSWORD
        keyAlias MYAPP_RELEASE_KEY_ALIAS
        keyPassword MYAPP_RELEASE_KEY_PASSWORD
    }
}
```

E no bloco `buildTypes`:

```gradle
release {
    signingConfig signingConfigs.release
    minifyEnabled enableProguardInReleaseBuilds
    proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
}
```

### 4. Gerar APK/AAB

```bash
# APK
cd android
./gradlew assembleRelease

# AAB (recomendado para Play Store)
./gradlew bundleRelease
```

O arquivo estará em:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Testes em modo watch
npm test -- --watch

# Coverage
npm test -- --coverage
```

## 🏗️ Arquitetura

- **State Management:** MobX 5
- **Navigation:** React Navigation 5
- **UI:** UI Kitten 4 (Eva Design)
- **Maps:** react-native-maps
- **Build:** React Native 0.61 + react-app-rewired (web)

### Stores

- `homeStore` - Lógica da calculadora
- `stationsStore` - Dados de postos, market analysis
- `garageStore` - Veículos e abastecimentos
- `themeStore` - Tema claro/escuro

## ⚠️ Observações Importantes

### Funcionalidades Desabilitadas (requerem backend)

Para manter a estabilidade da versão inicial, as seguintes features estão comentadas:

- ✖️ Atualização de preços em tempo real
- ✖️ Geofencing/check-in automático

Essas features podem ser habilitadas quando um backend for implementado. Veja `src/stores/stations.store.ts`:

```typescript
constructor() {
    // Desabilitado para versão de produção - requer backend
    // this.startRealTimeUpdates();
    // this.startGeofenceSimulation();
}
```

### Dados Mock

Atualmente o app usa dados mock (hardcoded) para demonstração. Para produção, você deve:

1. Implementar um backend/API
2. Integrar com APIs de postos reais
3. Implementar autenticação de usuários
4. Persistir dados localmente (AsyncStorage/Realm)

## 📄 Licença

Privado - Uso pessoal

## 👨‍💻 Desenvolvimento

Para adicionar novas funcionalidades, consulte `.github/copilot-instructions.md` que contém guias detalhados sobre a arquitetura e padrões do projeto.
