import { createServer } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startServer() {
  try {
    const server = await createServer({
      // Specify the config file
      configFile: resolve(__dirname, 'vite.config.js'),
      root: __dirname,
      server: {
        port: 3000,
        strictPort: true,
        open: true,
      },
    });

    await server.listen();

    server.printUrls();
    console.log('Vite server started successfully!');
  } catch (error) {
    console.error('Error starting Vite server:', error);
    process.exit(1);
  }
}

startServer();
