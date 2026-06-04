/** OpenAPI 3 spec for FEMS API Gateway — paths must match gateway proxies and microservice routes. */
export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'FEMS API Gateway — Microservices',
    version: '2.1.0',
    description:
      'Gateway (port 5000) → Auth :5001, Extinguisher :5002, Inspection :5003, Report :5004, Notification :5005. ' +
      'Use **Authorize** with `Bearer <token>` from `POST /auth/login`. Facility registration uses OTP endpoints.',
  },
  servers: [{ url: 'http://localhost:5000/api/v1', description: 'API Gateway' }],
  tags: [
    { name: 'Configuration', description: 'Public app config (enums, labels, pagination)' },
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
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      RegisterOtpRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName: { type: 'string', example: 'Jane' },
          lastName: { type: 'string', example: 'Facility' },
          email: { type: 'string', format: 'email', example: 'facility@company.com' },
          password: { type: 'string', format: 'password', example: 'User@12345' },
        },
      },
      VerifyOtpRequest: {
        type: 'object',
        required: ['email', 'otp'],
        properties: {
          email: { type: 'string', format: 'email' },
          otp: { type: 'string', minLength: 6, maxLength: 6, example: '123456' },
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
      CreateInspectorRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
        },
      },
      FireExtinguisherInput: {
        type: 'object',
        required: [
          'serialNumber',
          'location',
          'type',
          'size',
          'installationDate',
          'expiryDate',
          'assignedTo',
        ],
        properties: {
          serialNumber: { type: 'string', example: 'FE-001-A' },
          location: { type: 'string', example: 'Building A - Lobby' },
          type: { type: 'string', enum: ['Water', 'CO₂', 'Foam', 'Dry Chemical'] },
          size: { type: 'string', enum: ['1.5 lb', '5 lb', '9 lb', '12 lb'] },
          installationDate: { type: 'string', format: 'date' },
          expiryDate: { type: 'string', format: 'date' },
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'maintenance', 'expired', 'decommissioned'],
            default: 'active',
          },
          assignedTo: {
            type: 'string',
            description: 'MongoDB ObjectId of facility user (company account)',
          },
        },
      },
      ScheduleInspection: {
        type: 'object',
        required: ['fireExtinguisher', 'inspectionDate', 'inspectionTime'],
        properties: {
          fireExtinguisher: { type: 'string', description: 'MongoDB ObjectId' },
          inspectionDate: { type: 'string', format: 'date' },
          inspectionTime: { type: 'string', example: '09:30', description: 'HH:mm 24h' },
          assignedInspector: { type: 'string', description: 'Optional MongoDB ObjectId' },
        },
      },
      CompleteInspection: {
        type: 'object',
        required: ['performedDate', 'result'],
        properties: {
          performedDate: { type: 'string', format: 'date', description: 'Date inspector performed the inspection' },
          result: { type: 'string', example: 'Pass — pressure OK' },
          notes: { type: 'string' },
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
      page: { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1 } },
      limit: { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 } },
      id: { name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-f0-9]{24}$' } },
    },
    responses: {
      Unauthorized: { description: 'Missing or invalid JWT' },
      Forbidden: { description: 'Insufficient role' },
      NotFound: { description: 'Resource not found' },
      ValidationError: { description: 'Validation failed' },
    },
  },
  paths: {
    '/config': {
      get: {
        tags: ['Configuration'],
        summary: 'Public application configuration',
        description: 'Enums, dashboard cards, labels, pagination limits. No authentication required.',
        security: [],
        responses: {
          200: {
            description: 'Config payload',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { properties: { data: { type: 'object' } } },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/auth/register/send-otp': {
      post: {
        tags: ['Authentication'],
        summary: 'Register facility user — send OTP email',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterOtpRequest' } } },
        },
        responses: {
          200: { description: 'OTP sent (dev may return otp in body)' },
          409: { description: 'Email already registered' },
        },
      },
    },
    '/auth/register/verify-otp': {
      post: {
        tags: ['Authentication'],
        summary: 'Register facility user — verify OTP and create account',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyOtpRequest' } } },
        },
        responses: {
          201: { description: 'User created with JWT' },
          400: { description: 'Invalid or expired OTP' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login (returns JWT)',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          200: { description: 'Login successful — copy `data.token` for Authorize' },
          401: { description: 'Invalid credentials' },
          403: { description: 'Account deactivated' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Logged out' } },
      },
    },
    '/auth/forgot-password/send-otp': {
      post: {
        tags: ['Authentication'],
        summary: 'Forgot password — send OTP',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } },
            },
          },
        },
        responses: { 200: { description: 'OTP sent if account exists' } },
      },
    },
    '/auth/forgot-password/reset': {
      post: {
        tags: ['Authentication'],
        summary: 'Forgot password — reset with OTP',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'otp', 'newPassword'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  otp: { type: 'string', minLength: 6, maxLength: 6 },
                  newPassword: { type: 'string', format: 'password' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Password reset' }, 400: { description: 'Invalid OTP' } },
      },
    },
    '/auth/profile': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Profile' }, 401: { $ref: '#/components/responses/Unauthorized' } },
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
                  email: { type: 'string', format: 'email' },
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
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string' },
                },
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
        responses: { 200: { description: 'Paginated users' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
      post: {
        tags: ['Authentication'],
        summary: 'Create inspector account (admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateInspectorRequest' } } },
        },
        responses: { 201: { description: 'Inspector created' }, 409: { description: 'Email exists' } },
      },
    },
    '/auth/users/{id}': {
      patch: {
        tags: ['Authentication'],
        summary: 'Update user active status (admin)',
        description: 'Only `isActive` can be changed. Roles are not editable here.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/id' }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { isActive: { type: 'boolean' } },
              },
            },
          },
        },
        responses: { 200: { description: 'User updated' }, 403: { description: 'Cannot modify admin' } },
      },
      delete: {
        tags: ['Authentication'],
        summary: 'Delete facility company user (admin)',
        description:
          'Only `role: user` (facility company). Cascades: all assigned extinguishers and their inspections are removed.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/id' }],
        responses: {
          200: { description: 'User and related data deleted' },
          400: { description: 'Cannot delete admin/inspector' },
          502: { description: 'Cascade delete failed — user not removed' },
        },
      },
    },
    '/extinguishers': {
      get: {
        tags: ['Fire Extinguishers'],
        summary: 'List fire extinguishers (paginated)',
        description: 'Facility users see only extinguishers assigned to them. Admin/inspector see all.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/limit' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Serial, location, or company email' },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          {
            name: 'assignedTo',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by facility user ObjectId (admin)',
          },
        ],
        responses: { 200: { description: 'Paginated list' } },
      },
      post: {
        tags: ['Fire Extinguishers'],
        summary: 'Register extinguisher (admin)',
        description: 'Must assign to a facility user (`assignedTo`). Stores company snapshot on the record.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/FireExtinguisherInput' } } },
        },
        responses: { 201: { description: 'Created' }, 400: { $ref: '#/components/responses/ValidationError' } },
      },
    },
    '/extinguishers/{id}': {
      get: {
        tags: ['Fire Extinguishers'],
        summary: 'Get extinguisher by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/id' }],
        responses: { 200: { description: 'Details' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
      patch: {
        tags: ['Fire Extinguishers'],
        summary: 'Update extinguisher (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/id' }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/FireExtinguisherInput' } } },
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
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['not_started', 'completed'] },
          },
          { name: 'fireExtinguisher', in: 'query', schema: { type: 'string' }, description: 'Filter by extinguisher id' },
        ],
        responses: { 200: { description: 'Paginated list' } },
      },
      post: {
        tags: ['Inspections'],
        summary: 'Schedule inspection',
        description: 'Creates status `not_started`. Notifies inspectors and admin.',
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
        responses: { 200: { description: 'Details' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },
    '/inspections/{id}/complete': {
      patch: {
        tags: ['Inspections'],
        summary: 'Complete inspection (inspector or admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/id' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CompleteInspection' } } },
        },
        responses: { 200: { description: 'Completed' }, 400: { $ref: '#/components/responses/ValidationError' } },
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
        summary: 'Log maintenance (inspector or admin)',
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
        responses: { 200: { description: 'Details' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },
    '/reports/dashboard': {
      get: {
        tags: ['Reports'],
        summary: 'Role-scoped dashboard stats',
        description: 'MongoDB-backed KPIs and preview lists for admin, inspector, or facility user.',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Dashboard payload' } },
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
        summary: 'Inspection report summary',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Pending, completed, overdue counts and upcoming list' } },
      },
    },
    '/reports/compliance': {
      get: {
        tags: ['Reports'],
        summary: 'Compliance report',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Compliance rate, expired and expiring units' } },
      },
    },
    '/reports/maintenance': {
      get: {
        tags: ['Reports'],
        summary: 'Maintenance report',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/page' }, { $ref: '#/components/parameters/limit' }],
        responses: { 200: { description: 'Maintenance history summary' } },
      },
    },
    '/reports/export': {
      get: {
        tags: ['Reports'],
        summary: 'Export report as PDF or CSV',
        description: 'Admin and inspector only. Returns file bytes.',
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
        responses: {
          200: { description: 'File download', content: { 'application/pdf': {}, 'text/csv': {} } },
          403: { $ref: '#/components/responses/Forbidden' },
        },
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
    '/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Unread notification count',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Count in data' } },
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
