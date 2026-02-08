#!/bin/bash
# QUICK START - Etanol vs Gasolina v1.0.0
# Executar este script para começar desenvolvimento local

echo "🚀 Etanol vs Gasolina - Quick Start"
echo "===================================="
echo ""

# Verificar pnpm instalado
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm não encontrado"
    echo "Instale com: npm install -g pnpm"
    exit 1
fi

echo "✓ pnpm encontrado"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
pnpm install
if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi
echo "✓ Dependências instaladas"
echo ""

# Menu de opções
echo "🎯 Escolha uma opção:"
echo "1) Iniciar dev server web"
echo "2) Build para Android"
echo "3) Testes automatizados"
echo "4) Lint/validação"
echo "5) Listar todos scripts"
echo ""
read -p "Opção (1-5): " option

case $option in
    1)
        echo "🌐 Iniciando dev server web..."
        echo "Acesse: http://localhost:8081"
        pnpm web
        ;;
    2)
        echo "📱 Construindo para Android..."
        pnpm android
        ;;
    3)
        echo "🧪 Executando testes..."
        pnpm test
        ;;
    4)
        echo "✔️  Validando código..."
        pnpm lint
        ;;
    5)
        echo "📋 Scripts disponíveis:"
        pnpm run --list 2>/dev/null | grep -v "^npm"
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "✅ Concluído!"
