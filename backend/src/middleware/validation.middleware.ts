import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'

/**
 * Middleware to validate request data using express-validator
 * @param validations Array of validation chains to apply
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)))

    // Check for validation errors
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    // Format validation errors
    const formattedErrors = errors.array({ onlyFirstError: true }).map(err => {
      switch (err.type) {
        case 'field':
          return {
            field: err.path,
            message: err.msg,
            value: err.value,
          };
        case 'alternative':
          return {
            field: 'alternatives',
            message: err.msg,
            nestedErrors: err.nestedErrors.map((nested: any) => nested.path),
          };
        default:
          return {
            field: 'unknown',
            message: err.msg,
          };
      }
    });

    // Return validation errors
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: formattedErrors
    })
  }
}

/**
 * Helper function to create custom error responses
 */
export const createErrorResponse = (
  res: Response,
  status: number,
  message: string,
  details?: any
) => {
  return res.status(status).json({
    status: 'error',
    message,
    details: details || undefined
  })
}

/**
 * Helper function to create success responses
 */
export const createSuccessResponse = (
  res: Response, 
  status: number, 
  message: string, 
  data?: any
) => {
  return res.status(status).json({
    status: 'success',
    message,
    data: data || undefined
  })
}

/**
 * Middleware to validate content type for specific routes
 * @param allowedTypes Array of allowed MIME types
 */
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip validation if no content type (e.g. GET requests)
    if (!req.headers['content-type'] && req.method === 'GET') {
      return next()
    }
    
    const contentType = req.headers['content-type']?.split(';')[0].trim() || ''
    
    if (allowedTypes.includes(contentType)) {
      return next()
    }
    
    return createErrorResponse(
      res,
      415,
      `Unsupported Content-Type. Expected one of: ${allowedTypes.join(', ')}`,
      { provided: contentType }
    )
  }
}

/**
 * Middleware to handle async errors in route handlers
 * @param fn Async route handler function
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
