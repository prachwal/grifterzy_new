import express from 'express';
import serverless from 'serverless-http';
import { Context } from '@netlify/functions';
import { createErrorResponse } from '../types/response-helpers.js';

// Augment Express's Request type to include requestId and netlifyContext
declare global {
    namespace Express {
        interface Request {
            requestId?: string;
            netlifyContext?: Context;
        }
    }
}

/**
 * Express API dla Netlify Functions - Bezpieczna wersja
 * Unika problematycznych routów, które mogą powodować błędy path-to-regexp
 */

// Utwórz instancję Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware do konwersji binary body na string/JSON dla Netlify Functions
app.use((req, res, next) => {
    // Obsługa Buffer body (najczęstszy przypadek w Netlify)
    if (req.body && Buffer.isBuffer(req.body) && req.headers['content-type']?.includes('application/json')) {
        try {
            const bodyString = req.body.toString('utf-8');
            req.body = JSON.parse(bodyString);
            console.log(`[${req.requestId || 'unknown'}] ✅ Buffer body converted to JSON`);
        } catch (error) {
            console.warn(`[${req.requestId || 'unknown'}] ⚠️ Failed to parse Buffer body as JSON:`, error);
        }
    }

    // Obsługa string body w środowisku Netlify
    if (req.body && typeof req.body === 'string' && req.headers['content-type']?.includes('application/json')) {
        try {
            req.body = JSON.parse(req.body);
            console.log(`[${req.requestId || 'unknown'}] ✅ String body converted to JSON`);
        } catch (error) {
            console.warn(`[${req.requestId || 'unknown'}] ⚠️ Failed to parse string body as JSON:`, error);
        }
    }

    // Obsługa base64 encoded body
    if (req.body && typeof req.body === 'string' && req.body.startsWith('data:')) {
        try {
            const base64Data = req.body.split(',')[1];
            const decodedData = Buffer.from(base64Data, 'base64').toString('utf-8');
            req.body = JSON.parse(decodedData);
            console.log(`[${req.requestId || 'unknown'}] ✅ Base64 body converted to JSON`);
        } catch (error) {
            console.warn(`[${req.requestId || 'unknown'}] ⚠️ Failed to decode base64 body:`, error);
        }
    }

    next();
});// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Logging middleware
app.use((req, res, next) => {
    const requestId = Math.random().toString(36).substring(7);
    req.requestId = requestId;

    console.log(`[${requestId}] 🚀 ${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        originalUrl: req.originalUrl,
        query: req.query,
        contentType: req.headers['content-type'],
        bodyType: typeof req.body,
        bodyPreview: req.body ? JSON.stringify(req.body).substring(0, 100) + '...' : 'empty',
        timestamp: new Date().toISOString()
    });

    next();
});


// Import routera
import apiRouter from '../routers/apiRouter.js'

// Middleware do normalizacji trailing slash
app.use((req, res, next) => {
    // Usuń trailing slash z ścieżki (oprócz root "/")
    if (req.path !== '/' && req.path.endsWith('/')) {
        const normalizedPath = req.path.slice(0, -1);
        const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
        return res.redirect(301, normalizedPath + queryString);
    }
    next();
});

// Podłącz router pod /api
app.use(['/api', '/.netlify/functions/api'], apiRouter)

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const requestId = req.requestId || 'unknown';
    console.error(`[${requestId}] 💥 Express error:`, {
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

// Export dla Netlify Functions
export const handler = serverless(app, {
    binary: false
});

// Alternatywny export dla kompatybilności
export default handler;
