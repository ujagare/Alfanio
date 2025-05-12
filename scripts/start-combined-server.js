import { createServer } from 'vite';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import apiRoutes from '../server/routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5001;

  // Middleware
  app.use(cors());
  app.use(compression());
  app.use(express.json());

  try {
    // API routes (available in both dev and prod)
    app.use('/api', apiRoutes);

    if (process.env.NODE_ENV === 'development') {
      // Create Vite server in middleware mode
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });

      // Use vite's connect instance as middleware
      app.use(vite.middlewares);
    } else {
      // Production: serve built files
      app.use(express.static(path.join(__dirname, '../dist')));
      
      // Handle client-side routing
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
      });
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);