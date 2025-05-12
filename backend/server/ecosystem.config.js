module.exports = {
  apps: [{
    name: 'alfanio-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: 'logs/error.log',
    out_file: 'logs/output.log',
    log_file: 'logs/combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    exp_backoff_restart_delay: 100,
    
    // Monitoring
    monitoring: true,
    instance_var: 'INSTANCE_ID',
    
    // Deployment
    deploy: {
      production: {
        user: 'node',
        host: ['your-production-host'],
        ref: 'origin/main',
        repo: 'your-git-repository',
        path: '/var/www/alfanio-api',
        'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
      }
    }
  }]
};
