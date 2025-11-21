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

    // Precio desde catalogo
    const catalogo = JSON.parse(localStorage.getItem("catalogoCompleto"));
    let precioNachos = 45;

    if (catalogo?.nachos?.length > 0) {
        precioNachos = catalogo.nachos[0].precio || 45;
    }

    // Producto para carrito (NO API)
    const pedido = {
        nombre: "Nachos personalizados",
        tipo: "Nachos",
        contenedor: "Plato",
        sabores: ingredientes,
        cantidad: 1,
        precio: precioNachos
    };

    // Guardar en localStorage
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.push(pedido);
    localStorage.setItem("carrito", JSON.stringify(carrito));

    // Mensaje de confirmación
    resultado.innerHTML = `
        <div class="alert alert-success mt-3" role="alert">
            <h5>✅ Producto agregado al carrito</h5>
            <p><strong>Ingredientes:</strong> ${ingredientes.join(", ")}</p>
            <a href="carrito.html" class="btn btn-primary mt-2">
                <i class="bi bi-cart-fill"></i> Ver carrito
            </a>
        </div>
    `;
}
    