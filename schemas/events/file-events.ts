/**
 * File Processing Events
 * These interfaces define the event structures for file processing
 * exchanged between microservices via RabbitMQ.
 */

import { ImportOptionsDto } from '../dto/imports';

/**
 * Base Event - Common properties for all events
 */
export interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
}

/**
 * File Uploaded Event - Sent when a file is uploaded
 */
export interface FileUploadedEvent extends BaseEvent {
  eventType: 'FileUploaded';
  data: {
    fileId: string;
    fileName: string;
    fileType: 'bank' | 'credit_card' | 'investment';
    userId: string;
    importOptions?: ImportOptionsDto;
  };
}

/**
 * File Import Status Update Event - Sent when import status changes
 */
export interface FileImportStatusUpdateEvent extends BaseEvent {
  eventType: 'FileImportStatusUpdate';
  data: {
    fileId: string;
    importId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    message?: string;
    userId: string;
    result?: {
      recordsProcessed: number;
      recordsImported: number;
      recordsRejected: number;
      errors?: Array<{
        rowNumber?: number;
        message: string;
      }>;
    };
  };
}

/**
 * Data Transformation Request Event - Sent to request data transformation
 */
export interface DataTransformationRequestEvent extends BaseEvent {
  eventType: 'DataTransformationRequest';
  data: {
    jobId: string;
    userId: string;
    dataSource: 'imported_data' | 'all';
    filters?: {
      fromDate?: string;
      toDate?: string;
      categories?: string[];
    };
    options?: {
      cleanExisting?: boolean;
      transformOptions?: any;
    };
  };
}

/**
 * Data Transformation Status Update Event - Sent when transformation status changes
 */
export interface DataTransformationStatusUpdateEvent extends BaseEvent {
  eventType: 'DataTransformationStatusUpdate';
  data: {
    jobId: string;
    userId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled';
    progress: number;
    message?: string;
    result?: {
      recordsProcessed: number;
      recordsTransformed: number;
      recordsRejected: number;
    };
  };
}

/**
 * Event Type Union - Union of all event types
 */
export type FileProcessingEvent =
  | FileUploadedEvent
  | FileImportStatusUpdateEvent
  | DataTransformationRequestEvent
  | DataTransformationStatusUpdateEvent;
