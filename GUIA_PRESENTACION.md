# Guía de presentación — GameHub

Guía simple para sustentar el proyecto. Te van a preguntar por **frontend** y **backend**.

---

## ¿Qué es el proyecto?

**GameHub** es una tienda web de consolas, videojuegos y accesorios.

El usuario puede:
- Ver y filtrar productos
- Buscar por nombre
- Agregar al carrito
- Crear productos nuevos desde un modal

Los datos están en **Supabase** (base de datos en la nube).

---

## ¿Cómo está armado?

```
FRONTEND (lo que ves en el navegador)
  index.html      → estructura de la página
  styles.css      → diseño y colores
  script.js       → lógica (filtros, carrito, modal)
  supabase-config.js → conexión a la base de datos
        │
        │  fetch (GET y POST)
        ▼
BACKEND (datos en el servidor)
  Supabase + PostgreSQL
  Tabla: productos
  API REST automática
```

**En una frase:** el frontend es la página web; el backend es la base de datos en Supabase que guarda los productos.

---

## Frontend — qué decir

**Tecnologías:** HTML, CSS y JavaScript (sin React ni Angular).

**Archivos principales:**
- `index.html` — menú, catálogo, carrito, modal
- `styles.css` — diseño oscuro, responsive (móvil y PC)
- `script.js` — toda la lógica

**Funciones importantes:**
- Cargar productos desde la API (`cargarProductos`)
- Mostrar tarjetas en pantalla (`renderProductos`)
- Filtrar por categoría, plataforma y búsqueda
- Carrito en memoria (se pierde al recargar la página)
- Modal para agregar productos (`guardarProducto`)

**Qué mostrar en la demo:**
1. Filtrar Consolas / Juegos / Accesorios
2. Buscar un producto
3. Agregar al carrito
4. Crear un producto con el botón **+ Agregar producto**

---

## Backend — qué decir

**Tecnologías:** PostgreSQL + Supabase.

**Archivos:**
- `SQL/schema.sql` — crea la tabla y datos de ejemplo
- `SQL/migracion-guardar-producto.sql` — permite guardar productos

**Tabla `productos` (campos principales):**
- `id`, `nombre`, `categoria` (consola / juego / accesorio)
- `plataforma` (playstation, xbox, nintendo, pc)
- `precio`, `precio_anterior`, `oferta`, `imagen`

**API que usa el frontend:**
- `GET /rest/v1/productos` → listar productos
- `POST /rest/v1/productos` → crear producto

**Seguridad (RLS):** reglas en la base de datos que permiten leer e insertar productos. En un proyecto real, solo el admin podría insertar.

**Qué mostrar en la demo:**
1. Abrir Supabase → Table Editor → tabla `productos`
2. Guardar un producto desde la web y mostrar que aparece en la tabla

---

## Guion rápido (5 minutos)

1. **Presentación** — "GameHub, tienda de consolas y videojuegos"
2. **Frontend** — mostrar filtros, búsqueda y carrito
3. **Backend** — mostrar Supabase y la tabla `productos`
4. **Cierre** — "Frontend en HTML/CSS/JS, backend en PostgreSQL con Supabase"

---

## Preguntas que te pueden hacer

**¿Por qué no usaron React?**  
> Para demostrar HTML, CSS y JavaScript puro. Se puede migrar después.

**¿Dónde se guarda el carrito?**  
> En memoria del navegador. Al recargar se borra.

**¿Qué es Supabase?**  
> Servicio en la nube que da base de datos PostgreSQL y API REST sin crear un servidor propio.

**¿Tienen backend propio?**  
> No escribimos Node ni PHP. El backend es Supabase: base de datos + API.

**¿Cómo se conectan frontend y backend?**  
> Con `fetch` en JavaScript. El frontend pide datos y Supabase responde en JSON.

**¿Qué mejorarían?**  
> Login de usuarios, editar/eliminar productos, guardar el carrito y pasarela de pago.

---

## Antes de presentar, revisa

- [ ] Internet funcionando
- [ ] `supabase-config.js` con datos correctos
- [ ] Ejecutaste `SQL/migracion-guardar-producto.sql` en Supabase
- [ ] Abrir la página con Live Server (extensión de VS Code)

---

## Frase de cierre

> *"Desarrollé una tienda web donde el frontend muestra los productos y el backend en Supabase los almacena en PostgreSQL, conectados por una API REST."*
