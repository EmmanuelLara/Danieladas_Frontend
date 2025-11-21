// Verificar si es vendedor o admin al cargar
document.addEventListener("DOMContentLoaded", () => {
    verificarVendedor();
    cargarPedidos();
});

function verificarVendedor() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    // Permitimos acceso a vendedores y admins
    if (!usuario || (usuario.rol.toLowerCase() !== "vendedor" && usuario.rol.toLowerCase() !== "admin")) {
        Swal.fire({
            icon: "error",
            title: "Acceso denegado",
            text: "No tienes permisos de vendedor.",
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.location.href = "index.html";
        });
    }
}

async function cargarPedidos() {
    try {
        const res = await api.get("/pedidos");
        // Ordenar: Pendientes primero, luego Preparando, Listo, y al final Entregado
        const ordenEstados = { "Pendiente": 1, "Preparando": 2, "Listo": 3, "Entregado": 4 };
        
        const pedidos = res.data.sort((a, b) => {
            return (ordenEstados[a.estado] || 5) - (ordenEstados[b.estado] || 5);
        });

        const contenedor = document.getElementById("listaPedidos");
        contenedor.innerHTML = "";

        if (pedidos.length === 0) {
            contenedor.innerHTML = `<p class="text-center text-muted">No hay pedidos registrados.</p>`;
            return;
        }

        pedidos.forEach(p => {
            const card = document.createElement("div");
            card.className = "order-card";
            
            // Formatear fecha
            const fecha = new Date(p.fecha).toLocaleString();

            // Generar HTML de productos
            const productosHtml = p.productos.map(prod => `
                <div class="product-item">
                    <strong>${prod.nombre}</strong> (${prod.tipo}) <br>
                    <small class="text-muted">
                        ${prod.contenedor ? `Contenedor: ${prod.contenedor} | ` : ''}
                        ${prod.sabores && prod.sabores.length > 0 ? `Sabores: ${prod.sabores.join(", ")}` : ''}
                    </small>
                    <div class="d-flex justify-content-between mt-1">
                        <span>Cant: ${prod.cantidad}</span>
                        <span>$${prod.precio}</span>
                    </div>
                </div>
            `).join("");

            // Botones de estado
            let botonesEstado = "";
            if (p.estado !== "Entregado") {
                botonesEstado = `
                    <div class="mt-3 d-flex gap-2 justify-content-end border-top pt-2">
                        ${p.estado === 'Pendiente' ? `<button class="btn btn-sm btn-info text-white" onclick="cambiarEstado('${p._id}', 'Preparando')">Preparar</button>` : ''}
                        ${p.estado === 'Preparando' ? `<button class="btn btn-sm btn-success" onclick="cambiarEstado('${p._id}', 'Listo')">Listo</button>` : ''}
                        ${p.estado === 'Listo' ? `<button class="btn btn-sm btn-secondary" onclick="cambiarEstado('${p._id}', 'Entregado')">Entregar</button>` : ''}
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="order-header">
                    <span>Ticket: #${p.ticketId}</span>
                    <span class="badge ${getBadgeClass(p.estado)}">${p.estado}</span>
                </div>
                <div class="order-body">
                    <p class="mb-2"><strong>Cliente:</strong> ${p.usuario ? p.usuario.nombre : 'Anónimo'}</p>
                    <p class="mb-3 text-muted" style="font-size: 0.9rem"><i class="far fa-clock"></i> ${fecha}</p>
                    
                    <div class="bg-light p-2 rounded mb-3">
                        ${productosHtml}
                    </div>

                    <h5 class="text-end text-danger fw-bold">Total: $${p.total}</h5>

                    ${botonesEstado}
                </div>
            `;
            contenedor.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        document.getElementById("listaPedidos").innerHTML = 
            `<div class="alert alert-danger">Error al cargar pedidos</div>`;
    }
}

function getBadgeClass(estado) {
    switch (estado) {
        case 'Pendiente': return 'status-pendiente';
        case 'Preparando': return 'status-preparando';
        case 'Listo': return 'status-listo';
        case 'Entregado': return 'status-entregado';
        default: return 'bg-secondary';
    }
}

async function cambiarEstado(id, nuevoEstado) {
    try {
        await api.put(`/pedidos/${id}`, { estado: nuevoEstado });
        
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
        
        Toast.fire({
            icon: 'success',
            title: `Pedido ${nuevoEstado}`
        });

        cargarPedidos();

    } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
}

function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}
