 // 💧 Paletas de agua
    const paletasAgua = [
      { nombre: "Fresa", color: "#ff7ea8" },
      { nombre: "Limón", color: "#e1ff6b" },
      { nombre: "Mango", color: "#ffb347" },
      { nombre: "Tamarindo", color: "#b3541e" },
      { nombre: "Uva", color: "#9b59b6" },
      { nombre: "Sandía", color: "#ff4d4d" },
      { nombre: "Piña", color: "#fcd56d" },
      { nombre: "Guayaba", color: "#ffa6c9" }
    ];

    // 🥛 Paletas de leche
    const paletasLeche = [
      { nombre: "Coco", color: "#fff9f0" },
      { nombre: "Nuez", color: "#d7b899" },
      { nombre: "Chocolate", color: "#5a3e36" },
      { nombre: "Vainilla", color: "#fdf5c9" },
      { nombre: "Fresa con crema", color: "#ffc0cb" },
      { nombre: "Galleta", color: "#c9b49b" },
      { nombre: "Cajeta", color: "#d98b4c" }
    ];

    // Renderizar las paletas
    document.addEventListener("DOMContentLoaded", () => {
      generarSeccion("paletasAgua", paletasAgua, 18);
      generarSeccion("paletasLeche", paletasLeche, 22);
    });

    function generarSeccion(id, lista, precio) {
      const contenedor = document.getElementById(id);
      lista.forEach((paleta, index) => {
        const card = document.createElement("div");
        card.className = "col-6 col-md-4 col-lg-3";
        card.innerHTML = `
          <div class="paleta-card">
            <div class="color-preview" style="background-color: ${paleta.color}"></div>
            <h5>${paleta.nombre}</h5>
            <p class="text-muted">$${precio}.00 MXN</p>
            <div class="d-flex justify-content-center align-items-center mb-2">
              <button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad('${id}', ${index}, -1)">−</button>
              <span id="cantidad-${id}-${index}" class="mx-2">1</span>
              <button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad('${id}', ${index}, 1)">+</button>
            </div>
            <button class="btn btn-agregar" onclick="agregarAlCarrito('${id}', ${index}, ${precio})">
              <i class="bi bi-cart-plus"></i> Agregar
            </button>
          </div>
        `;
        contenedor.appendChild(card);
      });
    }

    function cambiarCantidad(id, index, cambio) {
      const cantidadEl = document.getElementById(`cantidad-${id}-${index}`);
      let cantidad = parseInt(cantidadEl.textContent);
      cantidad = Math.max(1, cantidad + cambio);
      cantidadEl.textContent = cantidad;
    }

    function agregarAlCarrito(id, index, precio) {
      const cantidad = parseInt(document.getElementById(`cantidad-${id}-${index}`).textContent);
      const lista = id === "paletasAgua" ? paletasAgua : paletasLeche;
      const paleta = lista[index];

      const producto = {
        nombre: `Paleta ${paleta.nombre}`,
        tipo: id === "paletasAgua" ? "Paleta de Agua" : "Paleta de Leche",
        sabores: [paleta.nombre],
        cantidad,
        precio
      };

      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      carrito.push(producto);
      localStorage.setItem("carrito", JSON.stringify(carrito));

      alert(`✅ ${cantidad} ${producto.tipo}(s) de ${paleta.nombre} agregada(s) al carrito.`);
    }