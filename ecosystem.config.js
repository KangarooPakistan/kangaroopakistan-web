module.exports = {
  apps : [{
    name: "kangroo-app", // Name of the application
    script: "npm", // The script to start the application
    args: "start", // Arguments passed to the script
    watch: true, // Enable watching file changes
    env: {
      NODE_ENV: "development", // Environment variables for development
    },
    env_production: {
      NODE_ENV: "production", // Environment variables for production
    }
  }]
};
