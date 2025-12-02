function mostrarPedido() {
    const ingredientes = [];
    document.querySelectorAll('#formNachos input:checked').forEach(el => {
        ingredientes.push(el.value);
    });

    const resultado = document.getElementById('resultado');

    if (ingredientes.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Debes seleccionar al menos un ingrediente.',
            confirmButtonColor: '#d94c7c'
        });
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
    Swal.fire({
        icon: 'success',
        title: '¡Listo!',
        html: `
            <p><strong>Ingredientes:</strong> ${ingredientes.join(", ")}</p>
            <p>Producto agregado al carrito</p>
        `,
        showCancelButton: true,
        confirmButtonText: 'Ver carrito',
        cancelButtonText: 'Seguir comprando',
        confirmButtonColor: '#d94c7c',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "carrito.html";
        }
    });
}