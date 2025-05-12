import { createServer } from 'vite';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import { Router } from 'express';
import logger from '../../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const router = Router();

router.post('/', async (req, res) => {
  try {
    logger.info('Processing brochure request');
    res.json({ success: true, message: 'Brochure request successful' });
  } catch (error) {
    logger.error('Brochure request error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5001;

  // Middleware
  app.use(cors());
  app.use(compression());
  app.use(express.json());

  try {
    if (process.env.NODE_ENV === 'development') {
      // Create Vite server in middleware mode
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });

      // Use vite's connect instance as middleware
      app.use(vite.middlewares);

      // API routes
      const apiRoutes = await import('./index.js');
      app.use('/api', apiRoutes.default);
    } else {
      // Production: serve built files
      app.use(express.static(path.join(__dirname, '../dist')));
      
      // API routes
      const apiRoutes = await import('./index.js');
      app.use('/api', apiRoutes.default);
      
      // Handle client-side routing
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
      });
    }

    app.use('/brochure', router);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);