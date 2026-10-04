import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || 'info';

export const logger = pino({
  level: logLevel,
  redact: {
    paths: [
      'password',
      'newPassword',
      'currentPassword',
      'token',
      'authorization',
      'cookie',
      'req.headers.cookie',
      'req.headers.authorization',
    ],
    remove: true,
  },
});
