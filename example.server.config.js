module.exports = {
    apps: [
      {
        name: 'bwitek-server',
        script: '../../build-start-server.sh',
        cwd: '/home/user/project-name/apps/server', // absolute path to the server app
        exec_mode: 'fork',
        instances: 1,
        autorestart: true,
        log_file: '../../logs/server.log',
        merge_logs: true,
        time: true,
      }
    ]
  };
  