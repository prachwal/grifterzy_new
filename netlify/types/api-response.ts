/**
 * Standard API response interface for successful operations
 * @template T - Type of the payload data
 */
export interface ApiResponse<T = any> {
  success: true
  payload: T
  message?: string
  timestamp: string
}

/**
 * Standard API response interface for error operations
 */
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, any>
    statusCode: number
  }
  timestamp: string
}

/**
 * Combined response type for API endpoints
 * @template T - Type of the payload data for successful responses
 */
export type StandardApiResponse<T = any> = ApiResponse<T> | ApiErrorResponse
