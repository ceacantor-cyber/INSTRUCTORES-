# TODO — CEA Cantor · Evaluaciones quincenales

## Formulario público
- [x] El estudiante puede abrir el formulario desde una URL/QR en móvil.
- [x] El formulario permite elegir instructor por categoría A2 o B2-C2.
- [x] La evaluación incluye calificación general y criterios de presentación personal, experiencia de enseñanza, atención respetuosa, claridad de explicaciones, puntualidad y seguridad.
- [x] El estudiante puede escribir observaciones y anexar una foto opcional de hasta 2 MB.

## Persistencia y periodos
- [x] Las evaluaciones se guardan en PostgreSQL con instructor, periodo, puntuaciones, observación, foto y fecha.
- [x] La aplicación crea automáticamente periodos de día 1–15 y día 16–fin de mes en zona horaria de Bogotá.
- [x] Los periodos cerrados no se borran: quedan disponibles en el histórico con total y promedio.
- [x] La contraseña del operador se mantiene como secreto y la consola usa sesión protegida.

## Consola de operador
- [x] La consola muestra métricas de la quincena activa, distribución, promedios por criterio e instructores.
- [x] El operador puede cerrar y reiniciar la quincena con confirmación; las métricas activas vuelven a cero sin eliminar reportes.
- [x] Los reportes con observaciones o fotos aparecen en la consola.
- [x] La consola muestra el archivo histórico de periodos cerrados.

## Render y Supabase
- [x] `render.yaml` declara build, start, health check y variables secretas sin valores reales.
- [x] Drizzle está configurado para PostgreSQL y las migraciones versionadas viven en `drizzle-pg/`.
- [x] `.env.example` y `RENDER_SUPABASE.md` documentan conexiones, GitHub, Render y migraciones.
- [ ] Crear el proyecto real de Supabase y ejecutar `pnpm db:migrate` con sus cadenas de conexión.
- [ ] Conectar el repositorio de GitHub a Render y configurar `DATABASE_URL`, `MIGRATION_DATABASE_URL` y `OPERATOR_PASSWORD`.

## Calidad
- [x] El código pasa diagnóstico TypeScript y build de producción.
- [x] La paleta oficial usa amarillo, negro, blanco y gris.
