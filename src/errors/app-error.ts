/**
 * Error estándar para la aplicación
 * Proporciona una estructura consistente para todos los errores
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorCode: string;
  
  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    
    // Captura la stack trace
    Error.captureStackTrace(this, this.constructor);
    
    // Establece el nombre del error para que coincida con la clase
    this.name = this.constructor.name;
  }
}

/**
 * Errores específicos predefinidos
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado', errorCode: string = 'NOT_FOUND') {
    super(message, 404, errorCode, true);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Error de validación', errorCode: string = 'VALIDATION_ERROR') {
    super(message, 400, errorCode, true);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Error de autenticación', errorCode: string = 'AUTHENTICATION_ERROR') {
    super(message, 401, errorCode, true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'No autorizado', errorCode: string = 'AUTHORIZATION_ERROR') {
    super(message, 403, errorCode, true);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Error de base de datos', errorCode: string = 'DATABASE_ERROR') {
    super(message, 500, errorCode, false);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'Error en servicio externo', errorCode: string = 'EXTERNAL_SERVICE_ERROR') {
    super(message, 502, errorCode, false);
  }
}
