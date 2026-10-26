# Proyecto de Notas — Entrega Final

Este repositorio contiene la solución completa para la aplicación de Notas y Recordatorios, estructurada en **Frontend** y **Backend** independientes.

---

## 📁 Estructura del Proyecto

```text
entrega-app-notas/
├── backend/               # Servidor REST en NestJS con Swagger y base de datos JSON
│   ├── src/
│   │   ├── auth/          # Módulo de Autenticación (JWT + bcryptjs)
│   │   ├── database/      # JsonDb con Promise queue y guardado atómico (.tmp + rename)
│   │   ├── health/        # Health check (/api/health)
│   │   └── notas/         # Módulo de Notas (Controller -> Service -> Repository)
│   ├── data/              # Persistencia física en db.json
│   ├── test/              # Tests E2E
│   └── README.md
│
├── frontend/              # Aplicación Web en Next.js (Mis Recordatorios)
│   ├── app/               # Páginas y componentes conectados a la API REST
│   └── README.md
│
└── README.md              # Este archivo
```

---

## 🚀 Cómo ejecutar la aplicación

### 1. Iniciar el Backend (NestJS)

En una terminal:

```bash
cd backend
npm install
npm run start:dev
```

* **API Base:** `http://localhost:3000/api`
* **Swagger UI (Documentación interactiva):** `http://localhost:3000/docs` (o `http://localhost:3000/api`)
* **Health Check:** `http://localhost:3000/api/health`

### 2. Iniciar el Frontend (Next.js)

En otra terminal separada:

```bash
cd frontend
npm install
npm run dev
```

* **Aplicación Web:** `http://localhost:3001` (o el puerto asignado por Next.js)

---

## 🧪 Ejecutar los Tests Unitarios del Backend

Para correr la suite de tests unitarios y de integración de NestJS:

```bash
cd backend
npm test
```

Y para los tests E2E:

```bash
npm run test:e2e
```
