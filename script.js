document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    if (localStorage.getItem('theme') === 'dark') {
        htmlElement.classList.add('dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            if (htmlElement.classList.contains('dark')) {
                htmlElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                htmlElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // 2. Lógica del Carrito de Compras (Global)
    let carrito = JSON.parse(localStorage.getItem('cubetrade_carrito')) || [];
    
    function guardarCarrito() {
        localStorage.setItem('cubetrade_carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
    }

    function actualizarContadorCarrito() {
        const contador = document.getElementById('cartCount');
        if (contador) {
            const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
            contador.textContent = totalItems;
            contador.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    }

    window.agregarAlCarrito = function(id) {
        const productoEncontrado = productos.find(p => p.id === id);
        if (!productoEncontrado) return;

        const existente = carrito.find(item => item.id === id);
        if (existente) {
            existente.cantidad += 1;
        } else {
            carrito.push({ ...productoEncontrado, cantidad: 1 });
        }
        guardarCarrito();
        abrirCarritoModal();
    }

    window.cambiarCantidad = function(id, delta) {
        const item = carrito.find(i => i.id === id);
        if (item) {
            item.cantidad += delta;
            if (item.cantidad <= 0) {
                carrito = carrito.filter(i => i.id !== id);
            }
            guardarCarrito();
            renderizarCarritoModal();
        }
    }

    // Modal / Drawer del Carrito UI
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const openCartBtn = document.getElementById('openCartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    function abrirCarritoModal() {
        if (cartDrawer && cartOverlay) {
            renderizarCarritoModal();
            cartDrawer.classList.remove('translate-x-full');
            cartOverlay.classList.remove('hidden');
        }
    }

    function cerrarCarritoModal() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.add('translate-x-full');
            cartOverlay.classList.add('hidden');
        }
    }

    if (openCartBtn) openCartBtn.addEventListener('click', abrirCarritoModal);
    if (closeCartBtn) closeCartBtn.addEventListener('click', cerrarCarritoModal);
    if (cartOverlay) cartOverlay.addEventListener('click', cerrarCarritoModal);

    function renderizarCarritoModal() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (carrito.length === 0) {
            cartItemsContainer.innerHTML = `<p class="text-gray-400 text-center py-8">Tu carrito está vacío.</p>`;
            if (cartTotal) cartTotal.textContent = '$ 0 COP';
            return;
        }

        carrito.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;

            const div = document.createElement('div');
            div.className = "flex items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700";
            div.innerHTML = `
                <img src="${item.imagen}" alt="${item.nombre}" class="w-14 h-14 object-contain">
                <div class="flex-1">
                    <h5 class="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">${item.nombre}</h5>
                    <p class="text-xs text-red-600 dark:text-red-400 font-semibold">$ ${item.precio.toLocaleString()} COP</p>
                    <div class="flex items-center gap-2 mt-1">
                        <button onclick="cambiarCantidad('${item.id}', -1)" class="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-bold">-</button>
                        <span class="text-xs font-semibold">${item.cantidad}</span>
                        <button onclick="cambiarCantidad('${item.id}', 1)" class="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-bold">+</button>
                    </div>
                </div>
                <span class="font-bold text-sm text-gray-800 dark:text-gray-200">$ ${subtotal.toLocaleString()}</span>
            `;
            cartItemsContainer.appendChild(div);
        });

        if (cartTotal) cartTotal.textContent = `$ ${total.toLocaleString()} COP`;
    }

    // Finalizar Compra / Checkout simulado
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (carrito.length === 0) {
                alert('Agrega productos al carrito antes de finalizar la compra.');
                return;
            }
            const totalGeneral = carrito.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
            let resumen = "Hola CubeTrade, quiero realizar el siguiente pedido:%0A";
            carrito.forEach(i => {
                resumen += `- ${i.cantidad}x ${i.nombre} ($ ${(i.precio * i.cantidad).toLocaleString()} COP)%0A`;
            });
            resumen += `%0A*Total a Pagar:* $ ${totalGeneral.toLocaleString()} COP`;

            // Redirigir a WhatsApp de ventas simulado
            window.open(`https://wa.me/573001234567?text=${resumen}`, '_blank');
            
            // Vaciar carrito tras la compra
            carrito = [];
            guardarCarrito();
            cerrarCarritoModal();
        });
    }

    actualizarContadorCarrito();

    // 3. Lógica de la Tienda (tienda.html)
    const gridProductos = document.getElementById('grid-productos');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (gridProductos && typeof productos !== 'undefined') {
        function renderTienda(lista) {
            gridProductos.innerHTML = '';
            if (lista.length === 0) {
                gridProductos.innerHTML = `<p class="col-span-full text-center text-gray-500 py-12">No se encontraron productos.</p>`;
                return;
            }

            lista.forEach(prod => {
                const card = document.createElement('div');
                card.className = "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl transition";
                card.innerHTML = `
                    <div>
                        <img src="${prod.imagen}" alt="${prod.nombre}" class="w-full h-48 object-contain mb-4">
                        <span class="text-xs font-semibold px-2.5 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">${prod.categoria}</span>
                        <h3 class="font-bold text-lg mt-2 mb-1 text-gray-900 dark:text-white">${prod.nombre}</h3>
                        <p class="text-red-600 dark:text-red-400 font-extrabold text-xl mb-4">$ ${prod.precio.toLocaleString()} COP</p>
                    </div>
                    <div class="flex gap-2">
                        <a href="producto.html?id=${prod.id}" class="flex-1 text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-2.5 rounded-lg font-semibold text-sm transition">Ver más</a>
                        <button onclick="agregarAlCarrito('${prod.id}')" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold text-sm transition">Comprar</button>
                    </div>
                `;
                gridProductos.appendChild(card);
            });
        }

        renderTienda(productos);

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(query) || p.categoria.toLowerCase().includes(query));
                renderTienda(filtrados);
            });
        }

        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('bg-red-600', 'text-white'));
                filterButtons.forEach(b => b.classList.add('bg-gray-100', 'dark:bg-gray-800'));
                e.target.classList.remove('bg-gray-100', 'dark:bg-gray-800');
                e.target.classList.add('bg-red-600', 'text-white');

                const cat = e.target.getAttribute('data-category');
                if (cat === 'Todos') {
                    renderTienda(productos);
                } else {
                    renderTienda(productos.filter(p => p.categoria === cat));
                }
            });
        });
    }

    // 4. Lógica de la Página Individual de Producto (producto.html)
    const detalleProducto = document.getElementById('detalle-producto');
    if (detalleProducto && typeof productos !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const prodId = urlParams.get('id');
        const productoActual = productos.find(p => p.id === prodId);

        if (productoActual) {
            document.title = `CubeTrade | ${productoActual.nombre}`;
            detalleProducto.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div class="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 flex justify-center">
                        <img src="${productoActual.imagen}" alt="${productoActual.nombre}" class="max-h-80 object-contain">
                    </div>
                    <div>
                        <span class="text-xs font-semibold px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">${productoActual.categoria}</span>
                        <h1 class="text-3xl md:text-4xl font-extrabold mt-3 mb-2 text-gray-900 dark:text-white">${productoActual.nombre}</h1>
                        <p class="text-2xl font-bold text-red-600 dark:text-red-400 mb-6">$ ${productoActual.precio.toLocaleString()} COP</p>
                        <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">${productoActual.descripcion}</p>
                        <button onclick="agregarAlCarrito('${productoActual.id}')" class="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold transition shadow-md">Añadir al Carrito</button>
                    </div>
                </div>
            `;

            const commentForm = document.getElementById('commentForm');
            const commentsContainer = document.getElementById('commentsContainer');
            const storageKey = `comentarios_${prodId}`;

            function cargarComentarios() {
                const guardados = JSON.parse(localStorage.getItem(storageKey)) || [];
                commentsContainer.innerHTML = '';
                if (guardados.length === 0) {
                    commentsContainer.innerHTML = `<p class="text-gray-400 text-sm italic">No hay comentarios aún. ¡Sé el primero en opinar sobre este cubo!</p>`;
                    return;
                }
                guardados.forEach(c => {
                    const div = document.createElement('div');
                    div.className = "bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700";
                    div.innerHTML = `
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-bold text-sm text-gray-900 dark:text-white">${escapeHtml(c.nombre)}</span>
                            <span class="text-xs text-gray-400">${c.fecha}</span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">${escapeHtml(c.texto)}</p>
                    `;
                    commentsContainer.appendChild(div);
                });
            }

            cargarComentarios();

            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const nombre = document.getElementById('commentName').value;
                const texto = document.getElementById('commentText').value;
                const fecha = new Date().toLocaleDateString();

                const guardados = JSON.parse(localStorage.getItem(storageKey)) || [];
                guardados.unshift({ nombre, texto, fecha });
                localStorage.setItem(storageKey, JSON.stringify(guardados));

                commentForm.reset();
                cargarComentarios();
            });

        } else {
            detalleProducto.innerHTML = `<div class="text-center py-20"><h2 class="text-2xl font-bold mb-4">Producto no encontrado</h2><a href="tienda.html" class="text-red-600 underline">Volver a la tienda</a></div>`;
        }
    }

    // 5. Lógica de la Zona de Trade Avanzada (trade.html)
    const tradeForm = document.getElementById('tradeForm');
    const tradeListContainer = document.getElementById('tradeListContainer');
    const filterCity = document.getElementById('filterCity');

    const tradesIniciales = [
        { nombre: "Mateo Pérez", ciudad: "Medellín", ofrece: "GAN 356 M (9/10)", busca: "Megaminx magnético", contacto: "3109876543" },
        { nombre: "Sofía Gómez", ciudad: "Bogotá", ofrece: "QiYi Clock con imanes", busca: "4x4 o 5x5 magnético", contacto: "@sofia_cubes" },
        { nombre: "Andrés Restrepo", ciudad: "Cali", ofrece: "MoYu RS3 M 2021", busca: "Pyraminx magnético", contacto: "3201234567" }
    ];

    function renderTrades(lista) {
        if (!tradeListContainer) return;
        tradeListContainer.innerHTML = '';
        lista.forEach(t => {
            let contactBtn = '';
            if (/^\d{10}$/.test(t.contacto)) {
                const msg = encodeURIComponent(`Hola ${t.nombre}, vi tu anuncio en CubeTrade y me interesa cambiar tu ${t.ofrece} por mi ${t.busca}. ¿Hacemos el negocio?`);
                contactBtn = `<a href="https://wa.me/57${t.contacto}?text=${msg}" target="_blank" class="inline-block bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">💬 Contactar por WhatsApp</a>`;
            } else {
                contactBtn = `<span class="text-xs font-medium text-gray-500 dark:text-gray-400">Contacto: <strong class="text-red-600">${escapeHtml(t.contacto)}</strong></span>`;
            }

            const card = document.createElement('div');
            card.className = "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition";
            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="font-bold text-lg text-gray-900 dark:text-white">${escapeHtml(t.nombre)}</h4>
                        <span class="text-xs text-gray-500 dark:text-gray-400">📍 ${escapeHtml(t.ciudad)}</span>
                    </div>
                    <span class="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full">Trueque Activo</span>
                </div>
                <div class="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-4">
                    <div>
                        <p class="text-xs text-gray-400 font-medium uppercase">Ofrece</p>
                        <p class="text-sm font-bold text-gray-800 dark:text-gray-200">${escapeHtml(t.ofrece)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-400 font-medium uppercase">Busca</p>
                        <p class="text-sm font-bold text-gray-800 dark:text-gray-200">${escapeHtml(t.busca)}</p>
                    </div>
                </div>
                <div class="flex justify-end">${contactBtn}</div>
            `;
            tradeListContainer.appendChild(card);
        });
    }

    if (tradeListContainer) {
        renderTrades(tradesIniciales);

        if (tradeForm) {
            tradeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const nuevoTrade = {
                    nombre: document.getElementById('tradeName').value,
                    ciudad: document.getElementById('tradeCity').value,
                    ofrece: document.getElementById('cubeOffered').value,
                    busca: document.getElementById('cubeWanted').value,
                    contacto: document.getElementById('tradeContact').value
                };
                tradesIniciales.unshift(nuevoTrade);
                renderTrades(tradesIniciales);
                tradeForm.reset();
                alert('¡Tu propuesta de trade se ha publicado en el muro exitosamente!');
            });
        }

        if (filterCity) {
            filterCity.addEventListener('change', (e) => {
                const ciudadSeleccionada = e.target.value;
                if (ciudadSeleccionada === 'Todas') {
                    renderTrades(tradesIniciales);
                } else {
                    renderTrades(tradesIniciales.filter(t => t.ciudad.toLowerCase() === ciudadSeleccionada.toLowerCase()));
                }
            });
        }
    }
});

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}