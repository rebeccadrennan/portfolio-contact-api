'use strict';

const env = require('../config/env');
const meta = require('../config/meta');

const openApi = {
  openapi: '3.1.0',
  info: {
    title: 'Portfolio Contact API',
    version: meta.appVersion,
    description: meta.appDescription,
  },
  servers: [
    {
      url: env.isProduction ? 'https://your-api-host.example.com' : `http://localhost:${env.port}`,
      description: env.isProduction ? 'Production' : 'Local development',
    },
  ],
  tags: [
    { name: 'Contact', description: 'Contact form delivery endpoint' },
    { name: 'Health', description: 'Service health and diagnostics' },
    { name: 'Meta', description: 'Operational metadata and API docs' },
  ],
  paths: {
    '/api/contact': {
      post: {
        tags: ['Contact'],
        summary: 'Send a contact form message',
        operationId: 'sendContact',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ContactRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Message delivered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ContactSuccessResponse' },
              },
            },
          },
          422: {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
              },
            },
          },
          429: {
            description: 'Rate limited',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Get service health and runtime metadata',
        operationId: 'getHealth',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/openapi.json': {
      get: {
        tags: ['Meta'],
        summary: 'Fetch OpenAPI document',
        operationId: 'getOpenApiDocument',
        responses: {
          200: {
            description: 'OpenAPI document',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ContactRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'email', 'subject', 'message'],
        properties: {
          name: { type: 'string', maxLength: 100, example: 'Rebecca Drennan' },
          email: { type: 'string', format: 'email', maxLength: 200, example: 'person@example.com' },
          subject: { type: 'string', maxLength: 150, example: 'Job opportunity' },
          message: { type: 'string', minLength: 10, maxLength: 2000, example: 'Hello, I would love to connect.' },
        },
      },
      ContactSuccessResponse: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: { type: 'boolean', const: true },
          message: { type: 'string' },
        },
      },
      ValidationErrorResponse: {
        type: 'object',
        required: ['success', 'message', 'errors'],
        properties: {
          success: { type: 'boolean', const: false },
          message: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              required: ['field', 'message'],
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: { type: 'boolean', const: false },
          message: { type: 'string' },
          requestId: { type: 'string' },
        },
      },
      HealthResponse: {
        type: 'object',
        required: ['status', 'service', 'version', 'environment', 'uptimeSeconds', 'timestamp'],
        properties: {
          status: { type: 'string', const: 'ok' },
          service: { type: 'string' },
          version: { type: 'string' },
          environment: { type: 'string' },
          uptimeSeconds: { type: 'number' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};

module.exports = openApi;
