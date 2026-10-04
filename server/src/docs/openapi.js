import { OpenApiGeneratorV31, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const generateOpenApiSpec = () => {
  const registry = new (import('@asteasolutions/zod-to-openapi')).OpenAPIRegistry();

  registry.registerComponent('securitySchemes', 'cookieAuth', {
    type: 'apiKey',
    in: 'cookie',
    name: 'token',
    description: 'JWT token stored in httpOnly cookie',
  });

  const authUserSchema = registry.register(
    'AuthUser',
    z.object({
      id: z.number().int(),
      name: z.string(),
      email: z.string().email(),
      role: z.enum(['ADMIN', 'USER', 'OWNER']),
      address: z.string(),
      emailVerified: z.boolean(),
    })
  );

  const errorResponseSchema = registry.register(
    'ErrorResponse',
    z.object({
      message: z.string(),
      errors: z
        .array(
          z.object({
            field: z.string().optional(),
            message: z.string(),
          })
        )
        .optional(),
      requestId: z.string().nullable().optional(),
      code: z.string().optional(),
    })
  );

  registry.registerPath({
    method: 'post',
    path: '/api/auth/register',
    tags: ['Auth'],
    summary: 'Register a new normal user account',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              name: z.string().min(20).max(60),
              email: z.string().email(),
              password: z.string().min(8).max(16),
              address: z.string().max(400),
            }),
          },
        },
      },
    },
    responses: {
      201: { description: 'Registration successful', content: { 'application/json': { schema: authUserSchema } } },
      400: { description: 'Validation failed', content: { 'application/json': { schema: errorResponseSchema } } },
      409: { description: 'Email already exists', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/auth/login',
    tags: ['Auth'],
    summary: 'Log in with email and password',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              email: z.string().email(),
              password: z.string(),
            }),
          },
        },
      },
    },
    responses: {
      200: { description: 'Login successful', content: { 'application/json': { schema: authUserSchema } } },
      401: { description: 'Invalid credentials or account locked', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/auth/logout',
    tags: ['Auth'],
    summary: 'Log out current session',
    security: [{ cookieAuth: [] }],
    responses: {
      200: { description: 'Logged out successfully' },
      401: { description: 'Unauthenticated' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/auth/me',
    tags: ['Auth'],
    summary: 'Get current authenticated user info',
    security: [{ cookieAuth: [] }],
    responses: {
      200: {
        description: 'Current user data',
        content: {
          'application/json': {
            schema: authUserSchema.extend({ emailVerificationRequired: z.boolean() }),
          },
        },
      },
      401: { description: 'Unauthenticated' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/profile',
    tags: ['Profile'],
    summary: 'Get profile details',
    security: [{ cookieAuth: [] }],
    responses: {
      200: { description: 'Profile details', content: { 'application/json': { schema: authUserSchema } } },
      401: { description: 'Unauthenticated' },
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/api/profile',
    tags: ['Profile'],
    summary: 'Update profile details (name, email, address)',
    security: [{ cookieAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              name: z.string().min(20).max(60),
              email: z.string().email(),
              address: z.string().max(400),
            }),
          },
        },
      },
    },
    responses: {
      200: { description: 'Profile updated', content: { 'application/json': { schema: authUserSchema } } },
      409: { description: 'Email address already in use', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/api/profile/password',
    tags: ['Profile'],
    summary: 'Change account password',
    security: [{ cookieAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              currentPassword: z.string(),
              newPassword: z.string().min(8).max(16),
            }),
          },
        },
      },
    },
    responses: {
      200: { description: 'Password changed successfully' },
      400: { description: 'Incorrect current password or weak new password', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/categories',
    tags: ['Categories'],
    summary: 'List all store categories',
    security: [{ cookieAuth: [] }],
    responses: {
      200: {
        description: 'Category list',
        content: {
          'application/json': {
            schema: z.array(
              z.object({
                id: z.number().int(),
                name: z.string(),
                slug: z.string(),
              })
            ),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/admin/categories',
    tags: ['Admin'],
    summary: 'Create a new category (ADMIN only)',
    security: [{ cookieAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({ name: z.string().min(2).max(50) }),
          },
        },
      },
    },
    responses: {
      201: { description: 'Category created' },
      403: { description: 'Forbidden' },
      409: { description: 'Duplicate category name' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/admin/stats',
    tags: ['Admin'],
    summary: 'Get platform stats and 14-day rating counts (ADMIN only)',
    security: [{ cookieAuth: [] }],
    responses: {
      200: { description: 'Admin statistics' },
      403: { description: 'Forbidden' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/admin/users',
    tags: ['Admin'],
    summary: 'List users with pagination and filtering (ADMIN only)',
    security: [{ cookieAuth: [] }],
    responses: {
      200: { description: 'Paginated user list' },
      403: { description: 'Forbidden' },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/admin/users',
    tags: ['Admin'],
    summary: 'Create user with explicit role (ADMIN only)',
    security: [{ cookieAuth: [] }],
    responses: {
      201: { description: 'User created' },
      403: { description: 'Forbidden' },
      409: { description: 'Duplicate email' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/admin/stores',
    tags: ['Admin'],
    summary: 'List stores with pagination and filtering (ADMIN only)',
    security: [{ cookieAuth: [] }],
    responses: {
      200: { description: 'Paginated store list' },
      403: { description: 'Forbidden' },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/admin/stores',
    tags: ['Admin'],
    summary: 'Create store with optional owner (ADMIN only)',
    security: [{ cookieAuth: [] }],
    responses: {
      201: { description: 'Store created' },
      403: { description: 'Forbidden' },
      409: { description: 'Duplicate store email or owner already has store' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/stores',
    tags: ['Stores'],
    summary: 'Discover and search stores (USER only)',
    security: [{ cookieAuth: [] }],
    responses: {
      200: { description: 'Paginated store listings' },
      403: { description: 'Forbidden' },
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/api/stores/{id}/rating',
    tags: ['Stores'],
    summary: 'Submit or update rating for a store (USER only)',
    security: [{ cookieAuth: [] }],
    responses: {
      200: { description: 'Rating updated' },
      403: { description: 'Forbidden or Email not verified' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/owner/dashboard',
    tags: ['Owner'],
    summary: 'Get store owner dashboard and raters breakdown (OWNER only)',
    security: [{ cookieAuth: [] }],
    responses: {
      200: { description: 'Owner dashboard metrics' },
      403: { description: 'Forbidden' },
    },
  });

  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'StarShelf API Documentation',
      version: '1.0.0',
      description: 'API specification for StarShelf store rating platform',
    },
    servers: [{ url: '/' }],
  });
};
