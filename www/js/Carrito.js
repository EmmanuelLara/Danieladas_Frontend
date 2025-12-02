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

// 🗑️ Eliminar item (Sin confirmación, solo notificación)
function eliminarItem(index) {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  cargarCarrito();

  // Notificación discreta
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true
  });
  Toast.fire({
    icon: 'success',
    title: 'Producto eliminado'
  });
}

// 🧹 Vaciar carrito con confirmación
function vaciarCarrito() {
    Swal.fire({
        title: '¿Vaciar carrito?',
        text: "Se eliminarán todos los productos",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("carrito");
            cargarCarrito();
            Swal.fire('¡Vacío!', 'Tu carrito ha sido vaciado.', 'success');
        }
    });
}

// 👉 Función para finalizar la compra con validación
async function finalizarCompra() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  
  if (carrito.length === 0) {
    Swal.fire("Carrito vacío", "Agrega productos antes de comprar", "info");
    return;
  }

  // Calcular total para mostrar en la confirmación
  const total = carrito.reduce((sum, p) => {
    const cantidad = p.cantidad || 1;
    return sum + p.precio * cantidad;
  }, 0);

  // Confirmación de compra
  const result = await Swal.fire({
    title: '¿Confirmar compra?',
    html: `
      <p>Estás a punto de realizar tu pedido.</p>
      <h3 class="text-pink fw-bold">Total: $${total.toFixed(2)}</h3>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#e74282', // Color rosa de la marca
    cancelButtonColor: '#6c757d',
    confirmButtonText: '¡Sí, comprar!',
    cancelButtonText: 'Seguir viendo'
  });

  if (!result.isConfirmed) return;

  // Mostrar loading
  Swal.fire({
    title: 'Procesando...',
    text: 'Estamos enviando tu pedido',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    // Preparar datos del pedido
    const pedidoData = {
      ticketId: "T" + Date.now(),
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

    // Enviar al backend
    const respuesta = await crearPedido(pedidoData);
    console.log("Pedido creado:", respuesta);

    const idPedido = respuesta._id || respuesta.pedido?._id || respuesta.id;

    // Éxito
    await Swal.fire({
      icon: 'success',
      title: '¡Pedido Realizado!',
      html: `
        <p>Tu pedido ha sido enviado a cocina.</p>
        <div class="mt-3">
            <a href="ticket.html?id=${idPedido}" target="_blank" class="btn btn-outline-danger w-100">
                <i class="bi bi-receipt"></i> Ver / Descargar Ticket
            </a>
        </div>
      `,
      confirmButtonColor: '#e74282',
      confirmButtonText: 'Ir a Mis Pedidos'
    });

    // Limpiar y redirigir
    localStorage.removeItem("carrito");
    window.location.href = "perfil.html";

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.mensaje || err.message || "No se pudo completar la compra. Intenta de nuevo.",
      confirmButtonColor: '#e74282'
    });
  }
}

