# CEA Cantor en Render + Supabase

## Decisión de arquitectura

Supabase es suficiente para esta aplicación porque entrega una base de datos PostgreSQL administrada y cadenas de conexión para backend persistente, pooler IPv4 y migraciones. Render ejecutará el servidor Express/tRPC y Supabase conservará instructores, evaluaciones, fotos, periodos activos y el histórico quincenal.

La aplicación fue preparada para PostgreSQL con Drizzle. En Render se usa la conexión de **Session pooler** de Supabase (`DATABASE_URL`, puerto 5432). Para migrar desde un computador local se usa la conexión **Direct** (`MIGRATION_DATABASE_URL`, puerto 5432). No se deben subir esas cadenas a GitHub.

Antes de esta preparación se revisó la consola actual: el histórico existente tiene **0 evaluaciones**, por lo que no hay reportes que exportar ni perder. Las evaluaciones futuras sí quedarán conservadas por periodo.

## 1. Crear la base de datos en Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard).
2. Abre **Connect** y copia la cadena de **Direct connection** para `MIGRATION_DATABASE_URL`.
3. Copia también la cadena de **Session pooler** para `DATABASE_URL`. Usa exactamente el host y usuario que muestra Supabase; no los inventes manualmente.
4. Si la contraseña contiene `&`, `#`, `?` o espacios, codifícala en la URL.
5. En el computador local crea `.env` a partir de `.env.example`. El archivo `.env` está excluido por `.gitignore`.

## 2. Crear las tablas

Con el proyecto local y las variables configuradas, ejecuta:

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
```

El comando usa `MIGRATION_DATABASE_URL` primero y aplica la migración de `drizzle-pg/`. Verifica en Supabase que existan `users`, `instructors`, `evaluation_periods` y `evaluations`.

No ejecutes `pnpm db:push` en producción. Las migraciones versionadas son más seguras para conservar el histórico.

## 3. Subir el repositorio a GitHub

Si el proyecto todavía está en el repositorio de Manus, crea un repositorio privado en GitHub y conecta este código:

```bash
git remote -v
git remote add github https://github.com/TU_USUARIO/cea-cantor-evaluaciones.git
git push -u github main
```

Si ya existe un remoto `github`, usa:

```bash
git remote set-url github https://github.com/TU_USUARIO/cea-cantor-evaluaciones.git
git push -u github main
```

No subas `.env`, contraseñas, cadenas de Supabase ni la carpeta `node_modules`.

## 4. Crear el servicio en Render

1. Entra a [Render](https://dashboard.render.com) y elige **New → Blueprint**.
2. Selecciona el repositorio de GitHub y la rama `main`.
3. Render detectará `render.yaml`.
4. En las variables solicitadas, configura:
   - `DATABASE_URL`: cadena Session pooler de Supabase.
   - `MIGRATION_DATABASE_URL`: cadena Direct de Supabase. Puedes dejarla solo como secreto de despliegue; la aplicación no la usa en runtime.
   - `OPERATOR_PASSWORD`: la contraseña del operador.
5. Confirma el servicio web. El build es `pnpm install --frozen-lockfile && pnpm build` y el arranque aplica `pnpm db:migrate` antes de ejecutar `pnpm start`.
6. Cuando el servicio quede activo, prueba `https://TU-SERVICIO.onrender.com/api/health`. Debe responder `{ "status": "ok" }`.

Render debe recibir la variable `PORT`; el servidor ya escucha en `0.0.0.0` y usa `PORT`, como exige un Web Service de Render.

## 5. Funcionamiento de las quincenas

Cada evaluación se guarda con `periodKey`. La aplicación crea automáticamente el periodo de la primera mitad (`día 1–15`) o segunda mitad (`día 16–fin de mes`) usando la zona horaria de Bogotá.

En la consola de operador aparece **Reiniciar reportes**. El botón requiere confirmación, cierra el periodo activo, crea uno nuevo y deja el tablero actual en cero. No borra evaluaciones: el periodo anterior aparece en **Histórico conservado** con su cantidad y promedio.

El cierre manual es útil si CEA Cantor quiere reiniciar antes de cambiar de fecha. Al cambiar automáticamente la quincena, la aplicación también cierra el periodo anterior y abre el nuevo cuando se consulta la consola o se registra una evaluación.

## 6. Carga de fotos

Las fotos se almacenan como parte del reporte en la base de datos y la consola las muestra dentro de **Observaciones y reportes**. El límite actual es 2 MB por imagen. Para un volumen alto de fotos conviene migrar posteriormente a Supabase Storage y guardar solo la URL en `photo_data`; para el volumen normal de una academia, el diseño actual es suficiente para la primera versión.

## Fuentes consultadas

- [Render Web Services](https://render.com/docs/web-services)
- [Render Blueprint YAML Reference](https://render.com/docs/blueprint-spec)
- [Render Environment Variables and Secrets](https://render.com/docs/configure-environment-variables)
- [Supabase Connect to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Drizzle PostgreSQL](https://orm.drizzle.team/docs/get-started/postgresql-new)
