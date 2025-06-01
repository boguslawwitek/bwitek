module.exports = {
  apps: [
    {
      name: 'bwitek-web',
      script: '../../build-start-web.sh',
      cwd: '/home/user/project-name/apps/web', // absolute path to the web app
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      log_file: '../../logs/web.log',
      merge_logs: true,
      time: true,
    }
  ]
};
