# Instruções para Gerar APK - Etanol-Gasolina

## Opção 1: Build Local com Gradle (Windows/Mac/Linux)

### Pré-requisitos:
- Android SDK instalado (ANDROID_HOME configurado)
- Java 11 ou superior instalado (JAVA_HOME configurado)
- Node.js e pnpm instalados

### Passos:

1. **Configure as variáveis de ambiente:**
```bash
setx ANDROID_HOME "C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk"
setx JAVA_HOME "C:\Program Files\Java\jdk-11"
```

2. **Instale dependências:**
```bash
cd "d:\Solutions\pessoal\etanol-gasolina"
pnpm install
```

3. **Gere o bundle JavaScript:**
```bash
npx react-native bundle --platform android --dev false --entry-file index.tsx --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

4. **Compile o APK Release:**
```bash
cd android
gradlew assembleRelease
```

**Saída esperada:**
```
android/app/build/outputs/apk/release/app-release.apk
```

5. **Teste no emulador/dispositivo:**
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## Opção 2: Build Otimizado com Gradle (Fast Build)

Para um build mais rápido em desenvolvimento:

```bash
cd android
gradlew assembleDebug
```

**Saída:** `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Opção 3: Build via EAS (Recomendado para Play Store)

Para builds na nuvem com integração total ao Play Store:

```bash
npx eas build --platform android --build-profile preview
```

Isso gera um APK otimizado: `app-release.apk`

Para produção (AAB - Android App Bundle):
```bash
npx eas build --platform android --build-profile production
```

---

## Opção 4: Build com Android Studio (GUI)

1. Abra `android/` em Android Studio
2. Selecione **Build > Build Bundle(s)/APK(s) > Build APK**
3. Selecione Release
4. APK será gerado em: `android/app/release/app-release.apk`

---

## Troubleshooting

### ❌ "ANDROID_HOME not set"
**Solução:** Configure a variável em seu sistema
```bash
# Windows
setx ANDROID_HOME "C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk"

# Linux/Mac
export ANDROID_HOME=~/Android/Sdk
```

### ❌ "java: command not found"
**Solução:** Instale Java 11+
- [Download OpenJDK](https://adoptopenjdk.net/)
- Configure JAVA_HOME

### ❌ "Cannot use decorators and decorators-legacy plugin together"
**Solução:** Já foi corrigido em `babel.config.js`

### ❌ Build falha com erro de dependências
**Solução:**
```bash
cd android
gradlew clean
cd ..
pnpm install
```

---

## Próximas Etapas (Play Store)

1. **Teste o APK:**
   - Instale no emulador/dispositivo real
   - Teste todas as funcionalidades

2. **Prepare para Play Store:**
   - Use AAB (Android App Bundle) para melhor otimização
   - Configure assinatura: [signingConfigs](android/app/build.gradle)

3. **Crie conta de desenvolvedor:**
   - [Google Play Console](https://play.google.com/console)
   - Pague taxa única ($25)

4. **Upload para teste interno:**
   - Envie AAB primeiro como teste
   - Convide testadores

5. **Publicação final:**
   - Preencha dados na Play Store
   - Defina categoria, preço, etc.
   - Submeta para análise (1-3 dias)

---

## Status da Compilação

**Última atualização:** 2025-02-01

### Configurações Verificadas:
- ✅ gradlew presente em `android/`
- ✅ ANDROID_HOME configurado: `C:\Users\jr_ac\AppData\Local\Android\Sdk`
- ✅ Java localizado: `C:\Program Files\Common Files\Oracle\Java\javapath\java.exe`
- ✅ Babel corrigido (decorators plugin)
- ✅ bundle.js suportado para compilação

### Pronto para:
- ✅ Build com `gradlew assembleRelease`
- ✅ Build com EAS Cloud
- ✅ Testes em dispositivo real

---

**Para dúvidas sobre Android builds:** Consulte [React Native Android Documentation](https://reactnative.dev/docs/android-build-from-source)

