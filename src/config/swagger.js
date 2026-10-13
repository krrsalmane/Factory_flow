const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FactoryFlow API',
      version: '1.0.0',
      description: 'API documentation for FactoryFlow'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Provide an admin access token.'
        }
      },
      schemas: {
        Material: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665f1a2b3c4d5e6f78901234' },
            reference: { type: 'string', example: 'MAT-001' },
            name: { type: 'string', example: 'Steel sheet' },
            unit: { type: 'string', example: 'kg' },
            quantity: { type: 'number', example: 125 },
            reorderPoint: { type: 'number', example: 20 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        MaterialInput: {
          type: 'object',
          required: ['reference', 'name', 'unit'],
          properties: {
            reference: { type: 'string', example: 'MAT-001' },
            name: { type: 'string', example: 'Steel sheet' },
            unit: { type: 'string', example: 'kg' },
            quantity: { type: 'number', minimum: 0, default: 0, example: 125 },
            reorderPoint: { type: 'number', minimum: 0, default: 0, example: 20 }
          }
        },
        MaterialUpdate: {
          type: 'object',
          minProperties: 1,
          properties: {
            name: { type: 'string', example: 'Stainless steel sheet' },
            unit: { type: 'string', example: 'kg' },
            reorderPoint: { type: 'number', minimum: 0, example: 25 }
          },
          description: 'Only name, unit and reorderPoint can be changed. Stock and reference cannot be changed here.'
        },
        StockEntry: {
          type: 'object',
          required: ['quantity'],
          properties: {
            quantity: { type: 'number', exclusiveMinimum: 0, example: 50 }
          }
        },
        StockMovement: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            material: { type: 'string', example: '665f1a2b3c4d5e6f78901234' },
            type: { type: 'string', enum: ['IN', 'OUT'], example: 'IN' },
            quantity: { type: 'number', example: 50 },
            order: { type: 'string', nullable: true },
            user: { type: 'object', description: 'Populated user name and email' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            product: { oneOf: [{ type: 'string' }, { type: 'object' }] },
            quantity: { type: 'number', example: 10 },
            status: { type: 'string', enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'] },
            composition: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  material: { type: 'string' },
                  quantity: { type: 'number', example: 2 }
                }
              }
            },
            operator: { oneOf: [{ type: 'string' }, { type: 'object' }] },
            createdBy: { oneOf: [{ type: 'string' }, { type: 'object' }] },
            startedAt: { type: 'string', format: 'date-time', nullable: true },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
            canceledAt: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        OrderInput: {
          type: 'object',
          required: ['product', 'quantity', 'operator'],
          properties: {
            product: { type: 'string', example: '665f1a2b3c4d5e6f78901234' },
            quantity: { type: 'number', exclusiveMinimum: 0, example: 10 },
            operator: { type: 'string', example: '665f1a2b3c4d5e6f78901234' }
          }
        },
        OrderStatusUpdate: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELED'] }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'integer', example: 400 },
            error: { type: 'string', example: 'Invalid request' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
