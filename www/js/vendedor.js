// ==========================
// 📌 Lógica Vendedor/Admin
// ==========================

let pedidosCache = []; // Cache local de pedidos
let knownOrderIds = new Set(); // IDs de pedidos ya conocidos
let isFirstLoad = true; // Para evitar notificaciones al cargar la página

// Iniciar polling cada 10 segundos
setInterval(verificarNuevosPedidos, 10000);

// Cargar todos los pedidos
async function cargarPedidos() {
  try {
    const pedidos = await listarTodosPedidos();
    pedidosCache = pedidos; // Guardar en cache
    
    // Actualizar lista de IDs conocidos
    if (isFirstLoad) {
        pedidos.forEach(p => knownOrderIds.add(p._id));
        isFirstLoad = false;
    }

    renderizarPedidos(pedidos);

  } catch (err) {
    console.error("Error cargando pedidos:", err);
    document.getElementById("listaPedidos").innerHTML =
      `<p class="text-danger text-center">Error cargando pedidos</p>`;
  }
}

// Verificar si hay nuevos pedidos (Polling)
async function verificarNuevosPedidos() {
    try {
        const pedidos = await listarTodosPedidos();
        let nuevos = [];

        pedidos.forEach(p => {
            if (!knownOrderIds.has(p._id)) {
                nuevos.push(p);
                knownOrderIds.add(p._id);
            }
        });

        if (nuevos.length > 0) {
            // Actualizar cache y UI
            pedidosCache = pedidos;
            renderizarPedidos(pedidos);

            // Notificar el último pedido nuevo
            const ultimoNuevo = nuevos[0]; // Tomamos el primero que encontremos
            mostrarNotificacionNuevoPedido(ultimoNuevo);
            
            // Reproducir sonido (opcional)
            // playNotificationSound();
        } else {
            // Si no hay nuevos, solo actualizamos cache por si cambiaron estados
            // pero sin redibujar todo si no es necesario para no parpadear
            // Opcional: comparar estados para actualizar UI
            pedidosCache = pedidos;
            renderizarPedidos(pedidos); 
        }

    } catch (error) {
        console.error("Error en polling:", error);
    }
}

// Renderizar lista de pedidos
function renderizarPedidos(pedidos) {
    const cont = document.getElementById("listaPedidos");
    
    if (!pedidos || pedidos.length === 0) {
      cont.innerHTML = `<p class="text-center text-muted mt-3">No hay pedidos todavía 🍦</p>`;
      return;
    }

    // Guardar posición del scroll si es necesario, o simplemente reconstruir
    // Aquí reconstruimos todo. Idealmente usaríamos un framework reactivo, pero esto funciona.
    let html = "";
    
    pedidos.forEach(p => {
      const productosHtml = p.productos.map(prod => `
        <div class="product-item">${prod.cantidad}x ${prod.nombre} (${prod.tipo})</div>
      `).join("");

      const total = p.total ?? 0;
      const fecha = new Date(p.fecha).toLocaleDateString();

      html += `
        <div class="order-card fade-in" id="pedido-${p._id}">
            <div class="order-header">
                <span><i class="fas fa-ticket-alt"></i> Ticket #${p.ticketId || "Sin ID"}</span>
                <span class="status-badge ${getBadgeClass(p.estado)}">${p.estado}</span>
            </div>

            <div class="order-body">
                <p><strong>📅 Fecha:</strong> ${fecha}</p>
                <p><strong>🍧 Productos:</strong></p>
                ${productosHtml}

                <p class="order-total">Total: $${Number(total).toFixed(2)} MXN</p>

                <div class="order-actions mt-3 d-flex flex-wrap gap-2">
                  <button class="btn btn-outline-primary btn-sm" onclick="seleccionarPedido('${p._id}')">
                    <i class="fas fa-eye"></i> Ver
                  </button>
                  <button class="btn btn-warning btn-sm" onclick="cambiarEstado('${p._id}', 'Preparando')">Preparar</button>
                  <button class="btn btn-info btn-sm" onclick="cambiarEstado('${p._id}', 'Listo')">Listo</button>
                  <button class="btn btn-success btn-sm" onclick="cambiarEstado('${p._id}', 'Entregado')">Entregar</button>
                </div>
            </div>
        </div>`;
    });
    
    cont.innerHTML = html;
}

// Mostrar notificación de NUEVO pedido
function mostrarNotificacionNuevoPedido(pedido) {
    const notifText = document.getElementById("notif-text");
    notifText.innerHTML = `<strong>¡Nuevo Pedido!</strong> <br> Ticket #${pedido.ticketId || "Sin ID"}`;

    const btnOpen = document.getElementById("notif-open-btn");
    btnOpen.onclick = () => abrirDetallePedido(pedido._id);

    const notif = document.getElementById("floating-notification");
    notif.classList.remove("d-none");
    
    // Animación de entrada
    notif.classList.add("animate__animated", "animate__bounceInUp");
}

// Seleccionar pedido manualmente
function seleccionarPedido(id) {
    const pedido = pedidosCache.find(p => p._id === id);
    if (!pedido) return;

    const notifText = document.getElementById("notif-text");
    notifText.innerHTML = `<strong>Ticket #${pedido.ticketId || "Sin ID"}</strong> - $${pedido.total}`;

    const btnOpen = document.getElementById("notif-open-btn");
    btnOpen.onclick = () => abrirDetallePedido(id);

    const notif = document.getElementById("floating-notification");
    notif.classList.remove("d-none");
}

// Cerrar notificación
function cerrarNotificacion() {
    document.getElementById("floating-notification").classList.add("d-none");
}

// Abrir detalle completo del pedido (Modal)
function abrirDetallePedido(id) {
    const pedido = pedidosCache.find(p => p._id === id);
    if (!pedido) return;

    const productosHtml = pedido.productos.map(p => 
        `<li class="mb-1">${p.cantidad}x ${p.nombre} <span class="text-muted">(${p.tipo})</span></li>`
    ).join("");

    Swal.fire({
        title: `Ticket #${pedido.ticketId || "Sin ID"}`,
        html: `
            <div class="text-start fs-6">
                <p><i class="fas fa-user-circle text-pink"></i> <strong>Cliente:</strong> ${pedido.usuario?.nombre || "Cliente"}</p>
                <p><i class="far fa-clock text-pink"></i> <strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString()}</p>
                <hr>
                <p><strong><i class="fas fa-ice-cream text-pink"></i> Productos:</strong></p>
                <ul class="list-unstyled ps-2">${productosHtml}</ul>
                <hr>
                <h3 class="text-end text-pink fw-bold">Total: $${Number(pedido.total).toFixed(2)}</h3>
                <div class="text-center mt-3">
                    <a href="ticket.html?id=${pedido._id}" target="_blank" class="btn btn-outline-dark btn-sm">
                        <i class="fas fa-file-invoice"></i> Ver Ticket
                    </a>
                </div>
            </div>
        `,
        showCloseButton: true,
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#e74282",
        width: '90%',
        customClass: {
            popup: 'rounded-4'
        }
    });
}

// Badge CSS según estado
function getBadgeClass(estado) {
    switch (estado) {
        case 'Pendiente': return 'status-pendiente';
        case 'Preparando': return 'status-preparando';
        case 'Listo': return 'status-listo';
        case 'Entregado': return 'status-entregado';
        default: return '';
    }
}

// Cambiar estado del pedido
async function cambiarEstado(id, nuevoEstado) {
    try {
        await actualizarEstadoPedido(id, nuevoEstado);

        Swal.fire({
            icon: "success",
            title: `Pedido ${nuevoEstado}`,
            timer: 1100,
            showConfirmButton: false
        });

        // Efecto visual al actualizar
        const card = document.getElementById(`pedido-${id}`);
        if (card) {
            card.classList.add("item-updated");
            setTimeout(() => card.classList.remove("item-updated"), 1200);
        }

        cargarPedidos();
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
}

// ==========================
// 📡 Funciones API
// ==========================

// Listar pedidos (Admin/Vendedor)
const listarTodosPedidos = async () => {
    const { data } = await api.get('/pedidos/todos');
    return data;
};

// Actualizar estado del pedido
const actualizarEstadoPedido = async (id, estado) => {
    const { data } = await api.put(`/pedidos/${id}/estado`, { estado });
    return data;
};
