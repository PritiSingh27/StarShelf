import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { logger } from './shared/utils/logger.js';
import { requestId } from './shared/middleware/requestId.js';
import { globalLimiter } from './shared/middleware/rateLimiters.js';
import { originCheck } from './shared/middleware/originCheck.js';
import { contentTypeCheck } from './shared/middleware/contentTypeCheck.js';
import { notFound } from './shared/middleware/notFound.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import { generateOpenApiSpec } from './docs/openapi.js';

import authRoutes from './modules/auth/auth.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import storesRoutes from './modules/stores/stores.routes.js';
import ownerRoutes from './modules/owner/owner.routes.js';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', env.TRUST_PROXY);

  app.use(requestId);

  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) =>
          req.url === '/api/health' ||
          req.url === '/api/ready' ||
          req.url.startsWith('/api/docs'),
      },
      customSuccessMessage: (req, res, responseTime) =>
        `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`,
      customErrorMessage: (req, res, err) =>
        `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,
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

  app.get('/api/health', async (req, res) => {
    const startTime = Date.now();
    let dbStatus = 'ok';
    let dbLatencyMs = 0;

    try {
      const { prisma } = await import('./db/prisma.js');
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - startTime;
    } catch {
      dbStatus = 'error';
    }

    const memory = process.memoryUsage();
    res.json({
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      memory: {
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
      },
    });
  });

  app.get('/api/ready', async (req, res) => {
    try {
      const { prisma } = await import('./db/prisma.js');
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', ready: true });
    } catch {
      res.status(503).json({ status: 'error', ready: false });
    }
  });

  if (env.ENABLE_DOCS || env.NODE_ENV === 'development') {
    const openApiDoc = generateOpenApiSpec();
    app.get('/api/docs.json', (req, res) => res.json(openApiDoc));
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));
  }

  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/stores', storesRoutes);
  app.use('/api/owner', ownerRoutes);
  app.use('/api', categoriesRoutes);

  app.use('/api', notFound);
  app.use(errorHandler);

  return app;
};
