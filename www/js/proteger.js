// ==========================================
// PROTECCIÓN DE RUTAS Y VENTANAS
// ==========================================

// 1. Verificar si hay sesión activa (para todas las páginas protegidas)
function verificarSesion() {
    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!token || !usuario) {
        cerrarSesion();
        return false;
    } else {
        // Si hay sesión, proteger el botón "Atrás" para que no puedan volver al login
        protegerVentana();
        return true;
    }
}

// 2. Verificar si es Admin
function verificarAdmin() {
    if (!verificarSesion()) return; // Stop if no session

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    
    if (!usuario || !usuario.rol || usuario.rol.trim().toLowerCase() !== "admin") {
        Swal.fire({
            icon: "error",
            title: "Acceso denegado",
            text: "No tienes permisos de administrador.",
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            redirigirSegunRol(usuario ? usuario.rol : null);
        });
    }
}

// 3. Verificar si es Vendedor (o Admin, ya que admin puede ver todo)
function verificarVendedor() {
    if (!verificarSesion()) return; // Stop if no session

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    
    if (!usuario || !usuario.rol) {
         cerrarSesion();
         return;
    }

    const rol = usuario.rol.trim().toLowerCase();
    if (rol !== "vendedor" && rol !== "admin") {
        Swal.fire({
            icon: "error",
            title: "Acceso denegado",
            text: "Zona exclusiva para vendedores.",
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            redirigirSegunRol(rol);
        });
    }
}

// 4. Función para cerrar sesión y mandar al login
function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

// 5. Redirigir al usuario a su página correspondiente si intenta entrar donde no debe
// 5. Redirigir al usuario a su página correspondiente si intenta entrar donde no debe
function redirigirSegunRol(rol) {
    if (!rol) {
        window.location.href = "index.html";
        return;
    }
    
    const r = rol.trim().toLowerCase();
    
    if (r === "admin") window.location.href = "admin.html";
    else if (r === "vendedor") window.location.href = "vendedor.html";
    else window.location.href = "index.html";
}

// 6. PROTECCIÓN DE VENTANA (Historial)
// Evita que el usuario use el botón "Atrás" para volver al login estando logueado
// O que use "Adelante" para volver a una página protegida después de salir
function protegerVentana() {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
        window.history.pushState(null, "", window.location.href);
    };
}
