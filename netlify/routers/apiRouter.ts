import { Router } from 'express'
import express from 'express'
import { Context } from '@netlify/functions'
import { createSuccessResponse, createErrorResponse } from '../types/response-helpers.js'

// Augment Express's Request type to include requestId and netlifyContext
declare global {
    namespace Express {
        interface Request {
            requestId?: string;
            netlifyContext?: Context;
        }
    }
}

const apiRouter = Router()

// Middleware do zapewnienia requestId (jeśli nie został wcześniej ustawiony)
apiRouter.use((req, res, next) => {
    if (!req.requestId) {
        req.requestId = Math.random().toString(36).substring(7);
    }
    next();
});

// Root endpoint - przekierowanie do health
apiRouter.get('/', (req, res) => {
    console.log(`[${req.requestId}] 🔄 Root endpoint accessed`)

    const payload = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'netlify-lambda-express',
        endpoints: [
            'POST /api/validate-token',
            'GET /api/validate-token',
            'POST /api/test-json',
            'GET /api/hello',
            'GET /api/health',
            'GET /api/'
        ]
    }

    res.json(createSuccessResponse(payload, 'API Lambda Express is running'))
})

// Health check endpoint - obsługuje zarówno /health jak i /health/
apiRouter.get(['/health', '/health/'], (req, res) => {
    console.log(`[${req.requestId}] 🏥 Health check requested`)

    const payload = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'netlify-lambda-express',
        requestId: req.requestId
    }

    res.json(createSuccessResponse(payload, 'API Lambda Express is running'))
})

// Hello endpoint - obsługuje zarówno /hello jak i /hello/
apiRouter.get(['/hello', '/hello/'], (req, res) => {
    console.log(`[${req.requestId}] 👋 Hello endpoint requested`)

    const payload = {
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        userAgent: req.get('User-Agent')
    }

    res.json(createSuccessResponse(payload, 'Hello from Netlify Lambda Express!'))
})

// Test JSON endpoint - POST do testowania konwersji body
apiRouter.post(['/test-json', '/test-json/'], (req, res) => {
    console.log(`[${req.requestId}] 🧪 JSON Test endpoint (POST) requested`)

    // Logowanie szczegółów body dla debugowania
    console.log(`[${req.requestId}] Body details:`, {
        bodyType: typeof req.body,
        bodyContent: req.body,
        contentType: req.headers['content-type'],
        bodyKeys: req.body && typeof req.body === 'object' ? Object.keys(req.body) : 'N/A'
    });

    const payload = {
        receivedBody: req.body,
        bodyType: typeof req.body,
        contentType: req.headers['content-type'],
        bodySize: JSON.stringify(req.body || {}).length,
        parsedSuccessfully: req.body !== undefined,
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        testResults: {
            hasBody: !!req.body,
            isObject: typeof req.body === 'object',
            isString: typeof req.body === 'string',
            jsonParseWorked: true
        }
    }

    res.json(createSuccessResponse(payload, 'JSON Test completed successfully'))
})

// Validate token endpoints - obsługuje zarówno /validate-token jak i /validate-token/
apiRouter.get(['/validate-token', '/validate-token/'], (req, res) => {
    console.log(`[${req.requestId}] 🔐 Token validation (GET) requested`)

    const token = req.query.token as string || req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
        const errorResponse = createErrorResponse(
            'MISSING_TOKEN',
            'Token is required as query parameter or Authorization header',
            400,
            {
                examples: {
                    query: '?token=your_token_here',
                    header: 'Authorization: Bearer your_token_here'
                }
            }
        )
        return res.status(400).json(errorResponse)
    }

    // Podstawowa walidacja tokenu (można rozszerzyć)
    const isValidFormat = typeof token === 'string' && token.length > 0

    const payload = {
        tokenPrefix: token.substring(0, 10) + '...',
        valid: isValidFormat,
        method: 'GET',
        timestamp: new Date().toISOString(),
        requestId: req.requestId
    }

    res.json(createSuccessResponse(payload, 'Token validation completed (GET)'))
})

apiRouter.post(['/validate-token', '/validate-token/'], (req, res) => {
    // @ts-ignore - Ignorujemy błąd typu dla req.body, ponieważ Express.json() to obsłuży
    console.log(`[${req.requestId}] 🔐 Token validation (POST) requested`)

    const { token } = req.body
    const headerToken = req.headers.authorization?.replace('Bearer ', '')
    const finalToken = token || headerToken

    if (!finalToken) {
        const errorResponse = createErrorResponse(
            'MISSING_TOKEN',
            'Token is required in request body or Authorization header',
            400,
            {
                examples: {
                    body: '{"token": "your_token_here"}',
                    header: 'Authorization: Bearer your_token_here'
                }
            }
        )
        return res.status(400).json(errorResponse)
    }

    // Podstawowa walidacja tokenu (można rozszerzyć)
    const isValidFormat = typeof finalToken === 'string' && finalToken.length > 0

    const payload = {
        tokenPrefix: finalToken.substring(0, 10) + '...',
        valid: isValidFormat,
        method: 'POST',
        timestamp: new Date().toISOString(),
        requestId: req.requestId
    }

    res.json(createSuccessResponse(payload, 'Token validation completed (POST)'))
})

// Error handling middleware dla routera
apiRouter.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const requestId = req.requestId || 'unknown';
    console.error(`[${requestId}] 💥 API Router error:`, {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        originalUrl: req.originalUrl
    });

    const errorResponse = createErrorResponse(
        'INTERNAL_ERROR',
        'An internal server error occurred',
        500,
        {
            originalError: error.message,
            timestamp: new Date().toISOString(),
            requestId: requestId
        }
    );

    res.status(500).json(errorResponse);
});

export default apiRouter
