let pasteles = [];

document.addEventListener("DOMContentLoaded", async () => {
    await cargarCatalogo();
    renderizarPasteles();
});

// ===============================
// 📡 CARGAR CATALOGO DESDE API
// ===============================
async function cargarCatalogo() {
    try {
        const r = await api.get("/catalogo");

        pasteles = r.data.pasteles || [];

    } catch (error) {
        alert("Error al cargar pasteles.");
        console.error(error);
    }
}

// ===============================
// 🎂 RENDERIZAR PASTELES
// ===============================
function renderizarPasteles() {
    const contenedor = document.getElementById("pasteles-list");
    contenedor.innerHTML = "";

    pasteles.forEach((p, i) => {
        if (p.disponible === false) return;
        const tarjeta = document.createElement("div");
      tarjeta.className = "col-12 col-sm-6 col-lg-4";

        tarjeta.innerHTML = `
            <div class="pastel-card" onclick="agregarAlCarrito(${i})">
                <img src="${API_URL}/uploads/${p.imagen}" class="pastel-img">
                <h5 class="pastel-title mt-2">${p.nombre}</h5>
                <p class="text-muted mb-1">${p.descripcion}</p>
                <p class="pastel-precio">$${p.precioRebanada} por rebanada</p>
            </div>
        `;

        contenedor.appendChild(tarjeta);
    });
}

// ===============================
// 🛒 AGREGAR AL CARRITO
// ===============================
window.agregarAlCarrito = (i) => {
    const p = pasteles[i];

    const producto = {
        tipo: "Pastel",
        nombre: p.nombre,
        cantidad: 1,
        precio: p.precioRebanada,
        imagen: p.imagen
    };

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.push(producto);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    alert(`🍰 ${p.nombre} agregado al carrito`);
};
