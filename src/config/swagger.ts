import swaggerJsDoc from 'swagger-jsdoc'
import { env } from './env.js'

const isProd = env.NODE_ENV === 'production'

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: "Url Shortener",
            version: "1.0.0",
            description: "A url shortener"
        },
        servers: [
            {
                url: env.BACKEND_URL || 'http://localhost:3000'
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: "bearer",
                    bearerFormat: "JWT"
                },
            },
        },
    },
    apis: isProd ? ['./dist/**/*.routes.js'] : ['./src/**/*.routes.ts']
}

export const swaggerDocs = swaggerJsDoc(swaggerOptions)