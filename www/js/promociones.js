// Logica de promociones

// Guardar la promoción en el usuario o sesión
function activarPromo(codigo) {
    localStorage.setItem("promoActiva", codigo);
    
    let mensaje = "";
    let icono = "success";

    switch(codigo) {
        case "2X1_PALETAS":
            mensaje = "¡Promo 2x1 en Paletas Activada! Agrega paletas a tu carrito.";
            break;
        case "CANASTA_GRATIS":
            mensaje = "¡Canasta Gratis Activada! Compra $200 o más y te la llevas.";
            break;
        case "DESC_10":
            mensaje = "¡10% de Descuento Activado en Paletas!";
            break;
        default:
            mensaje = "Promoción activada";
    }

    Swal.fire({
        title: '¡Genial! 🤩',
        text: mensaje,
        icon: 'success',
        confirmButtonColor: '#ff7fbd',
        confirmButtonText: 'Ir a comprar'
    });
}

// Agregar Combo Directamente
function agregarComboNachos() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    
    const combo = {
        id: "COMBO_NACHOS_" + Date.now(),
        nombre: "Combo Nachos + Canasta",
        tipo: "combo",
        precio: 100,
        cantidad: 1,
        descripcion: "Nachos con queso y una canasta de helado"
    };

    carrito.push(combo);
    localStorage.setItem("carrito", JSON.stringify(carrito));

    Swal.fire({
        title: '¡Combo Agregado! 🧀🍦',
        text: 'Se agregaron Nachos + Canasta a tu carrito por $100.',
        icon: 'success',
        confirmButtonColor: '#ff7fbd',
        confirmButtonText: 'Ver Carrito',
        showCancelButton: true,
        cancelButtonText: 'Seguir viendo'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "carrito.html";
        }
    });
}
