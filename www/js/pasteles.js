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
        console.log("📦 Catalogo cargado:", r.data);

        // Asegurar que existan
        pasteles = r.data.pasteles || [];

        console.log("🍰 Pasteles:", pasteles);

    } catch (error) {
        console.error("❌ Error cargando catálogo:", error);
        alert("Error al cargar pasteles.");
    }
}

// ===============================
// 🎂 RENDERIZAR PASTELES
// ===============================
function renderizarPasteles() {
    const contenedor = document.getElementById("pasteles-list");
    contenedor.innerHTML = "";

    pasteles.forEach((p, i) => {
        const div = document.createElement("div");
        div.className = "col-6";
        
        div.innerHTML = `
          <div class="pastel-card" onclick="agregarAlCarrito(${i})">
            <img src="${p.imagen}" alt="${p.nombre}" class="pastel-img">
            <h5 class="pastel-title mt-2">${p.nombre}</h5>
            <p class="text-muted mb-1">${p.tipo} - ${p.sabor}</p>
            <p class="pastel-precio">$${p.precio}</p>
          </div>
        `;
        
        contenedor.appendChild(div);
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
        tamano: p.tipo,
        sabores: [p.sabor],
        cantidad: 1,
        precio: p.precio,
        imagen: p.imagen
    };

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    carrito.push(producto);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    alert(`🍰 ${p.nombre} agregado al carrito`);
};
