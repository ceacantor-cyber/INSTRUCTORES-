# CEA Cantor · Evaluación de instructores

Aplicación React / Express / tRPC / Drizzle para evaluar instructores de CEA Cantor, guardar observaciones con foto y consultar estadísticas quincenales.

## Desarrollo

- `pnpm install --frozen-lockfile`: instala dependencias.
- `pnpm dev`: servidor de desarrollo; respeta `PORT` y escucha en `0.0.0.0`.
- `pnpm check`: diagnóstico TypeScript.
- `pnpm build` / `pnpm start`: compila y sirve `dist/index.js` y `dist/public/`.
- `pnpm db:migrate`: aplica las migraciones PostgreSQL de `drizzle-pg/`.
- `pnpm db:generate`: genera una nueva migración PostgreSQL.

## Despliegue

El repositorio incluye `render.yaml`, `.env.example`, `Dockerfile` y la guía [RENDER_SUPABASE.md](./RENDER_SUPABASE.md). La arquitectura recomendada es Render para el servidor y Supabase para PostgreSQL.

La consola de operador usa la contraseña configurada en `OPERATOR_PASSWORD`. No la guardes en GitHub. Render debe recibir `DATABASE_URL` con la conexión Session pooler de Supabase y `MIGRATION_DATABASE_URL` con la conexión Direct usada para migraciones.

Las evaluaciones se agrupan en periodos quincenales. El botón **Reiniciar reportes** de la consola pide confirmación, reinicia las métricas activas y conserva las evaluaciones en el histórico. El QR público de la página principal abre directamente el formulario de evaluación para los estudiantes.
