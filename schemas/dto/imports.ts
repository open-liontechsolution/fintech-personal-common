/**
 * Import and Data Processing DTOs
 * These interfaces define the data structures for file imports and data processing
 * used across microservices.
 */

/**
 * File Upload DTO - Information about an uploaded file
 */
export interface FileUploadDto {
  fileId: string;
  fileName: string;
  fileType: 'bank' | 'credit_card' | 'investment';
}

/**
 * File Upload Response DTO - Response after successful file upload
 */
export interface FileUploadResponseDto {
  fileId: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

/**
 * Import Status DTO - Status of a file import process
 */
export interface ImportStatusDto {
  importId: string;
  fileId: string;
  fileName: string;
  fileType: 'bank' | 'credit_card' | 'investment';
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  recordsProcessed?: number;
  recordsImported?: number;
  recordsRejected?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  errors?: ImportErrorDto[];
}

/**
 * Import Error DTO - Error that occurred during import
 */
export interface ImportErrorDto {
  rowNumber?: number;
  message: string;
  rawData?: string;
}

/**
 * Column Mapping DTO - Mapping configuration for file columns
 */
export interface ColumnMappingDto {
  [originalColumn: string]: {
    targetField: string;
    transform?: string;
  };
}

/**
 * Import Options DTO - Options for file import
 */
export interface ImportOptionsDto {
  dateFormat?: string;
  columnMapping?: ColumnMappingDto;
  skipRows?: number;
  headerRow?: number;
  sheetName?: string;
}

/**
 * Data Mapping Template DTO - Saved mapping template
 */
export interface DataMappingTemplateDto {
  id: string;
  userId: string;
  name: string;
  fileType: 'bank' | 'credit_card' | 'investment';
  mappingConfig: ImportOptionsDto;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transformation Job DTO - Data transformation job
 */
export interface TransformationJobDto {
  jobId: string;
  userId: string;
  dataSource: 'imported_data' | 'all';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled';
  progress: number;
  message?: string;
  fromDate?: string;
  toDate?: string;
  options?: {
    cleanExisting?: boolean;
    transformOptions?: any;
  };
  recordsProcessed?: number;
  recordsTransformed?: number;
  recordsRejected?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
