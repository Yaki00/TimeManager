export class AppError extends Error {
  constructor(
    message,
    {
      statusCode = 500,
      code = "INTERNAL_ERROR",
      details,
      cause,
      isOperational = true,
    } = {}
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    if (cause) this.cause = cause;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
