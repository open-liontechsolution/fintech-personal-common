# Arquitectura Detallada - Fintech Personal

Este documento proporciona una visión detallada de la arquitectura de la aplicación de finanzas personales.

## Diagrama de Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   web-app       │────▶│   data-import   │────▶│   data-transf   │
│   (Express.js)  │     │   (Node.js)     │     │   (Node.js)     │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   MongoDB       │────▶│   RabbitMQ      │────▶│   MySQL         │
│   (GridFS)      │     │   (Mensajería)  │     │   (Analítica)   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Componentes Principales

### 1. Microservicios

#### web-app
- **Tecnología**: Express.js, TypeScript
- **Responsabilidades**:
  - Interfaz de usuario web
  - API REST para clientes
  - Autenticación y autorización de usuarios
  - Subida de archivos y almacenamiento en GridFS
  - Visualización de datos financieros
- **Puertos**: 3000 (HTTP)
- **Dependencias**: MongoDB, RabbitMQ

#### data-import
- **Tecnología**: Node.js, TypeScript
- **Responsabilidades**:
  - Procesamiento de archivos CSV/Excel
  - Extracción de datos financieros
  - Normalización y limpieza de datos
  - Almacenamiento en MongoDB
- **Escalabilidad**: Múltiples instancias escuchando la misma cola
- **Dependencias**: MongoDB, RabbitMQ

#### data-transf
- **Tecnología**: Node.js, TypeScript
- **Responsabilidades**:
  - Transformación de datos para análisis
  - Migración de datos de MongoDB a MySQL
  - Generación de tablas de hechos y dimensiones
  - Creación de agregaciones para reportes
- **Escalabilidad**: Múltiples instancias escuchando colas diferentes
- **Dependencias**: MongoDB, MySQL, RabbitMQ

### 2. Bases de Datos

#### MongoDB
- **Propósito**: Almacenamiento primario de datos
- **Colecciones principales**:
  - `users`: Usuarios registrados
  - `accounts`: Cuentas bancarias
  - `transactions`: Transacciones financieras
  - `categories`: Categorías y subcategorías
  - `files.files` y `files.chunks`: GridFS para almacenamiento de archivos
- **Acceso**: Directo desde web-app y data-import

#### MySQL
- **Propósito**: Almacenamiento optimizado para análisis
- **Tablas principales**:
  - `dim_users`: Dimensión de usuarios
  - `dim_accounts`: Dimensión de cuentas
  - `dim_categories`: Dimensión de categorías
  - `dim_time`: Dimensión temporal
  - `fact_transactions`: Tabla de hechos de transacciones
  - `fact_budget`: Tabla de hechos de presupuestos
- **Acceso**: Directo desde web-app (lectura) y data-transf (escritura)

### 3. Mensajería

#### RabbitMQ
- **Propósito**: Comunicación asíncrona entre servicios
- **Colas principales**:
  - `file-upload`: Notificaciones de archivos subidos
  - `import-complete`: Notificaciones de importación completada
  - `transform-complete`: Notificaciones de transformación completada
- **Exchanges**:
  - `fintech.topic`: Exchange de tipo topic para enrutamiento flexible
- **Patrones**: Publisher/Subscriber, Work Queues

## Despliegue en Kubernetes (k3s)

```
┌────────────────────────────────────────────────────┐
│                   Cluster k3s                       │
│                                                     │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────┐   │
│   │             │   │             │   │         │   │
│   │  Ingress    │──▶│  Services   │──▶│  Pods   │   │
│   │  Controller │   │             │   │         │   │
│   │             │   │             │   │         │   │
│   └─────────────┘   └─────────────┘   └─────────┘   │
│                                                     │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────┐   │
│   │             │   │             │   │         │   │
│   │  Persistent │   │  ConfigMaps │   │ Secrets │   │
│   │  Volumes    │   │             │   │         │   │
│   │             │   │             │   │         │   │
│   └─────────────┘   └─────────────┘   └─────────┘   │
│                                                     │
└────────────────────────────────────────────────────┘
```

### Componentes de Kubernetes

- **Deployments**:
  - `web-app-deployment`: 2-4 réplicas
  - `data-import-deployment`: 2-3 réplicas
  - `data-transf-deployment`: 1-2 réplicas

- **StatefulSets**:
  - `mongodb-statefulset`: Base de datos MongoDB con persistencia
  - `mysql-statefulset`: Base de datos MySQL con persistencia
  - `rabbitmq-statefulset`: Clúster RabbitMQ para mensajería

- **Services**:
  - `web-app-service`: LoadBalancer para la aplicación web
  - `mongodb-service`: ClusterIP para acceso interno a MongoDB
  - `mysql-service`: ClusterIP para acceso interno a MySQL
  - `rabbitmq-service`: ClusterIP para acceso interno a RabbitMQ

- **Ingress**:
  - `web-app-ingress`: Enrutamiento HTTP para la aplicación web

## Seguridad

- **Autenticación**: JWT (JSON Web Tokens)
- **Autorización**: RBAC (Control de acceso basado en roles)
- **Datos sensibles**: Almacenados encriptados en Kubernetes Secrets
- **Comunicación**: TLS entre servicios
- **Aislamiento de datos**: Filtrado por ID de usuario en todas las consultas

## Monitorización

- **Logs**: Centralización con Elasticsearch + Kibana
- **Métricas**: Prometheus + Grafana
- **Alertas**: AlertManager configurado para notificaciones críticas
- **Tracing**: Jaeger para seguimiento de solicitudes entre microservicios
