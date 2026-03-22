
const NOMBRES_PLATAFORMA = {
  playstation: 'PlayStation',
  xbox: 'Xbox',
  nintendo: 'Nintendo',
  pc: 'PC'
};

let productos = [];
let catalogError = null;

function mapProductoRow(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    plataforma: row.plataforma ?? undefined,
    precio: row.precio,
    precioAnterior: row.precio_anterior,
    emoji: row.emoji,
    oferta: row.oferta,
    imagen: row.imagen || null
  };
}

async function cargarProductos() {
  catalogError = null;
  const base = typeof window.SUPABASE_URL === 'string' ? window.SUPABASE_URL.trim() : '';
  const key = typeof window.SUPABASE_ANON_KEY === 'string' ? window.SUPABASE_ANON_KEY.trim() : '';
  if (!base || !key) {
    catalogError =
      'errorsupabase.';
    productos = [];
    return;
  }
  const url = `${base.replace(/\/$/, '')}/rest/v1/productos?select=*&order=id.asc`;
  const res = await fetch(url, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json'
    }
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || res.statusText);
  }
  const rows = await res.json();
  productos = Array.isArray(rows) ? rows.map(mapProductoRow) : [];
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
    const cumplePlataforma = p.categoria !== 'juego' || filtroPlataforma === 'todos' || p.plataforma === filtroPlataforma;
    const cumpleBusqueda = !textoBusqueda ||
      p.nombre.toLowerCase().includes(textoBusqueda.toLowerCase());
    return cumpleCategoria && cumplePlataforma && cumpleBusqueda;
  });

  const filterPlatformEl = document.getElementById('filterPlatform');
  if (filterPlatformEl) {
    filterPlatformEl.style.display = filtroActual === 'consola' ? 'none' : 'block';
  }

  productsGrid.innerHTML = '';

  if (filtrados.length === 0) {
    productsGrid.innerHTML = '<p class="no-results">No hay productos que coincidan con tu búsqueda.</p>';
    return;
  }

  filtrados.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card' + (p.categoria === 'consola' ? ' product-card--consola' : '');
    card.dataset.id = p.id;
    const categoriaLabel = p.categoria === 'consola' ? 'Consola' : 'Videojuego';
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

document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroActual = btn.dataset.filter;
    renderProductos();
  });
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
