document.addEventListener("DOMContentLoaded", async () => {
  const infoSeleccion = document.getElementById("infoSeleccion");
  const saboresGrid = document.getElementById("sabores-grid");
  const btnConfirmar = document.getElementById("btnConfirmar");

  // 🔥 Recuperar selección del contenedor
  const seleccion = JSON.parse(localStorage.getItem("contenedorSeleccionado"));
  if (!seleccion) {
    Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: 'Primero elige un contenedor.',
      confirmButtonColor: '#d94c7c'
    }).then(() => {
        window.location.href = "elegirContenedor.html";
    });
    return;
  }

  // 🔥 Aseguramos número válido
  const limiteSabores = Number(seleccion.maxSabores );

  infoSeleccion.textContent = `Has elegido un ${seleccion.tipo.toUpperCase()} ${seleccion.tamano} ($${seleccion.precio}). Máx sabores: ${limiteSabores}`;

  let sabores = [];
  try {
    // 🔥 Cargar lista desde la API
    const response = await api.get('/sabores');
    sabores = response.data; // [{nombre, color, disponible}]
  } catch (error) {
    console.error("Error al cargar sabores:", error);
    return;
  }

  let saboresSeleccionados = [];
  actualizarBoton();

  // 🔥 Crear cards dinámicas
  sabores.forEach(sabor => {
    if (sabor.disponible === false) return;

    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-3";
    col.innerHTML = `
      <div class="sabor-card text-center">
        <div class="color-preview" style="
          background-color: ${sabor.color || '#eee'};
          border: 2px solid #bdbdbd;
          box-shadow: 0 0 6px rgba(0,0,0,0.15);
          border-radius: 10px;
          width: 80px;
          height: 80px;
          margin: 0 auto 8px;
        "></div>
        <h6>${sabor.nombre}</h6>
      </div>
    `;

    const card = col.querySelector(".sabor-card");
    card.addEventListener("click", () => toggleSabor(card, sabor.nombre));
    saboresGrid.appendChild(col);
  });

  // 🔥 Controlar selección con límite
  function toggleSabor(card, nombre) {
    const yaEsta = saboresSeleccionados.includes(nombre);

    if (!yaEsta) {
      if (saboresSeleccionados.length >= limiteSabores) {
        Swal.fire({
          icon: 'info',
          title: 'Límite alcanzado',
          text: `Solo puedes elegir ${limiteSabores} sabores.`,
          confirmButtonColor: '#d94c7c',
          timer: 2000
        });
        return; // ⛔ evita pasar el límite
      }

      saboresSeleccionados.push(nombre);
      card.classList.add("selected");
    } else {
      saboresSeleccionados = saboresSeleccionados.filter(x => x !== nombre);
      card.classList.remove("selected");
    }

    actualizarBoton();
  }

  // 🔥 Cambiar texto y estado del botón
  function actualizarBoton() {
    const restante = limiteSabores - saboresSeleccionados.length;
    btnConfirmar.disabled = saboresSeleccionados.length === 0;
    btnConfirmar.textContent =
      restante > 0
        ? `Confirmar (${restante} sabor(es) restantes)`
        : `Confirmar selección`;
  }

  //  Guardar en carrito
  btnConfirmar.onclick = () => {
    if (saboresSeleccionados.length === 0) return;

    const producto = {
      tipo: seleccion.tipo,
      tamano: seleccion.tamano,
      sabores: saboresSeleccionados,
      precio: seleccion.precio
    };

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.push(producto);
    localStorage.setItem("carrito", JSON.stringify(carrito));

    Swal.fire({
      icon: 'success',
      title: '¡Listo!',
      text: `Agregado al carrito: ${producto.sabores.join(", ")}`,
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
        window.location.href = "carrito.html";
    });
  };
});
