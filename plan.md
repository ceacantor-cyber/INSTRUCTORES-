# Plan — CEA Cantor · Evaluación de instructores

## Alcance
Aplicación web responsive para que estudiantes de CEA Cantor evalúen a sus instructores desde un enlace compartido mediante QR. Incluye calificación obligatoria de 1 a 5 estrellas, comentario opcional, confirmación de envío y una consola de operador protegida con contraseña para revisar estadísticas agregadas, distribución de estrellas y comentarios recientes.

## Implementación
- Frontend React + Vite con rutas `/` y `/operador`, optimizado primero para móvil.
- Backend Express + tRPC para exponer instructores, registrar evaluaciones, autenticar al operador y calcular estadísticas.
- MySQL gestionado con Drizzle para tablas de instructores y evaluaciones; las estadísticas se calculan a partir del historial persistido.
- Contraseña del operador inyectada como secreto `OPERATOR_PASSWORD`; sesión propia en cookie HttpOnly con `SameSite=None; Secure` en Preview HTTPS y `SameSite=Lax` en desarrollo HTTP.
- Semillas iniciales con categorías de instructor editables desde la consola para que el formulario funcione desde el primer acceso y el operador pueda agregar los nombres reales.
- Manifiesto `manus-routes.json` con las rutas visibles de la aplicación.

## Estructura
- `client/src/pages/Home.tsx`: experiencia pública de evaluación y estado de confirmación.
- `client/src/pages/Operator.tsx`: acceso, dashboard, estadísticas, comentarios recientes, QR y alta de instructores.
- `client/src/index.css`: sistema visual y responsive.
- `server/routers.ts`: procedimientos públicos y protegidos.
- `server/operatorAuth.ts`: sesión de operador basada en secreto.
- `server/db.ts` y `drizzle/schema.ts`: persistencia y consultas.

## Diseño — Tablero Nocturno

### Direcciones consideradas
- Ruta Señalética (0.07): señalización vial contemporánea, alto contraste y bloques orientativos.
- Calma Urbana (0.06): superficies luminosas, acentos verdes y sensación amable.
- Tablero Nocturno (0.87): consola oscura refinada con datos brillantes y controles legibles.

### Dirección elegida: Tablero Nocturno
- **Movimiento:** dashboard editorial oscuro inspirado sutilmente en un tablero de conducción, sin caer en una estética temática literal.
- **Principios:** claridad en un vistazo, contraste accesible, ritmo compacto en móvil y confianza operativa.
- **Color:** azul grafito profundo para reducir ruido visual; turquesa eléctrico como color propio de CEA Cantor para acciones y datos; ámbar puntual para estrellas y señales de atención.
- **Layout:** navegación superior mínima, hero con columna editorial y tarjeta de acción, formulario en una superficie elevada; consola con métricas ancladas arriba y módulos de datos apilados.
- **Firma:** marca circular con línea de carretera, tarjetas con borde turquesa tenue y barras de distribución de estrellas.
- **Interacción:** controles grandes, estados de hover suaves, selección de estrellas inmediata y validación cercana al campo.
- **Animación:** entradas cortas de 220–360 ms, barras que crecen al cargar estadísticas y estrellas con microescala al seleccionar; sin animación continua que distraiga.
- **Tipografía:** Urbanist para titulares y Manrope para interfaz y datos, con jerarquía muy marcada entre números, etiquetas y ayudas.
- **Esencia:** “La voz de cada estudiante ayuda a mejorar cada kilómetro”; profesional, atento, directo.
- **Voz:** titulares como “Tu experiencia hace la diferencia” y CTAs como “Enviar evaluación”.
- **Wordmark:** monograma circular “CC” atravesado por una línea de carretera, acompañado de “CEA CANTOR”.
- **Color distintivo:** turquesa `#5ED6C0` sobre grafito `#18212F`.
