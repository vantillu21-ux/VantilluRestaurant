import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerSpec } from './utils/swagger';
import { errorHandler } from './middleware/error.middleware';

import authRoutes from './modules/auth/auth.routes';
import menuRoutes from './modules/menu/menu.routes';
import orderRoutes from './modules/orders/orders.routes';
import paymentRoutes from './modules/payments/payments.routes';
import kitchenRoutes from './modules/kitchen/kitchen.routes';
import reservationRoutes from './modules/reservations/reservations.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import settingsRoutes from './modules/settings/settings.routes';

const app: Application = express();

// Security & Optimization Middleware
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(compression());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Rate Limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    restaurant: 'VANTILLU Multi Cuisine Family Restaurant',
    timestamp: new Date().toISOString(),
  });
});

// Swagger API Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount REST API Version 1
const apiV1 = express.Router();
apiV1.use('/auth', authRoutes);
apiV1.use('/menu', menuRoutes);
apiV1.use('/orders', orderRoutes);
apiV1.use('/payments', paymentRoutes);
apiV1.use('/kitchen', kitchenRoutes);
apiV1.use('/reservations', reservationRoutes);
apiV1.use('/analytics', analyticsRoutes);
apiV1.use('/settings', settingsRoutes);

app.use('/api/v1', apiV1);

// Global Error Handler
app.use(errorHandler);

export default app;
