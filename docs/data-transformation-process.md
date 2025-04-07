# Proceso de Transformación de Datos

Este documento detalla el proceso de transformación de datos desde los archivos originales hasta el almacenamiento en MySQL para análisis.

## Flujo Completo de Transformación

```
Archivo CSV/Excel
       │
       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│             │    │             │    │             │
│  web-app    │───▶│  GridFS     │───▶│ data-import │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
                                            │
                                            ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│             │    │             │    │             │
│   MySQL     │◀───│ data-transf │◀───│  MongoDB    │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Fases del Proceso

### 1. Ingesta de Datos

**Responsable**: web-app

1. **Recepción del archivo**:
   - El usuario sube un archivo CSV/Excel a través de la interfaz web
   - Se valida el formato y tamaño del archivo

2. **Almacenamiento en GridFS**:
   - El archivo se guarda en MongoDB GridFS
   - Se genera un ID único para el archivo
   - Se registran metadatos (nombre, tipo, fecha, usuario)

3. **Notificación**:
   - Se envía un mensaje a RabbitMQ con el ID del archivo
   - El mensaje incluye información del usuario y tipo de archivo

### 2. Importación de Datos

**Responsable**: data-import

1. **Extracción del archivo**:
   - El servicio escucha la cola de RabbitMQ
   - Descarga el archivo desde GridFS a memoria

2. **Procesamiento del archivo**:
   - Análisis de encabezados para detectar el formato
   - Mapeo de columnas según configuración del usuario
   - Validación de datos según reglas predefinidas

3. **Normalización**:
   - Conversión de fechas a formato ISO
   - Estandarización de montos (signo, decimales)
   - Detección automática de categorías

4. **Almacenamiento en MongoDB**:
   - Inserción de transacciones en la colección `transactions`
   - Creación de referencias a cuentas y categorías
   - Actualización de saldos en cuentas

5. **Notificación de finalización**:
   - Envío de mensaje a RabbitMQ indicando fin de importación
   - El mensaje incluye estadísticas (registros válidos, errores)

### 3. Transformación para Análisis

**Responsable**: data-transf

1. **Extracción desde MongoDB**:
   - Escucha de eventos de importación completada
   - Consulta de datos desde colecciones de MongoDB

2. **Transformaciones**:
   - **Mapeo dimensional**:
     - Creación/actualización de dimensiones en MySQL
     - Generación de claves subrogadas

   - **Enriquecimiento**:
     - Cálculo de campos derivados (mes, trimestre, día de semana)
     - Asignación a categorías del sistema cuando sea posible
     - Detección de patrones recurrentes

   - **Agregaciones**:
     - Creación de vistas materializadas para análisis frecuentes
     - Precálculo de totales por categoría, mes, cuenta

3. **Carga en MySQL**:
   - Carga incremental en tablas de dimensiones
   - Carga de hechos con referencias a dimensiones
   - Actualización de vistas materializadas

4. **Control de calidad**:
   - Verificación de integridad referencial
   - Comparación de totales entre origen y destino
   - Registro de errores y advertencias

5. **Notificación**:
   - Envío de mensaje a RabbitMQ indicando transformación completada
   - Inclusión de métricas de rendimiento

## Modelo de Datos Dimensional (MySQL)

### Tablas de Dimensiones

- **dim_users**: Información de usuarios
  ```
  user_id, username, email, created_at, updated_at
  ```

- **dim_accounts**: Cuentas bancarias
  ```
  account_id, user_id, account_name, account_type, bank_name, currency, is_active
  ```

- **dim_categories**: Jerarquía de categorías
  ```
  category_id, parent_category_id, user_id, category_name, category_type, is_system
  ```

- **dim_time**: Dimensión temporal
  ```
  date_id, full_date, year, quarter, month, month_name, week, day, day_name, is_weekend, is_holiday
  ```

### Tablas de Hechos

- **fact_transactions**: Transacciones financieras
  ```
  transaction_id, user_id, account_id, category_id, date_id, description,
  amount, balance_after, currency, is_expense, is_income, is_transfer
  ```

- **fact_budget**: Seguimiento de presupuestos
  ```
  budget_id, user_id, category_id, date_id, amount_budgeted, amount_spent,
  variance, variance_percentage
  ```

- **fact_account_balance**: Saldos diarios
  ```
  balance_id, user_id, account_id, date_id, opening_balance, closing_balance,
  total_credits, total_debits
  ```

## Reglas de Transformación

### Mapeo de Categorías

1. **Automático por palabras clave**:
   - Mapeo basado en diccionario de palabras clave
   - Ejemplo: "UBER" → Categoría "Transporte"

2. **Basado en patrones recurrentes**:
   - Detección de transacciones periódicas similares
   - Ejemplo: Mismo monto mensual → Posible suscripción

3. **Aprendizaje de categorizaciones previas**:
   - Uso de categorizaciones manuales previas del usuario
   - Aplicación a nuevas transacciones similares

### Reconciliación de Datos

1. **Detección de duplicados**:
   - Comparación por fecha, monto y descripción
   - Ventana temporal para transacciones similares

2. **Resolución de conflictos**:
   - Reglas de precedencia entre fuentes de datos
   - Preservación de datos enriquecidos manualmente

## Consideraciones de Rendimiento

1. **Procesamiento por lotes**:
   - Tamaño de lote óptimo: 1000 registros
   - Commits transaccionales por lote

2. **Índices optimizados**:
   - MongoDB: Índices compuestos para consultas frecuentes
   - MySQL: Índices en claves foráneas y campos de filtrado común

3. **Paralelización**:
   - Transformación paralela por usuario/cuenta
   - Límites de concurrencia para evitar sobrecarga

## Monitorización y Auditoría

1. **Registro de operaciones**:
   - Inicio y fin de cada fase
   - Conteo de registros procesados/rechazados
   - Tiempo de ejecución

2. **Trazabilidad**:
   - Registro del origen de cada dato
   - Historial de modificaciones
   - Preservación de datos originales
