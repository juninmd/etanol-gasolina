const {execSync} = require('child_process');
const path = require('path');

console.log('🚀 Instalando dependências com pnpm...\n');

try {
  execSync('pnpm install', {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
  });

  console.log('\n✅ Dependências instaladas!\n');
  console.log('🌐 Iniciando servidor web...\n');

  execSync('pnpm run web', {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
  });
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}
