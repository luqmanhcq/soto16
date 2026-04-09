// PM2 Ecosystem Config for SI-SOTO
// Usage:
//   Production : pm2 start ecosystem.config.js
//   Development: pm2 start ecosystem.config.js --env development
//   Staging    : pm2 start ecosystem.config.js --env staging

module.exports = {
  apps: [
    // ─── Production ────────────────────────────────────────────────────────────
    {
      name: "soto16",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "./",
      instances: "max",        // gunakan semua CPU core (cluster mode)
      exec_mode: "cluster",
      port: 3001,

      // Environment variables untuk production
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },

      // Environment variables override (pm2 start ... --env production)
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
      },

      // ── Watch & Reload ────────────────────────────────────────────────────────
      watch: false,             // nonaktif di production; aktifkan hanya di dev
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
      restart_delay: 3000,      // tunggu 3 detik sebelum restart
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
      args: "dev",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",        // fork mode untuk dev (hot-reload)
      port: 3001,

      env_development: {
        NODE_ENV: "development",
        PORT: 3001,
      },

      watch: false,             // Next.js dev sudah punya HMR bawaan
      ignore_watch: ["node_modules", ".next", ".git"],

      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      out_file: "./logs/pm2-dev-out.log",
      error_file: "./logs/pm2-dev-error.log",
      merge_logs: true,

      max_memory_restart: "1G",
      autorestart: true,
    },
  ],
};
