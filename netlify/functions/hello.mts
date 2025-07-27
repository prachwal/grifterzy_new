import { Context } from '@netlify/functions'
import { createSuccessResponse, createErrorResponse } from '../types/response-helpers.js'

/**
 * Hello function payload interface
 */
interface HelloPayload {
  greeting: string
  subject: string
}

export default (request: Request, context: Context) => {
  try {
    const url = new URL(request.url)
    const subject = url.searchParams.get('name')

    // Validation
    if (subject && subject.trim().length === 0) {
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        'Name parameter cannot be empty',
        400,
        { parameter: 'name', received: subject }
      )
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const finalSubject = subject || 'World'
    const payload: HelloPayload = {
      greeting: `Hello ${finalSubject}`,
      subject: finalSubject,
    }

    const successResponse = createSuccessResponse(payload, 'Greeting generated successfully')

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const errorResponse = createErrorResponse(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred',
      500,
      {
        originalError: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }
    )

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
