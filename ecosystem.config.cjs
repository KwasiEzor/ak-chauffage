/**
 * PM2 Ecosystem Configuration
 * Production process management for AK CHAUFFAGE
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 reload ecosystem.config.cjs --env production
 *   pm2 stop ecosystem.config.cjs
 */

module.exports = {
  apps: [
    {
      name: 'ak-chauffage',
      script: './server/index.cjs',

      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Process management
      instances: 1,  // Number of instances (1 for single server, 'max' for cluster mode)
      exec_mode: 'fork',  // 'fork' or 'cluster'

      // Restart policy
      autorestart: true,
      watch: false,  // Don't watch files in production
      max_memory_restart: '500M',  // Restart if memory exceeds 500MB

      // Logging
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Advanced features
      max_restarts: 10,  // Max restarts within restart_delay
      min_uptime: '10s',  // Min uptime before considered stable
      listen_timeout: 3000,  // Time to wait for app to listen
      kill_timeout: 5000,  // Time to wait before force kill

      // Environment variables file
      env_file: './server/.env',

      // Cron restart (optional - restart every day at 3 AM)
      cron_restart: '0 3 * * *',

      // Source maps support
      source_map_support: true,

      // Graceful shutdown
      wait_ready: false,
      shutdown_with_message: false,
    }
  ],

  deploy: {
    production: {
      user: 'www-data',  // Update with your server user
      host: 'your-server-ip',  // Update with your server IP
      ref: 'origin/main',
      repo: 'git@github.com:your-username/ak-chauffage.git',  // Update with your repo
      path: '/var/www/ak-chauffage',
      'post-deploy': 'npm ci --only=production && npm run build && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': 'mkdir -p /var/www/ak-chauffage/logs',
    }
  }
};
