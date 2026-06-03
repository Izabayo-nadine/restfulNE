import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FEMS API - Fire Extinguisher Management System',
      version: '1.0.0',
      description:
        'RESTful microservices API for TZW LTD Fire Extinguisher Management. Services: User/Auth, Extinguishers, Inspections, Maintenance, Reports, Notifications.',
      contact: { name: 'TZW LTD', email: 'support@tzw-ltd.com' },
    },
    servers: [{ url: 'http://localhost:5000/api/v1', description: 'Development' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'inspector', 'user'] },
          },
        },
        FireExtinguisher: {
          type: 'object',
          required: ['serialNumber', 'location', 'type', 'size', 'installationDate', 'expiryDate'],
          properties: {
            serialNumber: { type: 'string' },
            location: { type: 'string' },
            type: { type: 'string', enum: ['Water', 'CO₂', 'Foam', 'Dry Chemical'] },
            size: { type: 'string', enum: ['1.5 lb', '5 lb', '9 lb', '12 lb'] },
            installationDate: { type: 'string', format: 'date' },
            expiryDate: { type: 'string', format: 'date' },
            status: { type: 'string' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['firstName', 'lastName', 'email', 'password'],
                  properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string', format: 'password' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'User registered' }, 409: { description: 'Duplicate email' } },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'User login',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: { email: { type: 'string' }, password: { type: 'string' } },
                },
              },
            },
          },
          responses: { 200: { description: 'Login successful' } },
        },
      },
      '/auth/profile': {
        get: {
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          summary: 'Get current user profile',
          responses: { 200: { description: 'Profile data' } },
        },
      },
      '/extinguishers': {
        get: {
          tags: ['Fire Extinguishers'],
          security: [{ bearerAuth: [] }],
          summary: 'List all fire extinguishers (paginated)',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'Paginated list' } },
        },
        post: {
          tags: ['Fire Extinguishers'],
          security: [{ bearerAuth: [] }],
          summary: 'Register new fire extinguisher',
          responses: { 201: { description: 'Created' } },
        },
      },
      '/inspections': {
        get: { tags: ['Inspections'], security: [{ bearerAuth: [] }], summary: 'List inspections' },
        post: { tags: ['Inspections'], security: [{ bearerAuth: [] }], summary: 'Schedule inspection' },
      },
      '/reports/inventory': {
        get: {
          tags: ['Reports'],
          security: [{ bearerAuth: [] }],
          summary: 'Inventory report',
          parameters: [{ name: 'period', in: 'query', schema: { enum: ['daily', 'monthly', 'yearly', 'all'] } }],
        },
      },
      '/reports/export': {
        get: {
          tags: ['Reports'],
          security: [{ bearerAuth: [] }],
          summary: 'Export report as PDF or CSV',
          parameters: [
            { name: 'type', in: 'query', required: true },
            { name: 'format', in: 'query', enum: ['pdf', 'csv'], required: true },
          ],
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
