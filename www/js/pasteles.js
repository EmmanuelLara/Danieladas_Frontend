  document.addEventListener("DOMContentLoaded", () => {
      const pasteles = [
        { nombre: "Pastel de Chocolate", sabor: "Chocolate", tipo: "Rebanada", precio: 40, imagen: "img/pastel_chocolate.png" },
        { nombre: "Pastel Tres Leches", sabor: "Tres Leches", tipo: "Rebanada", precio: 45, imagen: "img/pastel_tresleches.png" },
        { nombre: "Pastel Fresa con Crema", sabor: "Fresa", tipo: "Rebanada", precio: 42, imagen: "img/pastel_fresa.png" },
        { nombre: "Pastel de Zanahoria", sabor: "Zanahoria", tipo: "Rebanada", precio: 45, imagen: "img/pastel_zanahoria.png" },
        { nombre: "Pastel de Moka", sabor: "Moka", tipo: "Rebanada", precio: 50, imagen: "img/pastel_moka.png" },
        { nombre: "Pastel de Vainilla", sabor: "Vainilla", tipo: "Rebanada", precio: 38, imagen: "img/pastel_vainilla.png" }
      ];

      const contenedor = document.getElementById("pasteles-list");
      pasteles.forEach((p, i) => {
        const div = document.createElement("div");
        div.className = "col-6";
        div.innerHTML = `
          <div class="pastel-card" onclick="agregarAlCarrito(${i})">
            <img src="${p.imagen}" alt="${p.nombre}" class="pastel-img">
            <h5 class="pastel-title mt-2">${p.nombre}</h5>
            <p class="text-muted mb-1">${p.tipo} - ${p.sabor}</p>
            <p class="pastel-precio">$${p.precio}</p>
          </div>
        `;
        contenedor.appendChild(div);
      });

      window.agregarAlCarrito = (i) => {
        const producto = pasteles[i];
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        carrito.push({
          tipo: "Pastel",
          tamano: producto.tipo,
          sabores: [producto.sabor],
          precio: producto.precio,
          cantidad: 1
        });
        localStorage.setItem("carrito", JSON.stringify(carrito));
        alert(`🍰 ${producto.nombre} agregado al carrito`);
      };
    });