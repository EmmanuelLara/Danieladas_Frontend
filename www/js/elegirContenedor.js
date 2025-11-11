// Datos de los contenedores y sus tamaños
const contenedores = {
    vaso: [
        { nombre: 'Pequeño', precio: 15 },
        { nombre: 'Mediano', precio: 25 },
        { nombre: 'Grande', precio: 35 }
    ],
    cono: [
        { nombre: 'Regular', precio: 20 },
        { nombre: 'Doble', precio: 30 }
    ],
    canasta: [
        { nombre: 'Individual', precio: 25 },
        { nombre: 'Familiar', precio: 45 }
    ]
};

let contenedorSeleccionado = null;
let tamanoSeleccionado = null;

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    inicializarContenedores();
    agregarEventListeners();
});

function inicializarContenedores() {
    // Generar botones de tamaño para cada contenedor
    for (const [contenedorId, tamanos] of Object.entries(contenedores)) {
        const tamanosDiv = document.getElementById(`${contenedorId}-tamanos`);
        tamanosDiv.innerHTML = '';
        
        tamanos.forEach(tamano => {
            const button = document.createElement('button');
            button.className = 'btn tamano-btn';
            button.textContent = `${tamano.nombre} $${tamano.precio}`;
            button.dataset.precio = tamano.precio;
            button.dataset.nombre = tamano.nombre;
            tamanosDiv.appendChild(button);
        });
    }
}

function agregarEventListeners() {
    // Event listeners para los contenedores
    document.querySelectorAll('.contenedor-card').forEach(card => {
        card.addEventListener('click', function() {
            seleccionarContenedor(this.id);
        });
    });

    // Event listener para el botón continuar
    document.getElementById('continuar-btn').addEventListener('click', function() {
        if (contenedorSeleccionado && tamanoSeleccionado) {
            // Guardar selección y redirigir
            localStorage.setItem('contenedorSeleccionado', JSON.stringify({
                tipo: contenedorSeleccionado,
                tamano: tamanoSeleccionado.nombre,
                precio: tamanoSeleccionado.precio
            }));
            window.location.href = 'sabores.html';
        }
    });
}

function seleccionarContenedor(contenedorId) {
    // Deseleccionar contenedor anterior
    if (contenedorSeleccionado) {
        document.getElementById(contenedorSeleccionado).classList.remove('selected');
        // Limpiar selección de tamaños del contenedor anterior
        document.querySelectorAll(`#${contenedorSeleccionado}-tamanos .tamano-btn`).forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    // Seleccionar nuevo contenedor
    contenedorSeleccionado = contenedorId;
    document.getElementById(contenedorId).classList.add('selected');
    
    // Mostrar botón continuar
    document.getElementById('continuar-div').style.display = 'block';
    
    // Resetear tamaño seleccionado
    tamanoSeleccionado = null;
    
    // Agregar event listeners a los botones de tamaño del contenedor seleccionado
    document.querySelectorAll(`#${contenedorId}-tamanos .tamano-btn`).forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que el click se propague al contenedor
            
            // Deseleccionar otros botones de tamaño
            document.querySelectorAll(`#${contenedorId}-tamanos .tamano-btn`).forEach(b => {
                b.classList.remove('selected');
            });
            
            // Seleccionar este botón
            this.classList.add('selected');
            
            // Guardar tamaño seleccionado
            tamanoSeleccionado = {
                nombre: this.dataset.nombre,
                precio: parseInt(this.dataset.precio)
            };
        });
    });
}

// Función para navegación (debes implementar según tu estructura)
function navigateTo(page) {
    // Implementa la navegación según tu aplicación
    console.log(`Navegar a: ${page}`);
    // Ejemplo: window.location.href = `${page}.html`;
}