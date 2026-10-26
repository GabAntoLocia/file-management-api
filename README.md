# file-management-api

API REST de gestión de archivos con autenticación de usuarios, construida con **NestJS 11** y **MongoDB (Mongoose)**.

> **Estado: en construcción.** Este repositorio contiene el esqueleto inicial del proyecto. Los módulos `auth`, `users` y `files` que importa `AppModule` todavía no están publicados, así que la app no compila tal como está.

## Diseño previsto

| Módulo | Responsabilidad |
|---|---|
| `AuthModule` | Registro, login y protección de rutas |
| `UsersModule` | Gestión de usuarios |
| `FilesModule` | Subida, listado, descarga y borrado de archivos por usuario |

**Base de datos intercambiable:** `AppModule` usa `MongooseModule.forRootAsync`. Con `NODE_ENV=test` o `USE_IN_MEMORY_DB=true` levanta una MongoDB en memoria (`mongodb-memory-server`), así que no hace falta instalar nada para desarrollar o probar. En cualquier otro caso se conecta a `MONGO_URI`.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto HTTP (por defecto `3000`) |
| `MONGO_URI` | Cadena de conexión a MongoDB |
| `USE_IN_MEMORY_DB` | `true` para usar MongoDB en memoria |

## Scripts

```bash
npm install
npm run start:dev   # desarrollo con watch
npm run test        # unit tests (Jest)
npm run test:e2e    # e2e (Supertest)
npm run lint
```

## Stack

NestJS 11 · TypeScript · Mongoose · mongodb-memory-server · Jest · Supertest
