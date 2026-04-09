module.exports = {
  apps: [
    {
      name: 'soto16',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 0.0.0.0',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
	  port: 3001,
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_SERVER_URL: 'https://absensisscasn.lamongankab.go.id',
		PORT: 3001,
      },
      env_development: {
        NODE_ENV: 'development',
		PORT: 3001,
      },
      env_staging: {
        NODE_ENV: 'production',
		PORT: 3001,
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
