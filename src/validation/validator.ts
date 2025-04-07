/**
 * Utilidad de validación
 * Proporciona funciones para validar datos de entrada
 */
import { ValidationError } from '../errors/app-error';

/**
 * Interfaz para errores de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrorDetail[];
}

/**
 * Interfaz para detalles de error de validación
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

/**
 * Clase base para validadores
 */
export abstract class BaseValidator<T> {
  /**
   * Valida un objeto y devuelve el resultado
   * @param data Datos a validar
   */
  abstract validate(data: T): ValidationResult;
  
  /**
   * Valida un objeto y lanza una excepción si no es válido
   * @param data Datos a validar
   * @throws {ValidationError} Si los datos no son válidos
   */
  validateOrThrow(data: T): T {
    const result = this.validate(data);
    
    if (!result.isValid) {
      throw new ValidationError(
        `Errores de validación: ${result.errors.map(e => `${e.field}: ${e.message}`).join(', ')}`,
        'VALIDATION_ERROR'
      );
    }
    
    return data;
  }
}

/**
 * Utilidades generales de validación
 */
export class ValidationUtils {
  /**
   * Verifica si un valor es nulo o indefinido
   */
  static isNullOrUndefined(value: any): boolean {
    return value === null || value === undefined;
  }
  
  /**
   * Verifica si una cadena está vacía
   */
  static isEmpty(value: string): boolean {
    return !value || value.trim() === '';
  }
  
  /**
   * Verifica si un valor es un correo electrónico válido
   */
  static isEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }
  
  /**
   * Verifica si un valor es una fecha válida
   */
  static isDate(value: any): boolean {
    if (value instanceof Date) return !isNaN(value.getTime());
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
    return false;
  }
  
  /**
   * Verifica si un valor es un número
   */
  static isNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
  }
  
  /**
   * Verifica si un valor es un entero
   */
  static isInteger(value: any): boolean {
    return Number.isInteger(value);
  }
  
  /**
   * Verifica si un valor es un UUID válido
   */
  static isUUID(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }
}
