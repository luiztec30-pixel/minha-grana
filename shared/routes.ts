import { z } from 'zod';
import { 
  insertIncomeSchema, 
  insertFixedExpenseSchema, 
  insertVariableExpenseSchema, 
  insertSavingsGoalSchema,
  incomes,
  fixedExpenses,
  variableExpenses,
  savingsGoals,
  settings
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  incomes: {
    list: {
      method: 'GET' as const,
      path: '/api/incomes',
      responses: {
        200: z.array(z.custom<typeof incomes.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/incomes',
      input: insertIncomeSchema,
      responses: {
        201: z.custom<typeof incomes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/incomes/:id',
      input: insertIncomeSchema.partial(),
      responses: {
        200: z.custom<typeof incomes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/incomes/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  fixedExpenses: {
    list: {
      method: 'GET' as const,
      path: '/api/fixed-expenses',
      responses: {
        200: z.array(z.custom<typeof fixedExpenses.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/fixed-expenses',
      input: insertFixedExpenseSchema,
      responses: {
        201: z.custom<typeof fixedExpenses.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/fixed-expenses/:id',
      input: insertFixedExpenseSchema.partial(),
      responses: {
        200: z.custom<typeof fixedExpenses.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/fixed-expenses/:id',
      responses: {
        204: z.void(),
      },
    },
    clone: {
      method: 'POST' as const,
      path: '/api/fixed-expenses/clone',
      input: z.object({
        fromMonth: z.string(),
        toMonth: z.string(),
      }),
      responses: {
        201: z.object({ count: z.number() }),
        400: errorSchemas.validation,
      },
    },
  },
  variableExpenses: {
    list: {
      method: 'GET' as const,
      path: '/api/variable-expenses',
      responses: {
        200: z.array(z.custom<typeof variableExpenses.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/variable-expenses',
      input: insertVariableExpenseSchema,
      responses: {
        201: z.custom<typeof variableExpenses.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/variable-expenses/:id',
      input: insertVariableExpenseSchema.partial(),
      responses: {
        200: z.custom<typeof variableExpenses.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/variable-expenses/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  savingsGoals: {
    list: {
      method: 'GET' as const,
      path: '/api/savings-goals',
      responses: {
        200: z.array(z.custom<typeof savingsGoals.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/savings-goals',
      input: insertSavingsGoalSchema,
      responses: {
        201: z.custom<typeof savingsGoals.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/savings-goals/:id',
      input: insertSavingsGoalSchema.partial(),
      responses: {
        200: z.custom<typeof savingsGoals.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings/:key',
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/settings/:key',
      input: z.object({ value: z.any() }),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
