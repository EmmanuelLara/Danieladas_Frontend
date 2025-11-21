document.addEventListener("DOMContentLoaded", async () => {
    await cargarCatalogo();
});

// ===============================
// 📡 LLAMAR AL BACKEND
// ===============================
let catalogo = {};

async function cargarCatalogo() {
    try {
        const r = await api.get("/catalogo");
        catalogo = r.data;

        console.log("📦 Catálogo cargado:", catalogo);

        // Guardar catálogo para otras pantallas
        localStorage.setItem("catalogoCompleto", JSON.stringify(catalogo));

    } catch (err) {
        console.error("❌ Error al cargar catálogo:", err);
        alert("Error al cargar el catálogo.");
    }
}

// ===============================
// 🟦 NAVEGAR A LA CATEGORÍA
// ===============================
function selectCategory(cat) {
    console.log("➡ Categoria elegida:", cat);

    // Guardar categoría para la siguiente pantalla
    localStorage.setItem("categoriaSeleccionada", cat);

    switch(cat){
        case "Nieves":
            window.location.href = "elegirContenedor.html";
            break;

        case "Paletas":
            window.location.href = "paletas.html";
            break;

        case "Nachos":
            window.location.href = "nachos.html";
            break;

        case "Pasteles":
            window.location.href = "pasteles.html";
            break;
    }
}

// ===============================
// 🔵 Navegación inferior
// ===============================
function navigateTo(page) {
    window.location.href = `${page}.html`;
}
