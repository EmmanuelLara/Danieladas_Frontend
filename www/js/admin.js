// Verificar si es admin al cargar
document.addEventListener("DOMContentLoaded", () => {
    verificarAdmin();
    cargarUsuarios();
});

let modalUsuario;



async function cargarUsuarios() {
    try {
        const res = await api.get("/usuarios");
        const usuarios = res.data;
        const tbody = document.getElementById("tablaUsuarios");
        tbody.innerHTML = "";

        usuarios.forEach(u => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${u.nombre}</td>
                <td>${u.email}</td>
                <td>${u.telefono || '-'}</td>
                <td>
                    <span class="badge ${getBadgeClass(u.rol)}">${u.rol.toUpperCase()}</span>
                </td>
                <td class="text-center">
                    <i class="fas fa-edit action-btn btn-edit" onclick="editarUsuario('${u._id}', '${u.nombre}', '${u.email}', '${u.telefono || ''}', '${u.rol}')"></i>
                    <i class="fas fa-trash-alt action-btn btn-delete" onclick="eliminarUsuario('${u._id}')"></i>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
    }
}

function getBadgeClass(rol) {
    switch (rol) {
        case 'admin': return 'bg-danger';
        case 'vendedor': return 'bg-warning text-dark';
        default: return 'bg-info text-dark';
    }
}

function abrirModal() {
    document.getElementById("userId").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("email").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("password").value = "";
    document.getElementById("rol").value = "cliente";
    
    document.getElementById("modalTitle").innerText = "Nuevo Usuario";
    document.getElementById("passHelp").innerText = "Requerido";

    if (!modalUsuario) {
        modalUsuario = new bootstrap.Modal(document.getElementById('userModal'));
    }
    modalUsuario.show();
}

function editarUsuario(id, nombre, email, telefono, rol) {
    document.getElementById("userId").value = id;
    document.getElementById("nombre").value = nombre;
    document.getElementById("email").value = email;
    document.getElementById("telefono").value = telefono || "";
    document.getElementById("password").value = ""; // No mostrar password
    document.getElementById("rol").value = rol;

    document.getElementById("modalTitle").innerText = "Editar Usuario";
    document.getElementById("passHelp").innerText = "Dejar en blanco para mantener la actual";

    if (!modalUsuario) {
        modalUsuario = new bootstrap.Modal(document.getElementById('userModal'));
    }
    modalUsuario.show();
}

async function guardarUsuario() {
    const id = document.getElementById("userId").value;
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const telefono = document.getElementById("telefono").value;
    const password = document.getElementById("password").value;
    const rol = document.getElementById("rol").value;

    if (!nombre || !email) {
        return Swal.fire("Atención", "Nombre y correo son obligatorios", "warning");
    }

    const data = { nombre, email, telefono, rol };
    if (password) data.pass = password; // Solo enviar si se escribió algo

    try {
        if (id) {
            // Actualizar
            await api.put(`/usuarios/${id}`, data);
            Swal.fire("Actualizado", "Usuario modificado correctamente", "success");
        } else {
            // Crear
            if (!password) return Swal.fire("Atención", "La contraseña es obligatoria para nuevos usuarios", "warning");
            await api.post("/usuarios", data);
            Swal.fire("Creado", "Usuario creado correctamente", "success");
        }
        
        modalUsuario.hide();
        cargarUsuarios();

    } catch (err) {
        console.error(err);
        const msg = err.response?.data?.mensaje || "Error al guardar usuario";
        Swal.fire("Error", msg, "error");
    }
}

async function eliminarUsuario(id) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await api.delete(`/usuarios/${id}`);
            Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
            cargarUsuarios();
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "No se pudo eliminar el usuario", "error");
        }
    }
}


