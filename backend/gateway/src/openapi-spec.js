/** Complete OpenAPI 3 spec for FEMS API Gateway (all proxied routes). */
export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'FEMS API Gateway — Microservices',
    version: '2.0.0',
    description:
      'Single entry point (port 5000) routing to: Auth (5001), Extinguisher (5002), Inspection (5003), Report (5004), Notification (5005). Click **Authorize** and use `Bearer <token>` after login.',
  },
  servers: [{ url: 'http://localhost:5000/api/v1', description: 'API Gateway' }],
  tags: [
    { name: 'Authentication', description: 'auth-service :5001' },
    { name: 'Fire Extinguishers', description: 'extinguisher-service :5002' },
    { name: 'Inspections', description: 'inspection-service :5003' },
    { name: 'Maintenance', description: 'inspection-service :5003' },
    { name: 'Reports', description: 'report-service :5004' },
    { name: 'Notifications', description: 'notification-service :5005' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          email: { type: 'string', format: 'email', example: 'user@tzw-ltd.com' },
          password: { type: 'string', format: 'password', example: 'User@12345' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'admin@tzw-ltd.com' },
          password: { type: 'string', example: 'Admin@12345' },
        },
      },
      FireExtinguisher: {
        type: 'object',
        properties: {
          serialNumber: { type: 'string', example: 'FE-001-A' },
          location: { type: 'string', example: 'Building A - Lobby' },
          type: { type: 'string', enum: ['Water', 'CO₂', 'Foam', 'Dry Chemical'] },
          size: { type: 'string', enum: ['1.5 lb', '5 lb', '9 lb', '12 lb'] },
          installationDate: { type: 'string', format: 'date' },
          expiryDate: { type: 'string', format: 'date' },
          status: { type: 'string', enum: ['active', 'inactive', 'maintenance', 'expired', 'decommissioned'] },
        },
      },
      ScheduleInspection: {
        type: 'object',
        required: ['fireExtinguisher', 'inspectionDate', 'inspectionTime'],
        properties: {
          fireExtinguisher: { type: 'string', description: 'MongoDB ObjectId' },
          inspectionDate: { type: 'string', format: 'date' },
          inspectionTime: { type: 'string', example: '09:30', description: 'HH:mm 24h' },
          assignedInspector: { type: 'string' },
        },
      },
      LogMaintenance: {
        type: 'object',
        required: ['fireExtinguisher', 'actionTaken', 'maintenanceDate'],
        properties: {
          fireExtinguisher: { type: 'string' },
          actionTaken: { type: 'string', example: 'Pressure check and recharge' },
          maintenanceDate: { type: 'string', format: 'date' },
          issuesIdentified: { type: 'string' },
          notesAndRecommendations: { type: 'string' },
        },
      },
    },
    parameters: {
      page: { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
      limit: { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
      id: { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: { 201: { description: 'User registered with JWT' }, 409: { description: 'Email already exists' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User login (returns JWT)',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: { 200: { description: 'Login successful' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout (invalidate token client-side)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Logged out' } },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Request password reset',
        security: [],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } } },
            },
          },
        },
        responses: { 200: { description: 'Reset email sent if account exists' } },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset password with token',
        security: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { token: { type: 'string' }, newPassword: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Password reset' } },
      },
    },
    '/auth/profile': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Profile data' } },
      },
      patch: {
        tags: ['Authentication'],
        summary: 'Update profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Updated' } },
      },
    },
    '/auth/change-password': {
      patch: {
        tags: ['Authentication'],
        summary: 'Change password',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Password changed' } },
      },
    },
    '/auth/users': {
      get: {
        tags: ['Authentication'],
        summary: 'List users (admin, paginated)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/limit' },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['admin', 'inspector', 'user'] } },
        ],
        responses: { 200: { description: 'Paginated users' } },
      },
      post: {
        tags: ['Authentication'],
        summary: 'Register inspector (admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: { 201: { description: 'Inspector created' }, 409: { description: 'Email exists' } },
      },
    },
    '/auth/users/{id}': {
      patch: {
        tags: ['Authentication'],
        summary: 'Update user role / status (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/id' }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['admin', 'inspector', 'user'] },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'User updated' } },
      },
    },
    '/extinguishers': {
      get: {
        tags: ['Fire Extinguishers'],
        summary: 'List all fire extinguishers (paginated)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/limit' },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Paginated list' } },
      },
      post: {
        tags: ['Fire Extinguishers'],
        summary: 'Register new fire extinguisher (admin/inspector)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/FireExtinguisher' } } },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/extinguishers/{id}': {
      get: {
        tags: ['Fire Extinguishers'],
        summary: 'Get extinguisher by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/id' }],
        responses: { 200: { description: 'Details' }, 404: { description: 'Not found' } },
      },
      patch: {
        tags: ['Fire Extinguishers'],
        summary: 'Update extinguisher (admin/inspector)',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/id' }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/FireExtinguisher' } } },
        },
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Fire Extinguishers'],
        summary: 'Delete extinguisher (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/id' }],
        responses: { 200: { description: 'Deleted' } },
      },
    },
    '/inspections': {
      get: {
        tags: ['Inspections'],
        summary: 'List inspections (paginated)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/limit' },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Paginated list' } },
      },
      post: {
        tags: ['Inspections'],
        summary: 'Schedule inspection (notifies inspectors)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ScheduleInspection' } } },
        },
        responses: { 201: { description: 'Scheduled' } },
      },
    },
    '/inspections/{id}': {
      get: {
        tags: ['Inspections'],
        summary: 'Get inspection by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/id' }],
        responses: { 200: { description: 'Details' } },
      },
    },
    '/inspections/{id}/complete': {
      patch: {
        tags: ['Inspections'],
        summary: 'Complete inspection (inspector/admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/id' }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['result'],
                properties: { result: { type: 'string' }, notes: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Completed' } },
      },
    },
    '/maintenance': {
      get: {
        tags: ['Maintenance'],
        summary: 'List maintenance records (paginated)',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/page' }, { $ref: '#/components/parameters/limit' }],
        responses: { 200: { description: 'Paginated list' } },
      },
      post: {
        tags: ['Maintenance'],
        summary: 'Log maintenance (inspector/admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LogMaintenance' } } },
        },
        responses: { 201: { description: 'Logged' } },
      },
    },
    '/maintenance/{id}': {
      get: {
        tags: ['Maintenance'],
        summary: 'Get maintenance record by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/id' }],
        responses: { 200: { description: 'Details' } },
      },
    },
    '/reports/inventory': {
      get: {
        tags: ['Reports'],
        summary: 'Inventory report',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'period',
            in: 'query',
            schema: { type: 'string', enum: ['daily', 'monthly', 'yearly', 'all'], default: 'all' },
          },
        ],
        responses: { 200: { description: 'Inventory stats' } },
      },
    },
    '/reports/inspections': {
      get: {
        tags: ['Reports'],
        summary: 'Inspection report (pending/completed/overdue)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Inspection stats' } },
      },
    },
    '/reports/compliance': {
      get: {
        tags: ['Reports'],
        summary: 'Compliance report (expired/upcoming)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Compliance data' } },
      },
    },
    '/reports/maintenance': {
      get: {
        tags: ['Reports'],
        summary: 'Maintenance report',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/page' }, { $ref: '#/components/parameters/limit' }],
        responses: { 200: { description: 'Maintenance history' } },
      },
    },
    '/reports/export': {
      get: {
        tags: ['Reports'],
        summary: 'Export report as PDF or CSV (admin/inspector)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'type',
            in: 'query',
            required: true,
            schema: { type: 'string', enum: ['inventory', 'inspection', 'compliance', 'maintenance'] },
          },
          { name: 'format', in: 'query', required: true, schema: { type: 'string', enum: ['pdf', 'csv'] } },
        ],
        responses: { 200: { description: 'File download' } },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List my notifications (paginated)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/limit' },
          { name: 'unread', in: 'query', schema: { type: 'string', enum: ['true'] } },
        ],
        responses: { 200: { description: 'Paginated notifications' } },
      },
    },
    '/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'All marked read' } },
      },
    },
    '/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark one notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/id' }],
        responses: { 200: { description: 'Marked read' } },
      },
    },
  },
};
