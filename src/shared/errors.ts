export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: unknown

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export const notFound = (resource = 'Resource') =>
  new AppError(404, 'NOT_FOUND', `${resource} was not found.`)

export const unauthorized = (message = 'Authentication is required.') =>
  new AppError(401, 'UNAUTHORIZED', message)

export const forbidden = (message = 'You do not have access to this resource.') =>
  new AppError(403, 'FORBIDDEN', message)

export const conflict = (message: string, details?: unknown) =>
  new AppError(409, 'CONFLICT', message, details)

export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, 'BAD_REQUEST', message, details)
