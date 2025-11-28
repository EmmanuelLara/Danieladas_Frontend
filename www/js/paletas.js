let catalogo = {};
let paletasAgua = [];
let paletasLeche = [];

document.addEventListener("DOMContentLoaded", async () => {
    await cargarCatalogo();
    generarSeccion("paletasAgua", paletasAgua);
    generarSeccion("paletasLeche", paletasLeche);
});

// ===============================
// 📡 Cargar catálogo desde API
// ===============================
async function cargarCatalogo() {
    try {
        const r = await api.get("/catalogo");
        catalogo = r.data;

        console.log("📦 Catálogo completo:", catalogo);

        // Separar paletas por tipo
        paletasAgua = catalogo.paletas.filter(p => p.tipo === "agua");
        paletasLeche = catalogo.paletas.filter(p => p.tipo === "leche");

        console.log("💧 Agua:", paletasAgua);
        console.log("🥛 Leche:", paletasLeche);

    } catch (err) {
        console.error("❌ Error al cargar catálogo:", err);
        alert("Error al cargar catálogo");
    }
}

// ===============================
// 🎨 Renderizar paletas
// ===============================
function generarSeccion(id, lista) {

    const contenedor = document.getElementById(id);
    contenedor.innerHTML = "";

    lista.forEach((paleta, index) => {
        if (paleta.disponible === false) return;

        const card = document.createElement("div");
        card.className = "col-6 col-md-4 col-lg-3";

        card.innerHTML = `
            <div class="paleta-card">
             <div class="color-preview" style="background-color: ${paleta.color}">  </div>
                <h5>${paleta.nombre}</h5>
                <p class="text-muted">$${paleta.precio}.00 MXN</p>

                <div class="d-flex justify-content-center align-items-center mb-2">
                    <button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad('${id}', ${index}, -1)">−</button>
                    <span id="cantidad-${id}-${index}" class="mx-2">1</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad('${id}', ${index}, 1)">+</button>
                </div>

                <button class="btn btn-agregar" onclick="agregarAlCarrito('${id}', ${index})">
                    <i class="bi bi-cart-plus"></i> Agregar
                </button>
            </div>
        `;

        contenedor.appendChild(card);
    });
}

// ===============================
// 🔢 Cambiar cantidad
// ===============================
function cambiarCantidad(id, index, cambio) {
    const cantidadEl = document.getElementById(`cantidad-${id}-${index}`);
    let cantidad = parseInt(cantidadEl.textContent);
    cantidad = Math.max(1, cantidad + cambio);
    cantidadEl.textContent = cantidad;
}

// ===============================
// 🛒 Agregar al carrito
// ===============================
function agregarAlCarrito(id, index) {

    const cantidad = parseInt(document.getElementById(`cantidad-${id}-${index}`).textContent);

    const lista = (id === "paletasAgua") ? paletasAgua : paletasLeche;
    const paleta = lista[index];

    const producto = {
        nombre: `Paleta ${paleta.nombre}`,
        tipo: id === "paletasAgua" ? "Paleta de Agua" : "Paleta de Leche",
        sabores: [paleta.nombre],
        cantidad,
        precio: paleta.precio
    };

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.push(producto);
    localStorage.setItem("carrito", JSON.stringify(carrito));

    alert(`✅ ${cantidad} ${producto.tipo}(s) de ${paleta.nombre} agregada(s) al carrito.`);
}
