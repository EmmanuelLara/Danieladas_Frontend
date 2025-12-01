// const API = "http://192.168.1.72:4000";
let usuarioActual = {};

// ======================= PERFIL =======================
async function cargarPerfil() {
  try {
    const res = await api.get("/datos");
    const data = res.data;
    usuarioActual = data;

    const img = document.getElementById("fotoPerfil");
    img.src = data.foto
      ? `${API_URL}/uploads/usuarios/${data.foto}`
      : "img/usuario.png";

    document.getElementById("nombreUsuario").textContent = data.nombre;
    document.getElementById("username").textContent = "@" + (data.usuario || "usuario");
    document.getElementById("correo").innerHTML =
      `<i class="bi bi-envelope-fill text-danger"></i> ${data.correo}`;
    document.getElementById("registro").innerHTML =
      `<i class="bi bi-calendar-heart text-danger"></i> Cliente desde: ${data.fechaRegistro?.split("T")[0]}`;
  } catch (err) {
    console.error("Error cargando perfil", err);
    if (err.response?.status === 401) window.location.href = "login.html";
  }
}

function editarPerfil() {
  document.getElementById("inputNombre").value = usuarioActual.nombre || "";
  document.getElementById("inputCorreo").value = usuarioActual.correo || "";
  document.getElementById("inputPass").value = "";

  const img = document.getElementById("previewFoto");
  img.src = usuarioActual.foto
    ? `${API_URL}/uploads/usuarios/${usuarioActual.foto}`
    : "img/usuario.png";

  new bootstrap.Modal('#modalEditarPerfil').show();
}

function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => document.getElementById("previewFoto").src = e.target.result;
  reader.readAsDataURL(file);
}

async function guardarPerfil() {
  try {
    const inputNombre = document.getElementById("inputNombre");
    const inputCorreo = document.getElementById("inputCorreo");
    const inputPass = document.getElementById("inputPass");
    const inputFoto = document.getElementById("inputFoto");

    const formData = new FormData();
    formData.append("nombre", inputNombre.value);
    formData.append("correo", inputCorreo.value);

    if (inputPass.value) formData.append("pass", inputPass.value);
    if (inputFoto.files[0]) formData.append("foto", inputFoto.files[0]);

    await api.put("/datos", formData, { headers: { "Content-Type": "multipart/form-data" } });

    Swal.fire("¡Éxito!", "Perfil actualizado con éxito 🍧", "success");
    bootstrap.Modal.getInstance('#modalEditarPerfil').hide();
    cargarPerfil();

  } catch (err) {
    console.error("Error actualizando perfil", err);
    const msg = err.response?.data?.mensaje || "Error al actualizar perfil";
    Swal.fire("Error", msg, "error");
  }
}

// ======================= PEDIDOS =======================
async function obtenerMisPedidos() {
  const res = await api.get("/pedidos/mios");
  return res.data;
}

async function cargarPedidos() {
  const cont = document.getElementById("listaPedidos");

  try {
    const pedidos = await obtenerMisPedidos();
    console.log('🚀 Pedidos recibidos:', pedidos);

    if (!pedidos.length) {
      cont.innerHTML = `<p class="text-center text-muted">No tienes pedidos aún 🍦</p>`;
      return;
    }

    cont.innerHTML = "";

    pedidos.forEach(p => {
      const productosHtml = p.productos.map(prod =>
        `<li>${prod.cantidad}x ${prod.nombre} (${prod.tipo})</li>`
      ).join("");

      const fecha = new Date(p.fecha).toLocaleDateString();

      cont.innerHTML += `
        <div class="pedido-card">
          <div class="pedido-header d-flex justify-content-between">
             <span>Ticket #${p.ticketId}</span>
             <span class="estado ${p.estado === 'Entregado' ? 'entregado' : ''}">
               ${p.estado}
             </span>
          </div>
          <div class="pedido-detalle">
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Productos:</strong></p>
            <ul>${productosHtml}</ul>
            <p><strong>Total:</strong> $${Number(p.total).toFixed(2)} MXN</p>
          </div>
        </div>`;
    });

  } catch (err) {
    console.error("Error cargando pedidos", err);
    cont.innerHTML = `<p class="text-center text-danger">Error al cargar pedidos</p>`;
  }
}

// ======================= SESIÓN =======================
function cerrarSesion() {
  Swal.fire({
    title: '¿Cerrar sesión?',
    text: "¿Seguro que deseas salir? 🍦",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ff9fd6',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      window.location.href = "login.html";
    }
  });
}

// ======================= INICIO =======================
cargarPerfil();
cargarPedidos();