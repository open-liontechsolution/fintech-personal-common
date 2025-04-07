# Arquitectura de Microservicios - Fintech Personal

## Visión General

La aplicación Fintech Personal sigue una arquitectura de microservicios diseñada para ofrecer escalabilidad horizontal, separación de responsabilidades y resiliencia. Este documento proporciona una visión general de la arquitectura, los componentes principales y cómo interactúan entre sí.

## Microservicios

El sistema se compone de los siguientes microservicios principales:

### 1. web-app

- **Responsabilidad**: Proporciona la interfaz de usuario frontend y APIs RESTful para la interacción del usuario.
- **Tecnologías**: React, Node.js, Express
- **Principales características**:
  - Autenticación y gestión de usuarios
  - Recepción y almacenamiento de archivos en GridFS
  - Visualización de datos financieros y reportes
  - Comunicación con otros microservicios a través de RabbitMQ

### 2. data-import

- **Responsabilidad**: Procesa archivos financieros (CSV/Excel) y extrae datos para almacenarlos en MongoDB.
- **Tecnologías**: Node.js, MongoDB, RabbitMQ
- **Principales características**:
  - Servicio continuo que escucha mensajes de la cola RabbitMQ
  - Descarga archivos desde GridFS
  - Procesa y valida datos
  - Actualiza el estado del procesamiento a través de eventos

### 3. data-transf

- **Responsabilidad**: Transforma datos desde MongoDB a MySQL para análisis y presentación.
- **Tecnologías**: Node.js, MongoDB, MySQL, RabbitMQ
- **Principales características**:
  - Servicio continuo que escucha mensajes de la cola RabbitMQ
  - Transforma y normaliza datos
  - Aplica reglas de negocio para clasificación y categorización
  - Actualiza el estado de la transformación a través de eventos

## Infraestructura

### Almacenamiento

- **MongoDB**: Almacenamiento de datos importados sin procesar
  - **GridFS**: Almacenamiento de archivos subidos por el usuario
- **MySQL**: Almacenamiento de datos procesados y normalizados para análisis

### Comunicación entre Servicios

- **RabbitMQ**: Comunicación asíncrona entre microservicios
  - Exchange principal: `fintech.topic`
  - Colas principales:
    - `file.upload`: Notificaciones de archivos subidos
    - `file.import.status`: Actualizaciones de estado de importación
    - `data.transform.request`: Solicitudes de transformación
    - `data.transform.status`: Actualizaciones de estado de transformación

### Despliegue

- **Entorno de Desarrollo**: Docker Compose en `local-sandbox`
- **Entorno de Producción**: Kubernetes (k3s)
  - Cada microservicio se despliega en pods independientes
  - Escalado horizontal a través de HPA (Horizontal Pod Autoscaler)
  - Sin dependencia de sistemas de archivos compartidos

## Flujo de Datos

1. **Importación de Datos**:
   - Usuario sube archivo a través de `web-app`
   - `web-app` almacena el archivo en GridFS y envía un evento a RabbitMQ
   - `data-import` recibe el evento, descarga el archivo de GridFS y lo procesa
   - Los datos extraídos se almacenan en MongoDB
   - `data-import` envía actualizaciones de estado a `web-app` a través de RabbitMQ

2. **Transformación de Datos**:
   - `web-app` envía una solicitud de transformación a RabbitMQ
   - `data-transf` recibe el evento y comienza a transformar los datos
   - Los datos transformados se guardan en MySQL
   - `data-transf` envía actualizaciones de estado a `web-app` a través de RabbitMQ

## Escalabilidad

La arquitectura está diseñada para escalabilidad horizontal:

- Todos los microservicios son stateless y pueden escalar horizontalmente
- No hay dependencia de sistemas de archivos compartidos entre instancias
- GridFS permite almacenar y recuperar archivos sin importar qué instancia procese la solicitud
- RabbitMQ permite que múltiples instancias de consumidores procesen mensajes en paralelo

## Seguridad

- Autenticación basada en JWT
- Cada usuario solo puede acceder a sus propios datos
- Comunicación segura entre microservicios
- Hashing de contraseñas con bcrypt
- Control de acceso basado en roles
