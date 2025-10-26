/**
 * Système de logging simple pour remplacer console.log
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLogLevel = process.env.LOG_LEVEL
  ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()]
  : LOG_LEVELS.INFO;

function log(level, message, ...args) {
  if (LOG_LEVELS[level] <= currentLogLevel) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level}: ${message}`, ...args);
  }
}

export const logger = {
  error: (message, ...args) => log("ERROR", message, ...args),
  warn: (message, ...args) => log("WARN", message, ...args),
  info: (message, ...args) => log("INFO", message, ...args),
  debug: (message, ...args) => log("DEBUG", message, ...args),
};
