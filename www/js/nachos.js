function mostrarPedido() {
    const ingredientes = [];
    document.querySelectorAll('#formNachos input:checked').forEach(el => {
      ingredientes.push(el.value);
    });

    const resultado = document.getElementById('resultado');

    if (ingredientes.length === 0) {
      resultado.innerHTML = `
        <p class="text-danger mt-3">⚠️ Debes seleccionar al menos un ingrediente.</p>
      `;
      return;
    }

    // ✅ Crear objeto del pedido de nachos
    const pedido = {
      nombre: "Nachos personalizados",
      tipo: "Snack",
      contenedor: "Plato",
      sabores: ingredientes, // usamos la misma propiedad que para los helados
      cantidad: 1,
      precio: 45 // precio base
    };

    // ✅ Obtener el carrito actual o crear uno nuevo
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // Agregar el pedido al carrito
    carrito.push(pedido);

    // Guardar en localStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));

    // ✅ Mostrar mensaje de confirmación
    resultado.innerHTML = `
      <div class="alert alert-success mt-3" role="alert">
        <h5>✅ Pedido agregado al carrito</h5>
        <p><strong>Nachos con:</strong> ${ingredientes.join(", ")}</p>
        <a href="carrito.html" class="btn btn-primary mt-2">
          <i class="bi bi-cart-fill"></i> Ver carrito
        </a>
      </div>
    `;
  }