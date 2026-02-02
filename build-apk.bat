@echo off
REM Script para compilar APK - Etanol-Gasolina
REM Executar como: build-apk.bat [release|debug]

setlocal enabledelayedexpansion

set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=release

echo ============================================
echo Compilando APK - Etanol-Gasolina
echo Tipo: %BUILD_TYPE%
echo ============================================
echo.

REM Verificar variáveis de ambiente
if not defined ANDROID_HOME (
    echo ❌ ANDROID_HOME não está configurado
    echo Configure com: setx ANDROID_HOME "C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk"
    pause
    exit /b 1
)

if not defined JAVA_HOME (
    echo ⚠️ JAVA_HOME não encontrado, tentando localizar Java...
    for /f "tokens=*" %%i in ('where java') do set JAVA_BIN=%%i
    if not defined JAVA_BIN (
        echo ❌ Java não encontrado. Instale Java 11+
        pause
        exit /b 1
    )
    echo ✓ Java encontrado: !JAVA_BIN!
)

echo.
echo 📦 Instalando dependências...
call pnpm install

echo.
echo 🔨 Gerando bundle JavaScript...
call npx react-native bundle --platform android --dev false --entry-file index.tsx --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

if errorlevel 1 (
    echo ❌ Falha ao gerar bundle
    pause
    exit /b 1
)

echo.
echo 🏗️ Compilando com Gradle...
cd android

if "%BUILD_TYPE%"=="release" (
    echo Compilando Release...
    call gradlew.bat assembleRelease
    set APK_PATH=app\build\outputs\apk\release\app-release.apk
) else (
    echo Compilando Debug...
    call gradlew.bat assembleDebug
    set APK_PATH=app\build\outputs\apk\debug\app-debug.apk
)

if errorlevel 1 (
    echo ❌ Falha na compilação
    cd ..
    pause
    exit /b 1
)

cd ..

if exist "%APK_PATH%" (
    echo.
    echo ✅ APK gerado com sucesso!
    echo 📁 Localização: %APK_PATH%
    echo 📊 Tamanho:
    for /F %%A in ('powershell -Command "if (Test-Path '%APK_PATH%') { [math]::Round((Get-Item '%APK_PATH%').Length / 1MB, 2) }"') do echo    %%A MB
) else (
    echo ❌ APK não encontrado na localização esperada
    pause
    exit /b 1
)

echo.
echo 📝 Próximas etapas:
echo   1. Teste no emulador: adb install %APK_PATH%
echo   2. Teste em dispositivo: adb install %APK_PATH%
echo   3. Para Play Store, gere AAB em vez de APK
echo.
pause
