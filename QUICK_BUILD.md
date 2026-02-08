# Quick Start: Gerar APK em 5 Minutos

## Windows
```bash
cd "d:\Solutions\pessoal\etanol-gasolina"
build-apk.bat release
```

## Linux/Mac
```bash
cd ~/Solutions/pessoal/etanol-gasolina
chmod +x build-apk.sh
./build-apk.sh release
```

---

## ✅ Pré-requisitos (Execute uma única vez)

### Windows
```powershell
# 1. Instalar Android SDK (via Android Studio)
# 2. Configurar variáveis:
setx ANDROID_HOME "C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk"
setx JAVA_HOME "C:\Program Files\Java\jdk-11"

# 3. Feche e reabra o terminal
```

### Linux
```bash
# 1. Instalar Android SDK
# 2. Configurar em ~/.bashrc ou ~/.zshrc
export ANDROID_HOME=~/Android/Sdk
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk
source ~/.bashrc  # ou source ~/.zshrc
```

### macOS
```bash
# Via Homebrew
brew install android-sdk java11

# Ou configurar em ~/.zprofile
export ANDROID_HOME=~/Library/Android/sdk
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
source ~/.zprofile
```

---

## 📦 Resultado Final

**Arquivo gerado:** `android/app/build/outputs/apk/release/app-release.apk`

**Tamanho esperado:** ~50-80 MB

---

## 🧪 Testar APK

```bash
# Conectar dispositivo via USB com debug ativado
# Ou usar emulador Android

# Instalar
adb install android/app/build/outputs/apk/release/app-release.apk

# Ou reinstalar
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

---

## 🚀 Para Play Store

```bash
# Gerar Android App Bundle (AAB) - formato oficial do Play Store
cd android
gradlew bundleRelease
cd ..

# Arquivo gerado: android/app/build/outputs/bundle/release/app-release.aab
```

Envie o arquivo `.aab` para Google Play Console.

---

## 🆘 Problemas Comuns

| Problema | Solução |
|----------|---------|
| `ANDROID_HOME not set` | Execute: `setx ANDROID_HOME "..."` |
| `java: command not found` | Instale Java 11 e configure JAVA_HOME |
| `Gradle sync failed` | Delete `android/.gradle/` e tente novamente |
| `Build timeout` | Use: `gradlew --no-daemon assembleRelease` |
| `Out of memory` | Aumentar heap: `gradle.properties`: `org.gradle.jvmargs=-Xmx4096m` |

---

**Mais detalhes:** Veja [APK_BUILD_INSTRUCTIONS.md](APK_BUILD_INSTRUCTIONS.md)
