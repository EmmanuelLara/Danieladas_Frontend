function verificarAdmin() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.rol.toLowerCase() !== "admin") {
        Swal.fire({
            icon: "error",
            title: "Acceso denegado",
            text: "No tienes permisos para estar aquí.",
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.location.href = "index.html";
        });
    }
}
