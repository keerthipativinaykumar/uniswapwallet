/* eslint-disable no-console */

import { Sentry } from './Sentry'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * Logs a message to console. Additionally sends log to Sentry if using 'error', 'warn', or 'info'.
 * Use `logger.debug` for development only logs.
 *
 * ex. `logger.warn('myFile', 'myFunc', 'Some warning', myArray)`
 *
 * @param fileName Name of file where logging from
 * @param functionName Name of function where logging from
 * @param message Message to log
 * @param args Additional values to log
 */
export const logger = {
  debug: (fileName: string, functionName: string, message: string, ...args: unknown[]): void =>
    logMessage('debug', fileName, functionName, message, ...args),
  info: (fileName: string, functionName: string, message: string, ...args: unknown[]): void =>
    logMessage('info', fileName, functionName, message, ...args),
  warn: (fileName: string, functionName: string, message: string, ...args: unknown[]): void =>
    logMessage('warn', fileName, functionName, message, ...args),
  error: (fileName: string, functionName: string, message: string, ...args: unknown[]): void =>
    logMessage('error', fileName, functionName, message, ...args),
}

function logMessage(
  level: LogLevel,
  fileName: string,
  functionName: string,
  message: string,
  ...args: unknown[] // arbitrary extra data - ideally formatted as key value pairs
): void {
  if (!fileName || !message) {
    console.warn('Invalid log message format, skipping')
    return
  }
  functionName ||= fileName // To allow omitting function when it's same as file
  const formatted = formatMessage(fileName, functionName, message)

  if (__DEV__) {
    console[level](formatted, ...args)
    return
  }

  // Send error, warn, info logs to Sentry
  if (level === 'error') {
    Sentry.captureException(`${fileName}#${functionName}`, message, ...args)
  } else if (level === 'warn') {
    Sentry.captureMessage('warning', `${fileName}#${functionName}`, message, ...args)
  } else if (level === 'info') {
    Sentry.captureMessage('info', `${fileName}#${functionName}`, message, ...args)
  }
}

function formatMessage(fileName: string, functionName: string, message: string): string {
  const t = new Date()
  return `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}:${t.getMilliseconds()}::${fileName}#${functionName}:${message}`
}
