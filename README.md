# Fintech Personal Common

Este repositorio contiene componentes compartidos, contratos y documentación para el ecosistema de microservicios de Fintech Personal.

## Descripción General

Fintech Personal Common sirve como el centro para la comunicación e integración entre los diferentes microservicios en la aplicación Fintech Personal. Proporciona una fuente única de verdad para especificaciones de API, modelos de datos, contratos de eventos y documentación de integración.

## Estructura del Repositorio

```
fintech-personal-common/
├── README.md
├── .gitignore
├── package.json
├── tsconfig.json
├── api-specs/
│   └── v1/
│       ├── web-app.yaml
│       ├── data-import.yaml
│       └── data-transf.yaml
├── schemas/
│   ├── dto/
│   │   ├── users.ts
│   │   ├── finances.ts
│   │   └── imports.ts
│   ├── events/
│   │   └── file-events.ts
│   └── mysql/
│       ├── users.sql
│       ├── accounts.sql
│       └── imports.sql
├── contracts/
│   ├── rabbitmq/
│   │   └── file-events.md
│   └── rest/
├── src/
│   ├── index.ts
│   ├── errors/
│   │   └── app-error.ts
│   ├── validation/
│   │   └── validator.ts
│   └── messaging/
│       └── rabbitmq-client.ts
└── docs/
    ├── api/
    ├── events/
    └── integration/
        ├── architecture-overview.md
        └── file-import-flow.md
```

## Arquitectura de Microservicios

La aplicación Fintech Personal está construida sobre una arquitectura de microservicios con los siguientes componentes:

1. **web-app**: Servicio frontend y API REST
2. **data-import**: Servicio para procesar archivos subidos (CSV/Excel)
3. **data-transf**: Servicio para transformar datos desde MongoDB a MySQL

Estos servicios se comunican a través de:
- APIs REST (documentadas en `api-specs/`)
- Eventos RabbitMQ (documentados en `contracts/rabbitmq/`)

## Instalación

Para instalar esta biblioteca en tus microservicios:

```bash
npm install --save fintech-personal-common
```

## Uso

### Importar DTOs

```typescript
import { UserDto, LoginRequestDto } from 'fintech-personal-common';

const user: UserDto = {
  id: '123',
  username: 'usuario',
  email: 'usuario@example.com'
};
```

### Utilizar el Cliente RabbitMQ

```typescript
import { RabbitMQClient, FileUploadedEvent } from 'fintech-personal-common';

const client = new RabbitMQClient({
  url: 'amqp://localhost',
  exchange: 'fintech.topic',
  exchangeType: 'topic'
});

// Publicar un evento
await client.publish<FileUploadedEvent>({
  eventId: '123',
  eventType: 'FileUploaded',
  timestamp: new Date().toISOString(),
  data: {
    fileId: '456',
    fileName: 'transacciones.csv',
    fileType: 'bank',
    userId: '789'
  }
}, {
  routingKey: 'file.upload'
});

// Consumir eventos
await client.consume({
  queue: 'file-upload-queue',
  routingKey: 'file.upload'
}, async (message) => {
  console.log('Archivo recibido:', message.data.fileName);
});
```

### Manejo de Errores

```typescript
import { AppError, NotFoundError } from 'fintech-personal-common';

try {
  // Código que puede fallar
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Recurso no encontrado');
  } else if (error instanceof AppError) {
    console.log(`Error de aplicación: ${error.message}`);
  } else {
    console.log('Error desconocido');
  }
}
```

### Validación

```typescript
import { BaseValidator, ValidationUtils } from 'fintech-personal-common';

class UserValidator extends BaseValidator<UserDto> {
  validate(data: UserDto) {
    const errors = [];
    
    if (ValidationUtils.isEmpty(data.username)) {
      errors.push({ field: 'username', message: 'El nombre de usuario es obligatorio', code: 'REQUIRED' });
    }
    
    if (!ValidationUtils.isEmail(data.email)) {
      errors.push({ field: 'email', message: 'El email no es válido', code: 'INVALID_EMAIL' });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

const validator = new UserValidator();
validator.validateOrThrow(user); // Lanza ValidationError si no es válido
```

## Desarrollo

### Requisitos Previos

- Node.js >= 14.0.0
- npm >= 6.0.0

### Instalación de Dependencias

```bash
npm install
```

### Compilación

```bash
npm run build
```

### Validación de Especificaciones API

```bash
npm run validate:specs
```

### Publicación

```bash
npm publish
```

## Documentación

Para más información sobre la integración entre microservicios, consulta:

- [Visión General de la Arquitectura](./docs/integration/architecture-overview.md)
- [Flujo de Importación de Archivos](./docs/integration/file-import-flow.md)

## Licencia

AGPL-3.0