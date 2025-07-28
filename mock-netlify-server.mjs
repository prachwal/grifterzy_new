import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 8888

// Middleware
app.use(cors())
app.use(express.json())

// Logging middleware
app.use((req, res, next) => {
    console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url}`)
    console.log('📋 Headers:', req.headers)
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('📦 Body:', req.body)
    }
    next()
})

// Import funkcji walidacji z Netlify
async function validateJWT(token) {
    try {
        // Split JWT into parts
        const parts = token.split('.')

        // Handle JWE (5 parts) vs JWT (3 parts)
        if (parts.length === 5) {
            // This is a JWE (encrypted token)
            console.log('JWE token detected (encrypted), accepting as valid')
            return {
                sub: 'encrypted-user',
                email: 'encrypted@auth0.com',
                name: 'Encrypted User',
                iss: 'https://dev-4xxb1z18b3z4hc6s.us.auth0.com/',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
            }
        }

        if (parts.length !== 3) {
            throw new Error(`Invalid token format: expected 3 parts, got ${parts.length}`)
        }

        // Decode payload (base64url) for JWT
        const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())

        // Basic validation
        const now = Math.floor(Date.now() / 1000)

        // Check expiration
        if (payload.exp && payload.exp < now) {
            throw new Error('Token expired')
        }

        // Check issued at time (not in future)
        if (payload.iat && payload.iat > now + 60) { // Allow 60s skew
            throw new Error('Token issued in future')
        }

        return payload
    } catch (error) {
        console.error('JWT validation error:', error)
        return null
    }
}

// Route: POST /validate-token
app.post('/.netlify/functions/validate-token', async (req, res) => {
    console.log('🔍 POST /validate-token called')
    try {
        let token = null

        // Try to get token from different sources
        if (req.body && req.body.token) {
            token = req.body.token
        }

        // If not found in body, try Authorization header
        if (!token) {
            const authHeader = req.headers.authorization
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7)
            }
        }

        // If not found, try query parameter
        if (!token) {
            token = req.query.token
        }

        if (!token) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_TOKEN',
                    message: 'Token is required. Provide via POST body, query parameter, or Authorization header',
                    details: {
                        accepted_methods: ['POST body: {"token": "..."}', 'GET query: ?token=...', 'Header: Authorization: Bearer ...'],
                        received_method: req.method
                    },
                    statusCode: 400
                },
                timestamp: new Date().toISOString()
            })
        }

        if (token.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'EMPTY_TOKEN',
                    message: 'Token cannot be empty',
                    details: { token_length: token.length },
                    statusCode: 400
                },
                timestamp: new Date().toISOString()
            })
        }

        // Validate JWT token
        const decodedToken = await validateJWT(token)

        if (!decodedToken) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Token is invalid, expired, or malformed',
                    details: {
                        token_preview: token.substring(0, 20) + '...',
                        token_parts: token.split('.').length
                    },
                    statusCode: 401
                },
                timestamp: new Date().toISOString()
            })
        }

        // Create success payload
        const payload = {
            valid: true,
            userId: decodedToken.sub,
            email: decodedToken.email,
            name: decodedToken.name,
            scope: decodedToken.scope ? decodedToken.scope.split(' ') : undefined,
            iat: decodedToken.iat,
            exp: decodedToken.exp,
            aud: Array.isArray(decodedToken.aud) ? decodedToken.aud[0] : decodedToken.aud,
            iss: decodedToken.iss,
        }

        console.log('✅ Token validation successful')
        res.json({
            success: true,
            message: `Token validated successfully for user: ${decodedToken.email || decodedToken.sub}`,
            payload,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('❌ Token validation error:', error)
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred during token validation',
                details: {
                    originalError: error.message,
                    stack: error.stack,
                    method: req.method,
                    url: req.url
                },
                statusCode: 500
            },
            timestamp: new Date().toISOString()
        })
    }
})

// Route: GET /validate-token
app.get('/.netlify/functions/validate-token', async (req, res) => {
    console.log('🔍 GET /validate-token called')
    // Reuse POST logic by calling it with modified request
    const postReq = {
        ...req,
        method: 'POST',
        body: {}
    }
    return app._router.handle(postReq, res)
})

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        endpoints: [
            'POST /.netlify/functions/validate-token',
            'GET /.netlify/functions/validate-token',
            'GET /health'
        ]
    })
})

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Mock Netlify Functions server running on http://localhost:${PORT}`)
    console.log(`📍 Endpoint: http://localhost:${PORT}/.netlify/functions/validate-token`)
    console.log(`🏥 Health check: http://localhost:${PORT}/health`)
    console.log('📝 Usage:')
    console.log('  POST with JSON body: {"token": "your_jwt_token"}')
    console.log('  GET with query param: ?token=your_jwt_token')
    console.log('  GET/POST with Authorization header: Bearer your_jwt_token')
    console.log('💡 Set VITE_USE_MOCK_SERVER=true in .env to use this server')
})
