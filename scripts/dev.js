import { createServer } from 'vite';
import { spawn } from 'child_process';
import express from 'express';

async function startDev() {
  // Start backend server
  const backend = spawn('node', ['server/server.js'], {
    stdio: 'inherit'
  });

  // Create Vite dev server
  const vite = await createServer({
    configFile: './vite.config.js',
    server: {
      port: 5001
    }
  });

  await vite.listen();

  process.on('SIGINT', () => {
    backend.kill();
    vite.close();
    process.exit();
  });
}

startDev();