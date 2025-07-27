import { ApiResponse, ApiErrorResponse } from './api-response.js'

/**
 * Creates a standardized success response
 * @template T - Type of the payload data
 * @param payload - The payload data
 * @param message - Optional success message
 * @returns Standardized success response
 */
export function createSuccessResponse<T>(payload: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    payload,
    message,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Creates a standardized error response
 * @param code - Error code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND')
 * @param message - Human-readable error message
 * @param statusCode - HTTP status code
 * @param details - Optional additional error details
 * @returns Standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  statusCode: number,
  details?: Record<string, any>
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      statusCode,
    },
    timestamp: new Date().toISOString(),
  }
}
