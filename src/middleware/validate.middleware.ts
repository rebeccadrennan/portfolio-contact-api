import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 * On failure it responds with 422 and a structured errors array.
 */
const validate = (schema: ZodTypeAny): RequestHandler => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.') || 'unknown',
      message: err.message,
    }));

    return res.status(422).json({
      success: false,
      message: 'Please check the form fields.',
      errors,
    });
  }

  // Attach parsed (trimmed) data to req.body
  req.body = result.data;
  return next();
};

export default validate;
