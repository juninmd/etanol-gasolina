@echo off
echo Instalando dependências...
call pnpm install
if %ERRORLEVEL% NEQ 0 (
    echo Erro na instalação. Tentando com npm...
    call npm install --legacy-peer-deps
)
echo.
echo Iniciando servidor web...
call pnpm run web
