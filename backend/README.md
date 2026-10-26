# Backend de Notas — NestJS

API REST en NestJS para la aplicación de Notas y Recordatorios, migrando toda la lógica de backend de `clase4` con la arquitectura en capas y persistencia JSON (`JsonDb`) de `clase5`.

## Cómo levantar el proyecto

```bash
npm install
npm run start:dev
```

El archivo de base de datos se crea automáticamente en `data/db.json` al guardar datos (configurable mediante la variable de entorno `DATA_FILE`, ver `.env.example`).

- **API**: `http://localhost:3000/api`
- **Swagger UI**: `http://localhost:3000/docs` (también disponible en `http://localhost:3000/api`)
- **Health Check**: `http://localhost:3000/api/health`

## Recursos y Endpoints

| Recurso | Rutas | Descripción |
| --- | --- | --- |
| **Notas** | `POST /api/notas`<br>`GET /api/notas`<br>`GET /api/notas/:id`<br>`PATCH /api/notas/:id`<br>`PATCH /api/notas/:id/notified`<br>`DELETE /api/notas/:id` | CRUD completo de notas con cálculo de expiración, reinicio de validez al editar y marca de notificación. |
| **Autenticación** | `POST /api/auth/register`<br>`POST /api/auth/login`<br>`POST /api/auth/logout`<br>`GET /api/auth/me` | Registro e inicio de sesión con hash `bcryptjs` y sesión JWT (`jose`) vía cookie `HttpOnly` o header `Authorization: Bearer`. |
| **Salud** | `GET /api/health` | Verificación de estado del servicio (`{ "estado": "ok" }`). |

## Arquitectura y Conceptos Aplicados

- **Separación en capas**: `Controller` (`NotasController`, `AuthController`) → `Service` (`NotasService`, `AuthService`) → `Repository` (`NotasRepository`, `UsersRepository`) → `JsonDb` (`DatabaseModule`).
- **Base de datos JSON (`JsonDb`)**: Cola de promesas para serializar escrituras concurrentes y escritura atómica mediante archivo temporal `.tmp` + `rename`.
- **Validación de entrada y DTOs**: Uso global de `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) junto con `class-validator` y `class-transformer`.
- **Manejo centralizado de errores HTTP**: Excepciones estándar de NestJS (`NotFoundException`, `ConflictException`, `UnauthorizedException`).
- **Documentación OpenAPI / Swagger**: Configurada en `/docs` y `/api` con decoradores `@ApiTags`, `@ApiOperation`, `@ApiProperty` y soporte de `BearerAuth`.

## Tests

```bash
# Ejecutar tests unitarios (NotasService, AuthService, Controllers)
npm test

# Ejecutar tests end-to-end
npm run test:e2e
```
