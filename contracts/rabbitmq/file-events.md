# File Processing Events Contract

Este documento define los eventos y mensajes intercambiados entre los microservicios a través de RabbitMQ específicamente para el procesamiento de archivos.

## Visión General

Los eventos relacionados con archivos se utilizan principalmente para la comunicación entre:
- `web-app`: Recibe los archivos del usuario y los almacena en GridFS
- `data-import`: Procesa los archivos y extrae los datos financieros
- `data-transf`: Transforma los datos importados a MySQL

## Exchange y Colas

- **Exchange**: `fintech.topic`
  - Tipo: `topic`
  - Durable: `true`

### Colas

1. **Cola**: `file.upload`
   - Binding key: `file.upload`
   - Consumidor: Servicio `data-import`
   - Descripción: Cola para notificaciones de nuevos archivos subidos

2. **Cola**: `file.import.status`
   - Binding key: `file.import.status`
   - Consumidor: Servicio `web-app`
   - Descripción: Cola para actualizaciones de estado del proceso de importación

3. **Cola**: `data.transform.request`
   - Binding key: `data.transform.request`
   - Consumidor: Servicio `data-transf`
   - Descripción: Cola para solicitudes de transformación de datos

4. **Cola**: `data.transform.status`
   - Binding key: `data.transform.status`
   - Consumidor: Servicio `web-app`
   - Descripción: Cola para actualizaciones de estado del proceso de transformación

## Estructura de Mensajes

### 1. Evento: FileUploaded

**Routing Key**: `file.upload`

**Payload**:
```json
{
  "eventId": "uuid-string",
  "eventType": "FileUploaded",
  "timestamp": "ISO-8601-datetime",
  "data": {
    "fileId": "gridfs-file-id",
    "fileName": "nombre-del-archivo.csv",
    "fileType": "bank|credit_card|investment",
    "userId": "uuid-string",
    "importOptions": {
      "dateFormat": "DD/MM/YYYY",
      "columnMapping": { /* configuración específica */ }
    }
  }
}
```

### 2. Evento: FileImportStatusUpdate

**Routing Key**: `file.import.status`

**Payload**:
```json
{
  "eventId": "uuid-string",
  "eventType": "FileImportStatusUpdate",
  "timestamp": "ISO-8601-datetime",
  "data": {
    "fileId": "gridfs-file-id",
    "importId": "uuid-string",
    "status": "pending|processing|completed|failed",
    "progress": 0-100,
    "message": "mensaje descriptivo",
    "userId": "uuid-string",
    "result": {
      "recordsProcessed": 1000,
      "recordsImported": 950,
      "recordsRejected": 50,
      "errors": [
        {
          "rowNumber": 45,
          "message": "formato inválido"
        }
      ]
    }
  }
}
```

### 3. Evento: DataTransformationRequest

**Routing Key**: `data.transform.request`

**Payload**:
```json
{
  "eventId": "uuid-string",
  "eventType": "DataTransformationRequest",
  "timestamp": "ISO-8601-datetime",
  "data": {
    "jobId": "uuid-string",
    "userId": "uuid-string",
    "dataSource": "imported_data|all",
    "filters": {
      "fromDate": "ISO-8601-date",
      "toDate": "ISO-8601-date",
      "categories": ["uuid-string", "uuid-string"]
    },
    "options": {
      "cleanExisting": true|false,
      "transformOptions": { /* opciones específicas */ }
    }
  }
}
```

### 4. Evento: DataTransformationStatusUpdate

**Routing Key**: `data.transform.status`

**Payload**:
```json
{
  "eventId": "uuid-string",
  "eventType": "DataTransformationStatusUpdate",
  "timestamp": "ISO-8601-datetime",
  "data": {
    "jobId": "uuid-string",
    "userId": "uuid-string",
    "status": "pending|processing|completed|failed|canceled",
    "progress": 0-100,
    "message": "mensaje descriptivo",
    "result": {
      "recordsProcessed": 1000,
      "recordsTransformed": 950,
      "recordsRejected": 50
    }
  }
}
```

## Manejo de Errores

1. **Reintentos**: Todos los consumidores deben implementar una política de reintentos para mensajes fallidos.
2. **Dead Letter Exchange**: Los mensajes que no puedan ser procesados después de los reintentos deben enviarse a una dead letter exchange `fintech.dlx`.
3. **Logging**: Todos los errores deben ser registrados con detalles suficientes para diagnóstico.

## Consideraciones para Escalabilidad

1. **Prefetch**: Configurar un valor de prefetch apropiado para equilibrar la carga.
2. **Acknowledgments**: Usar confirmaciones manuales para garantizar el procesamiento correcto.
3. **Durabilidad**: Todos los mensajes deben ser marcados como persistentes.
