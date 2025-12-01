document.addEventListener("DOMContentLoaded", cargarCarrito);

function cargarCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const vacio = document.getElementById("carrito-vacio");
  const contenido = document.getElementById("carrito-contenido");
  const items = document.getElementById("carrito-items");
  const totalPrecio = document.getElementById("total-precio");

  if (carrito.length === 0) {
    vacio.style.display = "block";
    contenido.style.display = "none";
    return;
  }

  vacio.style.display = "none";
  contenido.style.display = "block";

  items.innerHTML = "";
  let total = 0;

  carrito.forEach((p, i) => {
    const cantidad = p.cantidad || 1;
    const subtotal = p.precio * cantidad;
    total += subtotal;

    let descripcion = "";

    if (p.sabores && p.sabores.length > 0)
      descripcion += `<strong>Sabores:</strong> ${p.sabores.join(", ")}<br>`;
    if (p.contenedor)
      descripcion += `<strong>Contenedor:</strong> ${p.contenedor}<br>`;
    if (p.tipo)
      descripcion += `<strong>Tipo:</strong> ${p.tipo.toUpperCase()} (${p.tamano || 'N/A'})<br>`;

    items.innerHTML += `
      <div class="carrito-item mb-3 p-3 bg-white shadow-sm rounded">
        <div class="item-header d-flex justify-content-between align-items-center">
          <span class="fw-bold">${p.nombre || p.tipo || "Producto"}</span>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminarItem(${i})">
            <i class="bi bi-trash"></i>
          </button>
        </div>

        <div class="item-details mt-2 small">
          ${descripcion || "Sin detalles adicionales."}
          <strong>Precio:</strong> $${p.precio.toFixed(2)}
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

// 🗑️
// Función para eliminar un ítem del carrito (pendiente de implementar)

// 👉 Función para finalizar la compra
async function finalizarCompra() {
  try {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carrito.length === 0) {
      alert("El carrito está vacío. No hay nada que comprar.");
      return;
    }
    // Calcular total
    const total = carrito.reduce((sum, p) => {
      const cantidad = p.cantidad || 1;
      return sum + p.precio * cantidad;
    }, 0);
    // Preparar datos del pedido
    const pedidoData = {
      ticketId: "T" + Date.now(), // Generar ticketId simple
      productos: carrito.map(p => ({
        nombre: p.nombre || p.tipo,
        tipo: p.tipo,
        tamano: p.tamano,
        cantidad: p.cantidad || 1,
        precio: p.precio,
        contenedor: p.contenedor,
        sabores: p.sabores,
        ingredientes: p.ingredientes
      })),
      total: total
    };
    // Enviar al backend usando la función crearPedido de api.js
    const respuesta = await crearPedido(pedidoData);
    console.log("Pedido creado:", respuesta);
    alert("¡Compra finalizada con éxito! 🎉");
    // Redirigir al cliente a su página de pedidos
    window.location.href = "perfil.html";
    // Vaciar carrito
    localStorage.removeItem("carrito");
    cargarCarrito();
    // Opcional: redirigir a ticket de confirmación
    // window.location.href = "ticket.html";
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.mensaje || "Error al finalizar la compra");
  }
}

// Función para eliminar un ítem del carrito
function eliminarItem(index) {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  cargarCarrito();
}

