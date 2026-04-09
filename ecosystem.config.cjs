// PM2 Ecosystem Config for SI-SOTO
// Usage:
//   Production : pm2 start ecosystem.config.cjs
//   Development: pm2 start ecosystem.config.cjs --env development --only soto16-dev
//   Reload     : pm2 reload ecosystem.config.cjs --only soto16

module.exports = {
  apps: [
    // ─── Production ────────────────────────────────────────────────────────────
    {
      name: "soto16",
      script: "node_modules/.bin/next",
      args: "start -p 3001",
      cwd: "./",
      instances: "max",        // gunakan semua CPU core (cluster mode)
      exec_mode: "cluster",

      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
      },

      // Default env (kalau tidak pakai --env)
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },

      // ── Watch & Reload ────────────────────────────────────────────────────────
      watch: false,
      ignore_watch: [
        "node_modules",
        ".next",
        ".git",
        "logs",
        "*.log",
      ],

      // ── Logging ───────────────────────────────────────────────────────────────
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      out_file: "./logs/pm2-out.log",
      error_file: "./logs/pm2-error.log",
      merge_logs: true,

      // ── Restart Policy ────────────────────────────────────────────────────────
      max_memory_restart: "512M",
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: "10s",

      // ── Graceful Shutdown ────────────────────────────────────────────────────
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },

    // ─── Development ───────────────────────────────────────────────────────────
    {
      name: "soto16-dev",
      script: "node_modules/.bin/next",
      args: "dev -p 3001",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",

      env_development: {
        NODE_ENV: "development",
        PORT: 3001,
      },

      watch: false,

      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      out_file: "./logs/pm2-dev-out.log",
      error_file: "./logs/pm2-dev-error.log",
      merge_logs: true,

      max_memory_restart: "1G",
      autorestart: true,
    },
  ],
};
