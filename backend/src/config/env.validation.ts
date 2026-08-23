import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),

  DATABASE_URL: Joi.string().uri().required(),

  JWT_SECRET: Joi.string().min(16).required(),

  FRONTEND_URL: Joi.string().uri().required(),

  EMAIL_USER: Joi.string().required(),
  EMAIL_PASS: Joi.string().required(),

  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .optional(),

  // web-push exige estas claves para arrancar (PushService las valida en su
  // constructor); mejor que el error salga acá, claro, que en medio de un
  // stack trace de instanciación de un provider.
  VAPID_PUBLIC_KEY: Joi.string().required(),
  VAPID_PRIVATE_KEY: Joi.string().required(),
  VAPID_SUBJECT: Joi.string().optional(),
}).unknown(true);
