import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TheGoodCorner API',
      version: '1.0.0',
      description: 'API documentation for TheGoodCorner marketplace',
    },
    servers: [
      { url: 'http://localhost:8080/api', description: 'HTTP (dev via Nginx)' },
      { url: 'https://localhost:4443/api', description: 'HTTPS (dev via Nginx)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [path.join(__dirname, '../routes/*.js'), path.join(__dirname, '../routes/*.ts')],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;