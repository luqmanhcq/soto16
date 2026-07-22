module.exports = {
  apps: [
    {
      name: 'soto16',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      // __dirname = direktori tempat file ini berada (selalu benar, tanpa path hardcode)
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
      restart_delay: 3000,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOSTNAME: '0.0.0.0',
        NEXTAUTH_URL: 'http://soto.lokermegilan.my.id',
        NEXT_PUBLIC_SERVER_URL: 'http://soto.lokermegilan.my.id',
        NEXT_PUBLIC_APP_URL: 'http://soto.lokermegilan.my.id',
        NEXT_PUBLIC_API_URL: 'https://absensisscasn.lamongankab.go.id',
        DATABASE_URL: 'postgresql://postgres:1453@localhost:5432/sisoto',
        JWT_SECRET: 'ganti-dengan-secret-yang-kuat-dan-panjang-minimal-32-karakter',
        // SSO Integration with SiMEGILAN
        SIMEGILAN_DATABASE_URL: 'postgresql://postgres:1453@localhost:5432/simegilan',
        SSO_BASE_URL: 'https://simegilan.lamongankab.go.id',
        NEXT_PUBLIC_SSO_BASE_URL: 'https://simegilan.lamongankab.go.id',
        // SSO Role Mapping (comma-separated NIPs for initial admin provisioning)
        SSO_ADMIN_NIPS: '',
        SSO_SUPER_ADMIN_NIPS: '1993102920220310002',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
}
