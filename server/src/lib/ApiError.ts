/**
 * An error we intentionally throw from our own code.
 *
 * Anything thrown that is *not* an ApiError is treated as a bug by the central
 * error handler and reported as a generic 500, so internal details never leak.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: { field: string; message: string }[];

  constructor(
    statusCode: number,
    message: string,
    details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, ApiError);
  }

  static badRequest(message: string, details?: { field: string; message: string }[]) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'You need to be logged in to do that.') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You are not allowed to perform this action.') {
    return new ApiError(403, message);
  }

  static notFound(message = 'The requested resource was not found.') {
    return new ApiError(404, message);
  }

  static conflict(message: string) {
    return new ApiError(409, message);
  }
}