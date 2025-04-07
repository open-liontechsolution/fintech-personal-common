# Fintech Personal Common

This repository contains shared components, contracts, and documentation for the Fintech Personal microservices ecosystem.

## Overview

Fintech Personal Common serves as the central hub for communication and integration between the different microservices in the Fintech Personal application. It provides a single source of truth for API specifications, data models, event contracts, and integration documentation.

## Repository Structure

fintech-personal-common/
├── README.md
├── .gitignore
├── package.json
├── tsconfig.json
├── api-specs/
│   └── v1/
│       ├── web-app.yaml
│       └── data-import.yaml
├── schemas/
│   ├── dto/
│   └── events/
├── contracts/
│   ├── rabbitmq/
│   │   └── file-events.md
│   └── rest/
└── docs/
    ├── api/
    ├── events/
    └── integration/


## Microservices Architecture

The Fintech Personal application is built on a microservices architecture with the following components:

1. **web-app**: Frontend and REST API service
2. **data-import**: Service for processing uploaded files (CSV/Excel)
3. **data-transf**: Service for transforming data from MongoDB to MySQL

These services communicate through:
- REST APIs (documented in `api-specs/`)
- RabbitMQ events (documented in `contracts/rabbitmq/`)

## API Specifications

API specifications are written in OpenAPI (Swagger) format and are located in the `api-specs/` directory. These specifications serve as contracts between services and provide documentation for developers.

## Event Contracts

Event contracts define the structure and semantics of events exchanged between services through RabbitMQ. These contracts ensure that services can communicate effectively and maintain compatibility.

## Data Models

Shared data models and DTOs are located in the `schemas/` directory. These models ensure consistency across services and provide a common language for developers.

## Documentation

Comprehensive documentation is available in the `docs/` directory. This documentation includes:
- API documentation
- Event documentation
- Integration guides
- Best practices

## Getting Started

To use this repository in your microservice:

1. Clone this repository
2. Reference the appropriate contracts and schemas
3. Follow the integration guides in the `docs/` directory

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).