/* eslint-disable no-console */
import { env } from '../../config/env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: unknown;
}

/**
 * Production-ready, lightweight structured JSON stdout logger.
 */
export class StructuredLogger {
  private static formatLog(level: LogLevel, message: string, meta?: unknown): string {
    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (meta !== undefined) {
      payload.meta = meta instanceof Error ? { name: meta.name, message: meta.message, stack: meta.stack } : meta;
    }

    // In production, enforce structured JSON format. In dev/test, use clean readable outputs.
    if (env.NODE_ENV === 'production') {
      return JSON.stringify(payload);
    } else {
      const metaString = meta ? ` | Meta: ${JSON.stringify(payload.meta)}` : '';
      const colorMap = {
        info: '\x1b[32mINFO\x1b[0m',  // Green
        warn: '\x1b[33mWARN\x1b[0m',  // Yellow
        error: '\x1b[31mERROR\x1b[0m',// Red
        debug: '\x1b[36mDEBUG\x1b[0m',// Cyan
      };
      return `[${payload.timestamp}] [${colorMap[level]}]: ${message}${metaString}`;
    }
  }

  public static info(message: string, meta?: unknown): void {
    console.log(this.formatLog('info', message, meta));
  }

  public static warn(message: string, meta?: unknown): void {
    console.warn(this.formatLog('warn', message, meta));
  }

  public static error(message: string, meta?: unknown): void {
    console.error(this.formatLog('error', message, meta));
  }

  public static debug(message: string, meta?: unknown): void {
    if (env.NODE_ENV === 'development') {
      console.log(this.formatLog('debug', message, meta));
    }
  }
}

export const logger = StructuredLogger;
