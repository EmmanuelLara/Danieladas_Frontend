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
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró el catálogo. Regresa a la pantalla principal.',
            confirmButtonColor: '#d94c7c'
        });
        return;
    }

    contenedores = catalogo.contenedores;
    console.log("📦 Contenedores cargados del catálogo:", contenedores);
}

// ===============================
// 🧱 GENERAR BOTONES DE TAMAÑOS
// ===============================
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
            btn.dataset.maxsabores = t.maxSabores;
            
            // 🔥 CLICK EN TAMAÑO = SELECCIÓN COMPLETA
            btn.addEventListener("click", (e) => {
                e.stopPropagation(); // Evitar que el clic suba a la tarjeta
                seleccionarContenedorYTamano(contenedorId, t, btn);
            });

            tamanosDiv.appendChild(btn);
        });
    });
}

// ===============================
// 🖱 EVENTOS GENERALES
// ===============================
function agregarEventListeners() {
    // Si hacen clic en la tarjeta (pero no en un botón), seleccionamos el contenedor visualmente
    document.querySelectorAll(".contenedor-card").forEach(card => {
        card.addEventListener("click", () => {
            seleccionarContenedorSoloVisual(card.id);
        });
    });

    // Botón continuar
    document.getElementById("continuar-btn").addEventListener("click", () => {
        if (!contenedorSeleccionado || !tamanoSeleccionado) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Selecciona un tamaño para continuar.',
                confirmButtonColor: '#d94c7c'
            });
            return;
        }

        localStorage.setItem("contenedorSeleccionado", JSON.stringify({
            tipo: contenedorSeleccionado,
            tamano: tamanoSeleccionado.nombre,
            precio: tamanoSeleccionado.precio,
            maxSabores: tamanoSeleccionado.maxSabores
        }));

        window.location.href = "sabores.html";
    });
}

// ===============================
// 🟦 SELECCIONAR (LÓGICA UNIFICADA)
// ===============================

// Selecciona contenedor y tamaño de un solo golpe
function seleccionarContenedorYTamano(contenedorId, tamanoObj, btnElement) {
    // 1. Marcar contenedor visualmente
    seleccionarContenedorSoloVisual(contenedorId);

    // 2. Guardar datos
    tamanoSeleccionado = {
        nombre: tamanoObj.nombre,
        precio: parseInt(tamanoObj.precio),
        maxSabores: parseInt(tamanoObj.maxSabores)
    };

    // 3. Marcar botón activo
    // Quitar 'selected' de todos los botones de este contenedor
    document.querySelectorAll(`#${contenedorId}-tamanos .tamano-btn`).forEach(b => b.classList.remove("selected"));
    // Poner 'selected' al clickeado
    btnElement.classList.add("selected");

    // 4. Mostrar botón continuar
    document.getElementById("continuar-div").style.display = "block";
}

// Solo marca el borde de la tarjeta (si clican fuera de los botones)
function seleccionarContenedorSoloVisual(contenedorId) {
    // Si cambia de contenedor, reseteamos todo
    if (contenedorSeleccionado !== contenedorId) {
        // Quitar selección visual anterior
        if (contenedorSeleccionado) {
            const prevCard = document.getElementById(contenedorSeleccionado);
            if(prevCard) prevCard.classList.remove("selected");
            
            // Quitar selección de botones del anterior
            document.querySelectorAll(`#${contenedorSeleccionado}-tamanos .tamano-btn`)
                .forEach(b => b.classList.remove("selected"));
        }
        
        contenedorSeleccionado = contenedorId;
        const newCard = document.getElementById(contenedorId);
        if(newCard) newCard.classList.add("selected");
        
        // Al cambiar de contenedor, se pierde el tamaño seleccionado (hay que elegir uno nuevo)
        tamanoSeleccionado = null;
        document.getElementById("continuar-div").style.display = "none";
    }
}

