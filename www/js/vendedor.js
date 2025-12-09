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
    document.getElementById("listaPedidosActivos").innerHTML =
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
            
             // Trigger system notification if function exists (from notificaciones.js)
            if (typeof mostrarNotificacion === 'function') {
                mostrarNotificacion(
                    '¡Nuevo Pedido!', 
                    `Ticket #${ultimoNuevo.ticketId || 'N/A'} - $${Number(ultimoNuevo.total || 0).toFixed(2)}`,
                    'info'
                );
            }
            
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
    const contActivos = document.getElementById("listaPedidosActivos");
    const contEntregados = document.getElementById("listaPedidosEntregados");
    
    if (!pedidos || pedidos.length === 0) {
      contActivos.innerHTML = `<p class="text-center text-muted mt-3">No hay pedidos todavía 🍦</p>`;
      contEntregados.innerHTML = `<p class="text-center text-muted mt-3">No hay pedidos entregados</p>`;
      return;
    }

    // Separar pedidos
    const activos = pedidos.filter(p => p.estado !== 'Entregado');
    // Ordenar activos: Pendientes primero, luego Preparando, luego Listo
    activos.sort((a, b) => {
        const orden = { 'Pendiente': 1, 'Preparando': 2, 'Listo': 3 };
        return (orden[a.estado] || 4) - (orden[b.estado] || 4);
    });

    const entregados = pedidos.filter(p => p.estado === 'Entregado');
    // Ordenar entregados: Más recientes primero
    entregados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Renderizar Activos
    if (activos.length === 0) {
        contActivos.innerHTML = `<p class="text-center text-muted mt-3">No hay pedidos activos 🎉</p>`;
    } else {
        contActivos.innerHTML = activos.map(p => generarHTMLPedido(p, true)).join("");
    }

    // Renderizar Entregados
    if (entregados.length === 0) {
        contEntregados.innerHTML = `<p class="text-center text-muted mt-3">No hay pedidos entregados recientes</p>`;
    } else {
        contEntregados.innerHTML = entregados.map(p => generarHTMLPedido(p, false)).join("");
    }
}

function generarHTMLPedido(p, esActivo) {
    const productosHtml = p.productos.map(prod => `
        <div class="product-item">${prod.cantidad}x ${prod.nombre} (${prod.tipo})</div>
    `).join("");

    const total = p.total ?? 0;
    const fecha = new Date(p.fecha).toLocaleDateString() + ' ' + new Date(p.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    // Acciones solo si es activo
    let accionesHtml = '';
    if (esActivo) {
        accionesHtml = `
            <div class="order-actions mt-3 d-flex flex-wrap gap-2" id="actions-${p._id}">
                ${p.estado === 'Listo' ? `
                <button class="btn btn-success btn-sm w-100" onclick="cambiarEstado('${p._id}', 'Entregado')">
                    <i class="fas fa-check-circle"></i> Marcar como Entregado
                </button>
                ` : `
                <button class="btn btn-warning btn-sm" onclick="cambiarEstado('${p._id}', 'Preparando')" ${p.estado === 'Preparando' ? 'disabled' : ''}>
                    <i class="fas fa-utensils"></i> Preparar
                </button>
                <button class="btn btn-info btn-sm" onclick="cambiarEstado('${p._id}', 'Listo')" ${p.estado === 'Listo' ? 'disabled' : ''}>
                    <i class="fas fa-check"></i> Listo
                </button>
                `}
                <button class="btn btn-outline-primary btn-sm w-100 mt-2" onclick="verPedidoCompleto('${p._id}')">
                    <i class="fas fa-eye"></i> Ver Pedido Completo
                </button>
            </div>
        `;
    } else {
        // Mensaje para entregados + botón ver
        accionesHtml = `
            <div class="mt-2 text-center text-muted small">
                <i class="fas fa-check-double"></i> Entregado el ${fecha}
            </div>
            <button class="btn btn-outline-secondary btn-sm w-100 mt-2" onclick="verPedidoCompleto('${p._id}')">
                <i class="fas fa-eye"></i> Ver Detalles
            </button>
        `;
    }

    const opacidad = esActivo ? '1' : '0.8';
    const borde = esActivo ? '2px solid #ffd3e5' : '2px solid #ccc';
    const bgHeader = esActivo ? '#ffd3e5' : '#e9ecef';
    const colorHeader = esActivo ? '#d53879' : '#6c757d';

    return `
        <div class="order-card fade-in" id="pedido-${p._id}" style="opacity: ${opacidad}; border: ${borde};">
            <div class="order-header" style="background: ${bgHeader}; color: ${colorHeader};">
                <span><i class="fas fa-ticket-alt"></i> Ticket #${p.ticketId || "Sin ID"}</span>
                <span class="status-badge ${getBadgeClass(p.estado)}">${p.estado}</span>
            </div>

            <div class="order-body">
                <p><strong>📅 Fecha:</strong> ${fecha}</p>
                <p><strong>👤 Cliente:</strong> ${p.usuario?.nombre || 'Cliente'}</p>
                <p><strong>🍧 Productos:</strong></p>
                ${productosHtml}

                <p class="order-total">Total: $${Number(total).toFixed(2)} MXN</p>

                ${accionesHtml}
            </div>
        </div>`;
}

// Mostrar notificación de NUEVO pedido y abrir vista completa
function mostrarNotificacionNuevoPedido(pedido) {
    // Mostrar notificación flotante
    const notifText = document.getElementById("notif-text");
    notifText.innerHTML = `<strong>¡Nuevo Pedido!</strong> <br> Ticket #${pedido.ticketId || "Sin ID"} - $${pedido.total?.toFixed(2)}`;

    const btnOpen = document.getElementById("notif-open-btn");
    btnOpen.onclick = () => verPedidoCompleto(pedido._id);

    const notif = document.getElementById("floating-notification");
    notif.classList.remove("d-none");
    
    // Animación de entrada
    notif.classList.add("animate__animated", "animate__bounceInUp");
    
    // Hacer scroll al pedido en la lista y resaltarlo
    setTimeout(() => {
        const pedidoElement = document.getElementById(`pedido-${pedido._id}`);
        if (pedidoElement) {
            pedidoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Resaltar el pedido con animación
            pedidoElement.style.backgroundColor = 'rgba(255, 159, 214, 0.3)';
            pedidoElement.style.transition = 'background-color 2s ease';
            setTimeout(() => {
                pedidoElement.style.backgroundColor = '';
            }, 2000);
        }
    }, 500);
    
    // Abrir automáticamente la vista completa del pedido
    setTimeout(() => {
        verPedidoCompleto(pedido._id);
    }, 1500);
}

// Seleccionar pedido manualmente (ya no se usa, pero se mantiene por compatibilidad)
function seleccionarPedido(id) {
    abrirDetallePedido(id);
}

// Cerrar notificación
function cerrarNotificacion() {
    document.getElementById("floating-notification").classList.add("d-none");
}

// Abrir detalle completo del pedido (Modal)
async function abrirDetallePedido(id) {
    // Buscar en cache primero
    let pedido = pedidosCache.find(p => p._id === id);
    
    // Si no está en cache, cargarlo desde la API
    if (!pedido) {
        try {
            Swal.fire({
                title: 'Cargando...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            const pedidos = await listarTodosPedidos();
            pedido = pedidos.find(p => p._id === id);
            
            if (!pedido) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo encontrar el pedido',
                    confirmButtonColor: '#e74282'
                });
                return;
            }
            
            // Actualizar cache
            pedidosCache = pedidos;
        } catch (error) {
            console.error('Error cargando pedido:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar el pedido',
                confirmButtonColor: '#e74282'
            });
            return;
        }
    }

    // Construir HTML detallado de productos
    let productosHtml = '';
    if (pedido.productos && Array.isArray(pedido.productos)) {
        pedido.productos.forEach((p, index) => {
            const cantidad = p.cantidad || 1;
            const precio = Number(p.precio) || 0;
            const subtotal = precio * cantidad;
            
            let nombreProducto = p.nombre || p.tipo || "Producto";
            if (p.tamano) nombreProducto += ` (${p.tamano})`;
            
            // Detalles adicionales
            let detalles = [];
            if (p.sabores && p.sabores.length > 0) {
                detalles.push(`<strong>Sabores:</strong> ${p.sabores.join(", ")}`);
            }
            if (p.contenedor) {
                detalles.push(`<strong>Contenedor:</strong> ${p.contenedor}`);
            }
            if (p.ingredientes && p.ingredientes.length > 0) {
                detalles.push(`<strong>Ingredientes:</strong> ${p.ingredientes.join(", ")}`);
            }
            if (p.tipo) {
                detalles.push(`<strong>Tipo:</strong> ${p.tipo}`);
            }
            
            productosHtml += `
                <div class="mb-3 p-2" style="background: #f8f9fa; border-radius: 8px; border-left: 3px solid #ff9fd6;">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <strong>${cantidad}x ${nombreProducto}</strong>
                            ${detalles.length > 0 ? `<div class="mt-1 small text-muted">${detalles.join('<br>')}</div>` : ''}
                        </div>
                        <div class="text-end ms-2">
                            <div class="small text-muted">${cantidad} × $${precio.toFixed(2)}</div>
                            <div class="fw-bold text-pink">$${subtotal.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `;
        });
    } else {
        productosHtml = '<p class="text-muted">No hay productos en este pedido</p>';
    }

    Swal.fire({
        title: `Ticket #${pedido.ticketId || "Sin ID"}`,
        html: `
            <div class="text-start" style="max-height: 60vh; overflow-y: auto;">
                <div class="mb-3">
                    <p><i class="fas fa-user-circle text-pink"></i> <strong>Cliente:</strong> ${pedido.usuario?.nombre || "Cliente"}</p>
                    <p><i class="far fa-clock text-pink"></i> <strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString()}</p>
                    <p><i class="fas fa-info-circle text-pink"></i> <strong>Estado:</strong> <span class="badge ${getBadgeClass(pedido.estado)}">${pedido.estado}</span></p>
                </div>
                <hr>
                <p class="fw-bold mb-2"><i class="fas fa-ice-cream text-pink"></i> Productos:</p>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${productosHtml}
                </div>
                <hr>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <span class="fw-bold">Total:</span>
                    <h4 class="text-pink fw-bold mb-0">$${Number(pedido.total).toFixed(2)} MXN</h4>
                </div>
                <div class="text-center mt-3">
                    <a href="ticket.html?id=${pedido._id}" target="_blank" class="btn btn-outline-dark btn-sm">
                        <i class="fas fa-file-invoice"></i> Ver Ticket Completo
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

        // Si el estado cambió a "Listo", actualizar los botones
        if (nuevoEstado === 'Listo') {
            actualizarBotonesPedido(id);
        }

        cargarPedidos();
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
}

// Actualizar botones cuando el pedido está "Listo"
function actualizarBotonesPedido(pedidoId) {
    const actionsDiv = document.getElementById(`actions-${pedidoId}`);
    if (actionsDiv) {
        actionsDiv.innerHTML = `
            <button class="btn btn-success btn-sm w-100" onclick="cambiarEstado('${pedidoId}', 'Entregado')">
                <i class="fas fa-check-circle"></i> Marcar como Entregado
            </button>
        `;
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

// Ver pedido completo en vista de vendedor
function verPedidoCompleto(pedidoId) {
    window.location.href = `ticket-vendedor.html?id=${pedidoId}`;
}

// ==========================================
// CONFIRMACIÓN DE SALIDA
// ==========================================
function confirmarSalida() {
    Swal.fire({
        title: '¿Qué deseas hacer?',
        text: "¿Estás seguro de que quieres cerrar tu sesión de vendedor?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión',
        confirmButtonColor: '#dc3545',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // CERRAR SESIÓN COMPLETA
            if (typeof cerrarSesion === 'function') {
                cerrarSesion();
            } else {
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                window.location.href = "login.html";
            }
        }
    });
}
