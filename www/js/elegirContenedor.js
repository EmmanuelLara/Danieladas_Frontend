// ===============================
// 🔌 CARGAR CONTENEDORES DESDE LOCALSTORAGE
// ===============================
let contenedores = [];
let contenedorSeleccionado = null;
let tamanoSeleccionado = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarContenedoresDesdeCatalogo();
    inicializarContenedores();
    agregarEventListeners();
});

// ===============================
// 📦 OBTENER CONTENEDORES DEL CATÁLOGO
// ===============================
function cargarContenedoresDesdeCatalogo() {
    const catalogo = JSON.parse(localStorage.getItem("catalogoCompleto"));

    if (!catalogo || !catalogo.contenedores) {
        alert("No se encontró el catálogo. Regresa a la pantalla principal.");
        return;
    }

    contenedores = catalogo.contenedores;
    console.log("📦 Contenedores cargados del catálogo:", contenedores);
}

// ===============================
// 🧱 GENERAR BOTONES DE TAMAÑOS
// ===============================
function inicializarContenedores() {
    contenedores.forEach(cont => {
        const contenedorId = cont.nombre.toLowerCase();
        const tamanosDiv = document.getElementById(`${contenedorId}-tamanos`);

        if (!tamanosDiv) return;

        tamanosDiv.innerHTML = "";

       cont.tamanos.forEach(t => {
    const btn = document.createElement("button");
    btn.className = "btn tamano-btn";
    btn.textContent = `${t.nombre} $${t.precio}`;
    btn.dataset.nombre = t.nombre;
    btn.dataset.precio = t.precio;
    btn.dataset.maxsabores = t.maxSabores; // 👈 IMPORTANTE
    tamanosDiv.appendChild(btn);

        });
    });
}

// ===============================
// 🖱 EVENTOS DE CLIC
// ===============================
function agregarEventListeners() {

    // seleccionar contenedor (vaso, cono, canasta)
    document.querySelectorAll(".contenedor-card").forEach(card => {
        card.addEventListener("click", () => {
            seleccionarContenedor(card.id);
        });
    });

    // botón continuar
    document.getElementById("continuar-btn").addEventListener("click", () => {
        if (!contenedorSeleccionado || !tamanoSeleccionado) {
            alert("Selecciona un contenedor y un tamaño.");
            return;
        }

     localStorage.setItem("contenedorSeleccionado", JSON.stringify({
    tipo: contenedorSeleccionado,
    tamano: tamanoSeleccionado.nombre,
    precio: tamanoSeleccionado.precio,
    maxSabores: tamanoSeleccionado.maxSabores // 👈 AQUI
}));


        window.location.href = "sabores.html";
    });
}

// ===============================
// 🟦 SELECCIONAR CONTENEDOR
// ===============================
function seleccionarContenedor(contenedorId) {

    // limpiar selección anterior
    if (contenedorSeleccionado) {
        document.getElementById(contenedorSeleccionado).classList.remove("selected");

        document
            .querySelectorAll(`#${contenedorSeleccionado}-tamanos .tamano-btn`)
            .forEach(btn => btn.classList.remove("selected"));
    }

    // seleccionar nuevo
    contenedorSeleccionado = contenedorId;
    document.getElementById(contenedorId).classList.add("selected");

    tamanoSeleccionado = null;

    // mostrar continuar
    document.getElementById("continuar-div").style.display = "block";

    // tamaños
    document
        .querySelectorAll(`#${contenedorId}-tamanos .tamano-btn`)
        .forEach(btn => {
            btn.addEventListener("click", function (e) {
                e.stopPropagation();

                document
                    .querySelectorAll(`#${contenedorId}-tamanos .tamano-btn`)
                    .forEach(b => b.classList.remove("selected"));

                this.classList.add("selected");

              tamanoSeleccionado = {
    nombre: this.dataset.nombre,
    precio: parseInt(this.dataset.precio),
    maxSabores: parseInt(this.dataset.maxsabores) // 👈 NUEVO

                };
            });
        });
}

function navigateTo(page) {
    window.location.href = `${page}.html`;
}
