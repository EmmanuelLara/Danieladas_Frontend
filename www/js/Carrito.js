document.addEventListener("DOMContentLoaded", cargarCarrito);

function cargarCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const vacio = document.getElementById("carrito-vacio");
  const contenido = document.getElementById("carrito-contenido");
  const items = document.getElementById("carrito-items");
  const totalPrecio = document.getElementById("total-precio");

  // 🛒 Si no hay productos
  if (carrito.length === 0) {
    vacio.style.display = "block";
    contenido.style.display = "none";
    return;
  }

  // 📦 Mostrar carrito
  vacio.style.display = "none";
  contenido.style.display = "block";
  items.innerHTML = "";

  let total = 0;

  carrito.forEach((p, i) => {
    const cantidad = p.cantidad || 1;
    const subtotal = p.precio * cantidad;
    total += subtotal;

    let descripcion = "";

    // 🧁 Detalles del producto
    if (p.sabores && p.sabores.length > 0)
      descripcion += `<strong>Sabores:</strong> ${p.sabores.join(", ")}<br>`;
    if (p.contenedor)
      descripcion += `<strong>Contenedor:</strong> ${p.contenedor}<br>`;
    if (p.tipo)
      descripcion += `<strong>Tipo:</strong> ${p.tipo.toUpperCase()} (${p.tamano || 'N/A'})<br>`;

    // 💬 Estructura visual de cada producto
    const itemHTML = `
      <div class="carrito-item mb-3 p-3 bg-white shadow-sm rounded">
        <div class="item-header d-flex justify-content-between align-items-center">
          <span class="fw-bold">${p.nombre || p.tipo || "Producto"}</span>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminarItem(${i})">
            <i class="bi bi-trash"></i>
          </button>
        </div>

        <div class="item-details mt-2 small">
          ${descripcion || "Sin detalles adicionales."}
          <strong>Precio unitario:</strong> $${p.precio.toFixed(2)}
        </div>

        <div class="cantidad-controls mt-2 d-flex justify-content-center align-items-center">
          <button class="btn btn-sm btn-outline-secondary" 
                  onclick="actualizarCantidad(${i}, ${cantidad - 1})" 
                  ${cantidad <= 1 ? "disabled" : ""}>−</button>
          <span class="mx-3">x${cantidad}</span>
          <button class="btn btn-sm btn-outline-secondary" 
                  onclick="actualizarCantidad(${i}, ${cantidad + 1})">+</button>
        </div>

        <div class="text-end mt-2 fw-bold text-danger">
          Subtotal: $${subtotal.toFixed(2)}
        </div>
      </div>
    `;
    items.innerHTML += itemHTML;
  });

  totalPrecio.textContent = `$${total.toFixed(2)}`;
}

// 🔁 Actualizar cantidad
function actualizarCantidad(index, nuevaCantidad) {
  if (nuevaCantidad < 1) return;
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito[index].cantidad = nuevaCantidad;
  localStorage.setItem("carrito", JSON.stringify(carrito));
  cargarCarrito();
}

// 🗑️ Eliminar producto individual
function eliminarItem(index) {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  cargarCarrito();
}

// ❌ Vaciar todo el carrito
function vaciarCarrito() {
  if (confirm("¿Vaciar todo el carrito?")) {
    localStorage.removeItem("carrito");
    cargarCarrito();
  }
}

// 🧾 Finalizar compra
function finalizarCompra() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  if (carrito.length === 0) {
    alert("Tu carrito está vacío 🍦");
    return;
  }

  // 🧩 Crear número único de ticket (hora + random)
  const ticketId = "PED-" + Date.now().toString().slice(-6);

  // 🧾 Crear pedido
  const pedido = {
    ticketId,
    cliente: "Cliente Danieladas",
    fecha: new Date().toLocaleString(),
    productos: carrito,
    total: carrito.reduce((sum, p) => sum + (p.precio * (p.cantidad || 1)), 0),
    estado: "Pendiente"
  };

  // Guardar pedido actual (para ticket.html)
  localStorage.setItem("pedidoActual", JSON.stringify(pedido));

  // 📋 Guardar también en una lista general de pedidos (para el vendedor)
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  pedidos.push(pedido);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));

  // 🧹 Limpiar carrito y redirigir
  localStorage.removeItem("carrito");
  window.location.href = "ticket.html";
}
