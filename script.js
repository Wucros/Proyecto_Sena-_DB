
const NOMBRES_PLATAFORMA = {
  playstation: 'PlayStation',
  xbox: 'Xbox',
  nintendo: 'Nintendo',
  pc: 'PC'
};

const ETIQUETAS_CATEGORIA = {
  consola: 'Consola',
  juego: 'Videojuego',
  accesorio: 'Accesorio'
};

const CATEGORIAS_CON_PLATAFORMA = ['juego'];

let productos = [];
let catalogError = null;
let soportaColumnaEmoji = false;

function obtenerConfigSupabase() {
  const base = typeof window.SUPABASE_URL === 'string' ? window.SUPABASE_URL.trim() : '';
  const key = typeof window.SUPABASE_ANON_KEY === 'string' ? window.SUPABASE_ANON_KEY.trim() : '';
  if (!base || !key) return null;
  return { base: base.replace(/\/$/, ''), key };
}

function headersSupabase(prefer) {
  const config = obtenerConfigSupabase();
  if (!config) return null;
  const headers = {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };
  if (prefer) headers.Prefer = prefer;
  return { config, headers };
}

function mapProductoRow(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    plataforma: row.plataforma ?? undefined,
    precio: row.precio,
    precioAnterior: row.precio_anterior,
    emoji: row.emoji ?? '🎮',
    oferta: row.oferta,
    imagen: row.imagen || null
  };
}

async function cargarProductos() {
  catalogError = null;
  const supabase = headersSupabase();
  if (!supabase) {
    catalogError = 'Configura Supabase en supabase-config.js para ver el catálogo.';
    productos = [];
    return;
  }
  const url = `${supabase.config.base}/rest/v1/productos?select=*&order=id.asc`;
  const res = await fetch(url, {
    headers: supabase.headers
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || res.statusText);
  }
  const rows = await res.json();
  productos = Array.isArray(rows) ? rows.map(mapProductoRow) : [];
  soportaColumnaEmoji = rows.length > 0 && Object.prototype.hasOwnProperty.call(rows[0], 'emoji');
}

let carrito = [];
let filtroActual = 'todos';
let filtroPlataforma = 'todos';
let textoBusqueda = '';


const productsGrid = document.getElementById('productsGrid');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartFooter = document.getElementById('cartFooter');
const cartTotal = document.getElementById('cartTotal');
const btnCart = document.getElementById('btnCart');
const btnCloseCart = document.getElementById('btnCloseCart');
const btnCheckout = document.getElementById('btnCheckout');
const btnMenu = document.getElementById('btnMenu');
const searchInput = document.getElementById('searchInput');
const btnAddProduct = document.getElementById('btnAddProduct');
const productModalOverlay = document.getElementById('productModalOverlay');
const productForm = document.getElementById('productForm');
const productFormError = document.getElementById('productFormError');
const productCategoria = document.getElementById('productCategoria');
const plataformaField = document.getElementById('plataformaField');
const productPlataforma = document.getElementById('productPlataforma');
const btnCloseProductModal = document.getElementById('btnCloseProductModal');
const btnCancelProduct = document.getElementById('btnCancelProduct');
const btnSubmitProduct = document.getElementById('btnSubmitProduct');


function formatoPrecio(num) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}


function renderProductos() {
  if (catalogError) {
    productsGrid.innerHTML = `<p class="no-results">${catalogError}</p>`;
    return;
  }

  const filtrados = productos.filter(p => {
    const cumpleCategoria = filtroActual === 'todos' || p.categoria === filtroActual;
    const cumplePlataforma = !CATEGORIAS_CON_PLATAFORMA.includes(p.categoria)
      || filtroPlataforma === 'todos'
      || p.plataforma === filtroPlataforma;
    const cumpleBusqueda = !textoBusqueda ||
      p.nombre.toLowerCase().includes(textoBusqueda.toLowerCase());
    return cumpleCategoria && cumplePlataforma && cumpleBusqueda;
  });

  const filterPlatformEl = document.getElementById('filterPlatform');
  if (filterPlatformEl) {
    filterPlatformEl.style.display = CATEGORIAS_CON_PLATAFORMA.includes(filtroActual) ? 'block' : 'none';
  }

  productsGrid.innerHTML = '';

  if (filtrados.length === 0) {
    productsGrid.innerHTML = '<p class="no-results">No hay productos que coincidan con tu búsqueda.</p>';
    return;
  }

  filtrados.forEach(p => {
    const card = document.createElement('article');
    const esCuadrado = p.categoria === 'consola' || p.categoria === 'accesorio';
    card.className = 'product-card' + (esCuadrado ? ' product-card--consola' : '');
    card.dataset.id = p.id;
    const categoriaLabel = ETIQUETAS_CATEGORIA[p.categoria] || p.categoria;
    const plataformaBadge = p.plataforma
      ? `<span class="product-platform">${NOMBRES_PLATAFORMA[p.plataforma] || p.plataforma}</span>`
      : '';
    const precioTexto = p.precio === 0 ? 'Gratis' : formatoPrecio(p.precio);
    const imgContent = p.imagen
      ? `<img src="${p.imagen}" alt="${p.nombre}" class="product-cover" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><span class="product-cover-fallback" style="display:none">${p.emoji}</span>`
      : `<span class="product-cover-fallback">${p.emoji}</span>`;
    card.innerHTML = `
      <div class="product-image">${imgContent}</div>
      <div class="product-info">
        <div class="product-meta">
          <span class="product-category">${categoriaLabel}</span>
          ${plataformaBadge}
        </div>
        <h3 class="product-name">${p.nombre}</h3>
        <p class="product-price">
          ${p.precioAnterior ? `<span class="old">${formatoPrecio(p.precioAnterior)}</span>` : ''}
          ${precioTexto}
        </p>
        <button type="button" class="btn-add" data-id="${p.id}" ${p.precio === 0 ? 'disabled' : ''}>${p.precio === 0 ? 'Gratis' : 'Añadir al carrito'}</button>
      </div>
    `;
    productsGrid.appendChild(card);
  });

  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', () => añadirAlCarrito(parseInt(btn.dataset.id, 10)));
  });
}

function añadirAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const existente = carrito.find(item => item.id === id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  actualizarCarritoUI();
  abrirCarrito();
}

function quitarDelCarrito(id) {
  carrito = carrito.filter(item => item.id !== id);
  actualizarCarritoUI();
}

function cambiarCantidad(id, delta) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) quitarDelCarrito(id);
  else actualizarCarritoUI();
}

function actualizarCarritoUI() {
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  cartCount.textContent = totalItems;
  cartCount.dataset.count = totalItems;

  if (carrito.length === 0) {
    cartEmpty.hidden = false;
    cartFooter.hidden = true;
    cartItems.innerHTML = '';
    cartItems.appendChild(cartEmpty);
    return;
  }

  cartEmpty.hidden = true;
  cartFooter.hidden = false;

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  cartTotal.textContent = formatoPrecio(total);

  cartItems.innerHTML = '';
  carrito.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    const cartImg = item.imagen
      ? `<img src="${item.imagen}" alt="" class="cart-item-cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><span class="cart-item-emoji" style="display:none">${item.emoji}</span>`
      : `<span class="cart-item-emoji">${item.emoji}</span>`;
    div.innerHTML = `
      <div class="cart-item-image">${cartImg}</div>
      <div class="cart-item-details">
        <p class="cart-item-name">${item.nombre}</p>
        <p class="cart-item-price">${formatoPrecio(item.precio)} × ${item.cantidad}</p>
        <div class="cart-item-actions">
          <div class="cart-item-qty">
            <button type="button" aria-label="Menos" data-id="${item.id}" data-delta="-1">−</button>
            <span>${item.cantidad}</span>
            <button type="button" aria-label="Más" data-id="${item.id}" data-delta="1">+</button>
          </div>
          <button type="button" class="cart-item-remove" data-id="${item.id}">Eliminar</button>
        </div>
      </div>
    `;
    cartItems.appendChild(div);
  });

  cartItems.querySelectorAll('.cart-item-qty button[data-delta]').forEach(btn => {
    btn.addEventListener('click', () => {
      cambiarCantidad(parseInt(btn.dataset.id, 10), parseInt(btn.dataset.delta, 10));
    });
  });
  cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => quitarDelCarrito(parseInt(btn.dataset.id, 10)));
  });
}

function abrirCarrito() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  cartSidebar.setAttribute('aria-hidden', 'false');
  cartOverlay.setAttribute('aria-hidden', 'false');
}

function cerrarCarrito() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  cartSidebar.setAttribute('aria-hidden', 'true');
  cartOverlay.setAttribute('aria-hidden', 'true');
}

function finalizarCompra() {
  if (carrito.length === 0) return;
  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  alert(`¡Gracias por tu compra!\n\nTotal: ${formatoPrecio(total)}\n\nEste es un proyecto de demostración. No se ha realizado ningún cargo.`);
  carrito = [];
  actualizarCarritoUI();
  cerrarCarrito();
}

function obtenerSiguienteIdLocal() {
  if (productos.length === 0) return 1;
  return Math.max(...productos.map(p => p.id)) + 1;
}

async function obtenerSiguienteId() {
  const supabase = headersSupabase();
  if (!supabase) return obtenerSiguienteIdLocal();
  try {
    const res = await fetch(
      `${supabase.config.base}/rest/v1/productos?select=id&order=id.desc&limit=1`,
      { headers: supabase.headers }
    );
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) return rows[0].id + 1;
      return 1;
    }
  } catch (err) {
    console.warn('No se pudo obtener el siguiente ID remoto:', err);
  }
  return obtenerSiguienteIdLocal();
}

function parsearErrorSupabase(detail) {
  if (!detail) return null;
  try {
    const data = JSON.parse(detail);
    return data.message || data.hint || data.details || null;
  } catch {
    return detail;
  }
}

function mensajeErrorGuardado(detail) {
  const texto = String(detail);
  const mensaje = parsearErrorSupabase(texto) || texto;

  if (texto.includes('42501') || /row-level security/i.test(mensaje)) {
    return 'Sin permiso para guardar. En Supabase → SQL Editor ejecuta el archivo SQL/migracion-guardar-producto.sql.';
  }
  if (texto.includes('PGRST204') || /could not find the/i.test(mensaje)) {
    return 'La base de datos no tiene todas las columnas. Ejecuta SQL/migracion-guardar-producto.sql en Supabase.';
  }
  if (/productos_categoria_check|check constraint/i.test(mensaje)) {
    return 'Categoría no permitida en la base de datos. Ejecuta SQL/migracion-guardar-producto.sql en Supabase.';
  }
  if (/duplicate key|already exists/i.test(mensaje)) {
    return 'Ya existe un producto con ese ID. Intenta guardar de nuevo.';
  }
  return mensaje || 'No se pudo guardar el producto. Revisa los datos e inténtalo de nuevo.';
}

function actualizarCampoPlataformaModal() {
  const categoria = productCategoria.value;
  const esJuego = categoria === 'juego';
  plataformaField.hidden = categoria === 'consola';
  productPlataforma.required = esJuego;
  if (categoria === 'consola') {
    productPlataforma.value = '';
  }
}

function mostrarErrorModal(mensaje) {
  productFormError.textContent = mensaje;
  productFormError.hidden = !mensaje;
}

function abrirModalProducto() {
  productForm.reset();
  mostrarErrorModal('');
  const categoriaInicial = ['consola', 'juego', 'accesorio'].includes(filtroActual)
    ? filtroActual
    : 'consola';
  productCategoria.value = categoriaInicial;
  actualizarCampoPlataformaModal();
  const emojiGroup = document.getElementById('productEmoji')?.closest('.form-group');
  if (emojiGroup) emojiGroup.hidden = !soportaColumnaEmoji;
  productModalOverlay.classList.add('open');
  productModalOverlay.setAttribute('aria-hidden', 'false');
  document.getElementById('productNombre').focus();
}

function cerrarModalProducto() {
  productModalOverlay.classList.remove('open');
  productModalOverlay.setAttribute('aria-hidden', 'true');
  mostrarErrorModal('');
  btnSubmitProduct.disabled = false;
  btnSubmitProduct.textContent = 'Guardar producto';
}

async function guardarProducto(event) {
  event.preventDefault();
  mostrarErrorModal('');

  const supabase = headersSupabase('return=representation');
  if (!supabase) {
    mostrarErrorModal('Configura Supabase en supabase-config.js.');
    return;
  }

  const formData = new FormData(productForm);
  const categoria = formData.get('categoria');
  const plataforma = formData.get('plataforma');
  const precioAnteriorRaw = formData.get('precio_anterior');
  const precio = Number(formData.get('precio'));
  const precioAnterior = precioAnteriorRaw ? Number(precioAnteriorRaw) : null;

  if (!formData.get('nombre')?.toString().trim()) {
    mostrarErrorModal('El nombre es obligatorio.');
    return;
  }
  if (Number.isNaN(precio) || precio < 0) {
    mostrarErrorModal('Ingresa un precio válido.');
    return;
  }
  if (categoria === 'juego' && !plataforma) {
    mostrarErrorModal('Los videojuegos deben tener una plataforma.');
    return;
  }
  if (precioAnterior !== null && (Number.isNaN(precioAnterior) || precioAnterior <= precio)) {
    mostrarErrorModal('El precio anterior debe ser mayor que el precio actual.');
    return;
  }

  const payload = {
    id: await obtenerSiguienteId(),
    nombre: formData.get('nombre').toString().trim(),
    categoria,
    plataforma: plataforma || null,
    precio,
    precio_anterior: precioAnterior,
    oferta: formData.get('oferta') === 'on',
    imagen: formData.get('imagen')?.toString().trim() || ''
  };

  if (soportaColumnaEmoji) {
    payload.emoji = formData.get('emoji')?.toString().trim() || '🎮';
  }

  btnSubmitProduct.disabled = true;
  btnSubmitProduct.textContent = 'Guardando...';

  try {
    const res = await fetch(`${supabase.config.base}/rest/v1/productos`, {
      method: 'POST',
      headers: supabase.headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(detail || res.statusText);
    }

    await cargarProductos();
    aplicarFiltroCategoria(categoria);
    cerrarModalProducto();
  } catch (err) {
    console.error(err);
    mostrarErrorModal(mensajeErrorGuardado(err.message));
  } finally {
    btnSubmitProduct.disabled = false;
    btnSubmitProduct.textContent = 'Guardar producto';
  }
}

function aplicarFiltroCategoria(categoria) {
  filtroActual = categoria;
  if (!CATEGORIAS_CON_PLATAFORMA.includes(categoria)) {
    filtroPlataforma = 'todos';
    document.querySelectorAll('.filter-btn[data-platform]').forEach(b => {
      b.classList.toggle('active', b.dataset.platform === 'todos');
    });
  }
  document.querySelectorAll('.filter-btn[data-filter]').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === categoria);
  });
  renderProductos();
}

document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => aplicarFiltroCategoria(btn.dataset.filter));
});

document.querySelectorAll('.nav-link[data-nav-filter]').forEach(link => {
  link.addEventListener('click', () => aplicarFiltroCategoria(link.dataset.navFilter));
});

document.querySelectorAll('.filter-btn[data-platform]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn[data-platform]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroPlataforma = btn.dataset.platform;
    renderProductos();
  });
});

searchInput.addEventListener('input', () => {
  textoBusqueda = searchInput.value.trim();
  renderProductos();
});

const nav = document.querySelector('.nav');
btnMenu.addEventListener('click', () => {
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
  if (nav.style.display === 'flex') {
    nav.style.flexDirection = 'column';
    nav.style.position = 'absolute';
    nav.style.top = '100%';
    nav.style.left = '0';
    nav.style.right = '0';
    nav.style.background = 'var(--bg-card)';
    nav.style.padding = '1rem';
    nav.style.borderBottom = '1px solid var(--border)';
  }
});

btnCart.addEventListener('click', abrirCarrito);
btnCloseCart.addEventListener('click', cerrarCarrito);
cartOverlay.addEventListener('click', cerrarCarrito);
btnCheckout.addEventListener('click', finalizarCompra);

btnAddProduct.addEventListener('click', abrirModalProducto);
btnCloseProductModal.addEventListener('click', cerrarModalProducto);
btnCancelProduct.addEventListener('click', cerrarModalProducto);
productForm.addEventListener('submit', guardarProducto);
productCategoria.addEventListener('change', actualizarCampoPlataformaModal);

productModalOverlay.addEventListener('click', (e) => {
  if (e.target === productModalOverlay) cerrarModalProducto();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && productModalOverlay.classList.contains('open')) {
    cerrarModalProducto();
  }
});

(async function iniciar() {
  productsGrid.innerHTML = '<p class="no-results">Cargando catálogo...</p>';
  try {
    await cargarProductos();
  } catch (err) {
    console.error(err);
    catalogError = 'No se pudo cargar el catálogo. Revisa la consola, el SQL en Supabase y supabase-config.js.';
    productos = [];
  }
  renderProductos();
  actualizarCarritoUI();
})();
