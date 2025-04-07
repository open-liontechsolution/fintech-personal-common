# Esquema de Versionado para fintech-personal-common

Este documento define el esquema de versionado semántico (SemVer) que utilizaremos para el repositorio común `fintech-personal-common`.

## Versionado Semántico (SemVer)

Seguiremos el estándar de Versionado Semántico 2.0.0, que define el formato de versión como: **MAJOR.MINOR.PATCH**

Donde:
- **MAJOR**: Incrementado cuando se realizan cambios incompatibles con versiones anteriores
- **MINOR**: Incrementado cuando se agregan funcionalidades manteniendo compatibilidad con versiones anteriores
- **PATCH**: Incrementado cuando se realizan correcciones de errores manteniendo compatibilidad con versiones anteriores

## Política de Versionado

### Reglas para incremento de versión

1. **Cambios MAJOR (X.y.z → X+1.0.0)**
   - Cambios en interfaces públicas que rompen la compatibilidad
   - Eliminación de funcionalidades deprecadas
   - Cambios en los contratos de API que requieren modificaciones en los microservicios consumidores

2. **Cambios MINOR (x.Y.z → x.Y+1.0)**
   - Adición de nuevas funcionalidades manteniendo compatibilidad
   - Marcado de características como deprecadas
   - Adición de nuevos DTOs, esquemas o tipos
   - Mejoras significativas en la implementación existente

3. **Cambios PATCH (x.y.Z → x.y.Z+1)**
   - Correcciones de errores
   - Mejoras de rendimiento
   - Cambios internos que no afectan a las interfaces
   - Actualización de documentación

### Pre-releases y Metadatos

Para versiones en desarrollo o prueba, utilizaremos el formato:
- Alpha: `X.Y.Z-alpha.N`
- Beta: `X.Y.Z-beta.N`
- Release Candidate: `X.Y.Z-rc.N`

## Gestión de Dependencias

Los microservicios consumidores deben especificar rangos de versión adecuados:
- Para dependencias estables: `^X.Y.Z` (compatible con X.Y.Z o superior, manteniendo X)
- Para dependencias en desarrollo rápido: `~X.Y.Z` (compatible con X.Y.Z o superior, manteniendo X.Y)

## Proceso de Release

1. Actualizar la versión en `package.json`
2. Generar y actualizar el CHANGELOG.md
3. Crear un tag Git con la nueva versión
4. Publicar el paquete en el registro npm privado
5. Notificar a los equipos de desarrollo
