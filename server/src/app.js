import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './shared/utils/logger.js';
import { requestId } from './shared/middleware/requestId.js';
import { globalLimiter } from './shared/middleware/rateLimiters.js';
import { originCheck } from './shared/middleware/originCheck.js';
import { contentTypeCheck } from './shared/middleware/contentTypeCheck.js';
import { notFound } from './shared/middleware/notFound.js';
import { errorHandler } from './shared/middleware/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', env.TRUST_PROXY);

  app.use(requestId);

  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === '/api/health' || req.url === '/api/ready',
      },
    })
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  const allowedOrigins = env.CLIENT_URL.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '10kb' }));

  app.use('/api', globalLimiter);
  app.use('/api', originCheck);
  app.use('/api', contentTypeCheck);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/ready', (req, res) => {
    res.json({ status: 'ok', ready: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', categoriesRoutes);

  app.use('/api', notFound);
  app.use(errorHandler);

  return app;
};
