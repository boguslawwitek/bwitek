module.exports = {
  apps: [
    {
      name: "bwitek-server",
      script: "bun",
      args: "run start",
      cwd: "./apps/server",
      interpreter: "none",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        SERVER_PORT: 7770,
      },
    },
    {
      name: "bwitek-web",
      script: "bun",
      args: "run start",
      cwd: "./apps/web",
      interpreter: "none",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 7771,
      },
    },
  ],
};
