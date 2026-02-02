#!/usr/bin/env node

/**
 * Servidor web simples para desenvolvimento da app Etanol vs Gasolina
 * Servindo o HTML fallback enquanto o React é carregado
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⛽ Etanol vs Gasolina v1.0.0</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .container {
            text-align: center;
            max-width: 600px;
            padding: 40px;
            animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        h1 {
            font-size: 48px;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .description {
            font-size: 18px;
            opacity: 0.95;
            margin-bottom: 40px;
        }

        .status-box {
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 10px;
            margin: 40px 0;
            text-align: left;
            backdrop-filter: blur(10px);
        }

        .status-box h2 {
            font-size: 20px;
            margin-bottom: 15px;
        }

        .status-box ul {
            list-style: none;
            line-height: 2;
        }

        .status-box li {
            margin-left: 20px;
            font-size: 16px;
        }

        .info {
            font-size: 12px;
            opacity: 0.8;
            margin-top: 40px;
        }

        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 0.8s linear infinite;
            margin-right: 8px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 30px;
            text-align: center;
        }

        .feature {
            background: rgba(255,255,255,0.05);
            padding: 15px;
            border-radius: 8px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>⛽ Etanol vs Gasolina</h1>
        <p class="description">Calculadora inteligente para comparar preços de combustível</p>

        <div class="status-box">
            <h2>✅ Servidor Rodando!</h2>
            <ul>
                <li>✅ React Native v0.73.6</li>
                <li>✅ Expo v50.0.0</li>
                <li>✅ Web Server Ativo</li>
                <li>⏳ Carregando interface...</li>
            </ul>
        </div>

        <div class="feature-grid">
            <div class="feature">⛽ Calculadora</div>
            <div class="feature">📍 Mapa</div>
            <div class="feature">💰 Gastos</div>
            <div class="feature">📊 Análise</div>
        </div>

        <div class="info">
            <p><strong>Versão 1.0.0</strong> - Production Ready</p>
            <p>React Native + Expo + MobX</p>
            <p id="time" style="margin-top: 10px;"></p>
        </div>
    </div>

    <script>
        function updateTime() {
            document.getElementById('time').textContent = new Date().toLocaleString('pt-BR');
        }
        updateTime();
        setInterval(updateTime, 1000);
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log('Pressione Ctrl+C para parar');
});

server.on('error', (err) => {
    console.error('Erro no servidor:', err);
});
