import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createServiceLogger(serviceName) {
  const logsDir = path.join(__dirname, '..', '..', '..', 'logs', serviceName);
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

  return winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    defaultMeta: { service: serviceName },
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ level, message, timestamp, service, stack, ...meta }) => {
        const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        const prefix = `${timestamp} [${service}] [${level.toUpperCase()}]`;
        return stack ? `${prefix} ${message}${extra}\n${stack}` : `${prefix} ${message}${extra}`;
      })
    ),
    transports: [
      new winston.transports.Console({ format: winston.format.colorize({ all: true }) }),
      new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
      new winston.transports.File({ filename: path.join(logsDir, 'combined.log') }),
    ],
  });
}

const defaultLogger = createServiceLogger('shared');
export default defaultLogger;
