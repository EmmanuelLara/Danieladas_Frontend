document.addEventListener("DOMContentLoaded", () => {
  const infoSeleccion = document.getElementById("infoSeleccion");
  const saboresGrid = document.getElementById("sabores-grid");
  const btnConfirmar = document.getElementById("btnConfirmar");

  const seleccion = JSON.parse(localStorage.getItem("contenedorSeleccionado"));
  if (!seleccion) {
    alert("Primero elige un contenedor.");
    window.location.href = "elegirContenedor.html";
    return;
  }

  infoSeleccion.textContent = `Has elegido un ${seleccion.tipo.toUpperCase()} ${seleccion.tamano} ($${seleccion.precio})`;

  // Sabores con color
  const saboresPorContenedor = {
    vaso: [
      { nombre: "Vainilla", color: "#fff0b3" },
      { nombre: "Fresa", color: "#ffb6c1" },
      { nombre: "Chocolate", color: "#8b4513" },
      { nombre: "Menta", color: "#98ff98" },
      { nombre: "Galleta Oreo", color: "#c0c0c0" },
      { nombre: "Mango", color: "#ffcc33" },
      { nombre: "Nuez", color: "#deb887" }
    ],
    cono: [
      { nombre: "Vainilla", color: "#fff0b3" },
      { nombre: "Chocolate", color: "#8b4513" },
      { nombre: "Napolitano", color: "#f0b6a4" },
      { nombre: "Galleta", color: "#f7e3c1" },
     { nombre: "Fresa", color: "#ffb6c1" },
      { nombre: "Mango", color: "#ffcc33" },
      { nombre: "Nuez", color: "#deb887" },
      { nombre: "Pistache", color: "#93c572" },
      { nombre: "Chocolate Blanco", color: "#fff8dc" },
      { nombre: "Coco", color: "#f5f5dc" }


    ],
    canasta: [
      { nombre: "Fresa", color: "#ffb6c1" },
      { nombre: "Menta", color: "#98ff98" },
      { nombre: "Oreo", color: "#c0c0c0" },
      { nombre: "Nuez", color: "#deb887" },
      { nombre: "Limón", color: "#e6ff66" },
      { nombre: "Mango", color: "#ffcc33" },
      { nombre: "Chocolate Blanco", color: "#fff8dc" }
    ]
  };

  // Límite de sabores según tamaño
  const limiteSabores = {
    "Pequeño": 2,
    "Mediano": 3,
    "Grande": 4,
    "Regular": 1,
    "Doble": 2,
    "Individual": 3,
    "Familiar": 5
  };

  const sabores = saboresPorContenedor[seleccion.tipo] || [];
  const maxSabores = limiteSabores[seleccion.tamano] || 2;
  let saboresSeleccionados = [];

  // Crear tarjetas
sabores.forEach(sabor => {
  const col = document.createElement("div");
  col.className = "col-6 col-md-4 col-lg-3";
  col.innerHTML = `
    <div class="sabor-card text-center">
      <div class="color-preview" style="
        background-color: ${sabor.color};
        border: 2px solid #bdbdbd;
        box-shadow: 0 0 6px rgba(0,0,0,0.15);
        border-radius: 10px;
        width: 80px;
        height: 80px;
        margin: 0 auto 8px;
      "></div>
      <div class="p-2">
        <h6>${sabor.nombre}</h6>
      </div>
    </div>
  `;


    const card = col.querySelector(".sabor-card");
    card.addEventListener("click", () => seleccionarSabor(card, sabor.nombre));

    saboresGrid.appendChild(col);
  });

  function seleccionarSabor(card, sabor) {
    const yaSeleccionado = saboresSeleccionados.includes(sabor);

    if (yaSeleccionado) {
      // Si ya estaba, quitarlo
      saboresSeleccionados = saboresSeleccionados.filter(s => s !== sabor);
      card.classList.remove("selected");
    } else {
      // Si no estaba, agregarlo (solo si no se pasa del límite)
      if (saboresSeleccionados.length < maxSabores) {
        saboresSeleccionados.push(sabor);
        card.classList.add("selected");
      } else {
        alert(`Solo puedes elegir ${maxSabores} sabores para este tamaño.`);
      }
    }

    btnConfirmar.disabled = saboresSeleccionados.length === 0;
  }

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

    alert(`✅ Agregado al carrito:\n${producto.sabores.join(", ")} (${producto.tamano})`);
    window.location.href = "carrito.html";
  };
});

function navigateTo(page) {
  window.location.href = `${page}.html`;
}
