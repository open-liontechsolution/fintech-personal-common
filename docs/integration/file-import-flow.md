# Flujo de Importación de Archivos

Este documento describe en detalle el flujo de importación de archivos financieros en la plataforma Fintech Personal.

## Diagrama de Flujo

```
+-------------+                +---------+              +-------------+              +---------+
|  Usuario    |                | web-app |              | data-import |              | MongoDB |
+-------------+                +---------+              +-------------+              +---------+
      |                             |                          |                          |
      | 1. Sube archivo             |                          |                          |
      |----------------------------->|                          |                          |
      |                             |                          |                          |
      |                             | 2. Almacena en GridFS    |                          |
      |                             |------------------------------------------>|        |
      |                             |                          |                          |
      |                             | 3. Envía evento          |                          |
      |                             |------------------------->|                          |
      |                             |                          |                          |
      |                             |                          | 4. Descarga archivo      |
      |                             |                          |----------------------->|  |
      |                             |                          |                          |
      |                             |                          | 5. Procesa datos         |
      |                             |                          |                          |
      |                             |                          | 6. Almacena datos        |
      |                             |                          |----------------------->|  |
      |                             |                          |                          |
      |                             | 7. Envía actualización   |                          |
      |                             |<-------------------------|                          |
      |                             |                          |                          |
      | 8. Visualiza resultado      |                          |                          |
      |<-----------------------------|                          |                          |
```

## Pasos Detallados

### 1. Carga de Archivo por el Usuario

- El usuario accede a la interfaz web proporcionada por el servicio `web-app`
- Selecciona un archivo financiero (CSV o Excel) para cargar
- Opcionalmente, proporciona opciones de importación como formato de fecha o mapeo de columnas
- Envía el archivo al backend de `web-app`

### 2. Almacenamiento en GridFS

- `web-app` recibe el archivo y lo almacena en MongoDB GridFS
- El uso de GridFS permite:
  - Almacenar archivos de cualquier tamaño
  - Evitar dependencias de sistemas de archivos compartidos
  - Proporcionar escalabilidad horizontal

### 3. Notificación vía RabbitMQ

- `web-app` crea un evento `FileUploaded` con la siguiente información:
  - ID del archivo en GridFS
  - Nombre del archivo
  - Tipo de archivo (banco, tarjeta de crédito, inversión)
  - ID del usuario
  - Opciones de importación
- El evento se envía a la cola `file.upload` en RabbitMQ

### 4. Descarga del Archivo

- El servicio `data-import` escucha la cola `file.upload` 
- Al recibir un evento, obtiene el ID del archivo
- Descarga el archivo de GridFS a una ubicación temporal en su pod

### 5. Procesamiento de Datos

- `data-import` procesa el archivo según su tipo
- Para archivos CSV:
  - Detecta delimitadores y codificación
  - Aplica el mapeo de columnas según las opciones
  - Valida los datos
- Para archivos Excel:
  - Selecciona la hoja correcta
  - Aplica el mapeo de columnas según las opciones
  - Valida los datos

### 6. Almacenamiento en MongoDB

- Los datos extraídos y validados se almacenan en MongoDB
- Se crean documentos con la siguiente estructura:
  - Información de la transacción
  - Referencias al archivo original
  - Referencias al usuario propietario
  - Metadatos de importación

### 7. Actualización de Estado

- `data-import` envía actualizaciones de estado a través de la cola `file.import.status`
- Las actualizaciones incluyen:
  - Estado actual (pendiente, en proceso, completado, fallido)
  - Porcentaje de progreso
  - Mensaje descriptivo
  - Estadísticas (registros procesados, importados, rechazados)
  - Errores encontrados

### 8. Visualización de Resultados

- `web-app` recibe las actualizaciones de estado y actualiza la interfaz de usuario
- El usuario puede ver:
  - Estado de la importación
  - Progreso en tiempo real
  - Errores o advertencias
  - Resumen de los datos importados

## Manejo de Errores

- **Errores de formato**: Si el archivo no tiene el formato esperado, se rechaza y se notifica al usuario
- **Errores de validación**: Los registros individuales que no pasan la validación se registran y se omiten
- **Errores de sistema**: Si ocurre un error crítico, se marca la importación como fallida y se registra el error

## Consideraciones de Escalabilidad

- Múltiples instancias de `data-import` pueden procesar archivos simultáneamente
- El uso de GridFS elimina la necesidad de un sistema de archivos compartido
- Las colas de RabbitMQ permiten distribuir la carga entre instancias
- Los archivos se eliminan después del procesamiento para liberar recursos
