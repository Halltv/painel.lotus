// ecosystem.config.js — PM2
// Uso:
//   pm2 start ecosystem.config.js
//   pm2 restart lotus-api
//   pm2 logs lotus-api

export default {
  apps: [
    {
      name: 'lotus-api',
      script: './apps/api/src/main.js',
      cwd: '/root/painel_lotus',       // ← ajuste para o caminho real na VPS
      interpreter: 'node',
      interpreter_args: '--experimental-vm-modules',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',

      // Carrega as variáveis do .env automaticamente
      env_file: './apps/api/.env',

      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },

      // Logs
      out_file: '/var/log/lotus/api-out.log',
      error_file: '/var/log/lotus/api-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
};
