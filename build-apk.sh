#!/bin/bash
# Script para compilar APK - Etanol-Gasolina
# Usar: ./build-apk.sh [release|debug]

BUILD_TYPE="${1:-release}"

echo "============================================"
echo "Compilando APK - Etanol-Gasolina"
echo "Tipo: $BUILD_TYPE"
echo "============================================"
echo ""

# Verificar variáveis de ambiente
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME não está configurado"
    echo "Configure com: export ANDROID_HOME=~/Android/Sdk"
    exit 1
fi

if [ -z "$JAVA_HOME" ]; then
    echo "⚠️ JAVA_HOME não encontrado, tentando localizar Java..."
    JAVA_BIN=$(which java)
    if [ -z "$JAVA_BIN" ]; then
        echo "❌ Java não encontrado. Instale Java 11+"
        exit 1
    fi
    echo "✓ Java encontrado: $JAVA_BIN"
fi

echo ""
echo "📦 Instalando dependências..."
pnpm install

echo ""
echo "🔨 Gerando bundle JavaScript..."
npx react-native bundle --platform android --dev false --entry-file index.tsx \
    --bundle-output android/app/src/main/assets/index.android.bundle \
    --assets-dest android/app/src/main/res

if [ $? -ne 0 ]; then
    echo "❌ Falha ao gerar bundle"
    exit 1
fi

echo ""
echo "🏗️ Compilando com Gradle..."
cd android

if [ "$BUILD_TYPE" = "release" ]; then
    echo "Compilando Release..."
    chmod +x gradlew
    ./gradlew assembleRelease
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
else
    echo "Compilando Debug..."
    chmod +x gradlew
    ./gradlew assembleDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

if [ $? -ne 0 ]; then
    echo "❌ Falha na compilação"
    cd ..
    exit 1
fi

cd ..

if [ -f "$APK_PATH" ]; then
    echo ""
    echo "✅ APK gerado com sucesso!"
    echo "📁 Localização: $APK_PATH"
    echo "📊 Tamanho: $(du -h "$APK_PATH" | cut -f1)"
else
    echo "❌ APK não encontrado na localização esperada"
    exit 1
fi

echo ""
echo "📝 Próximas etapas:"
echo "   1. Teste no emulador: adb install $APK_PATH"
echo "   2. Teste em dispositivo: adb install $APK_PATH"
echo "   3. Para Play Store, gere AAB em vez de APK"
echo ""
