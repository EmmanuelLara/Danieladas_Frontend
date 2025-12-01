// ==========================
// 📌 Lógica Vendedor/Admin
// ==========================

document.addEventListener("DOMContentLoaded", () => {
    verificarVendedor();
    cargarPedidos();
});

// Validar rol del usuario
function verificarVendedor() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const rol = usuario?.rol?.toLowerCase();

    if (!rol || !["vendedor", "admin"].includes(rol)) {
        Swal.fire({
            icon: "error",
            title: "Acceso denegado",
            text: "No tienes permisos para ver pedidos.",
            timer: 1500,
            showConfirmButton: false
        }).then(() => window.location.href = "index.html");
    }
}

// Cargar todos los pedidos
async function cargarPedidos() {
  try {
    const pedidos = await listarTodosPedidos();
    const cont = document.getElementById("listaPedidos");
    cont.innerHTML = "";

    if (!pedidos || pedidos.length === 0) {
      cont.innerHTML = `<p class="text-center text-muted mt-3">No hay pedidos todavía 🍦</p>`;
      return;
    }

    pedidos.forEach(p => {
      const productosHtml = p.productos.map(prod => `
        <div class="product-item">${prod.cantidad}x ${prod.nombre} (${prod.tipo})</div>
      `).join("");

      const total = p.total ?? 0;
      const fecha = new Date(p.fecha).toLocaleDateString();

      cont.innerHTML += `
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

                <div class="order-actions mt-3">
                  <button class="btn btn-warning btn-sm" onclick="cambiarEstado('${p._id}', 'Preparando')">Preparar</button>
                  <button class="btn btn-info btn-sm" onclick="cambiarEstado('${p._id}', 'Listo')">Listo</button>
                  <button class="btn btn-success btn-sm" onclick="cambiarEstado('${p._id}', 'Entregado')">Entregar</button>
                </div>
            </div>
        </div>`;
    });

  } catch (err) {
    console.error("Error cargando pedidos:", err);
    document.getElementById("listaPedidos").innerHTML =
      `<p class="text-danger text-center">Error cargando pedidos</p>`;
  }
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

// Cerrar sesión vendedor


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
