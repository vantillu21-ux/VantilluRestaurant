export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'VANTILLU Multi Cuisine Family Restaurant REST API',
    version: '1.0.0',
    description: 'Production OpenAPI 3.0 Documentation powering Customer Web, POS Mobile, KDS, and Admin CMS',
    contact: {
      name: 'VANTILLU Development Architect',
      email: 'tech@vantillu.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'Authenticate User & Obtain JWT Tokens',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@vantillu.com' },
                  password: { type: 'string', example: 'vantillu123' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Successful login with JWT token pair' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/menu': {
      get: {
        summary: 'Fetch Complete Dynamic Menu Catalog from Supabase',
        tags: ['Menu Catalog'],
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'cuisine', in: 'query', schema: { type: 'string' } },
          { name: 'isVeg', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Dynamic menu list array returned' },
        },
      },
    },
    '/orders': {
      post: {
        summary: 'Place Customer Order (Delivery, Pickup, Dine-In)',
        tags: ['Order Management'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  guestName: { type: 'string', example: 'Sahithi' },
                  guestPhone: { type: 'string', example: '9876543210' },
                  orderType: { type: 'string', example: 'DELIVERY' },
                  paymentMethod: { type: 'string', example: 'COD' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        menuItemId: { type: 'string' },
                        quantity: { type: 'number', example: 2 },
                        portion: { type: 'string', example: 'Full' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Order created successfully with calculated breakdown' },
        },
      },
    },
  },
};
