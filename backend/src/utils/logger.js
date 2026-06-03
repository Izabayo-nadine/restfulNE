import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
      const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return stack
        ? `${timestamp} [${level.toUpperCase()}] ${message}${extra}\n${stack}`
        : `${timestamp} [${level.toUpperCase()}] ${message}${extra}`;
    })
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.colorize({ all: true }) }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;
