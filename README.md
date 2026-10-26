# TP Backend - App de Notas

Aplicación de notas con backend en NestJS y frontend en Next.js.

## Cómo levantar el proyecto

### 1. Backend (NestJS)

```bash
cd backend
npm install
npm run start:dev
```

* API: `http://localhost:3000/api`
* Documentación Swagger: `http://localhost:3000/docs`
* Health check: `http://localhost:3000/api/health`

Para correr los tests unitarios:
```bash
npm test
```

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

* Aplicación web: `http://localhost:3001`

## Estructura

* `backend/`: API REST con arquitectura en capas (Controladores, Servicios, Repositorios), persistencia en archivo JSON (`data/db.json`), validación de DTOs, autenticación con JWT y Swagger.
* `frontend/`: Cliente web en Next.js conectado a la API de notas.
