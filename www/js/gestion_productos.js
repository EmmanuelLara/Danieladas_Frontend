let currentTab = 'sabores';
let products = [];

document.addEventListener('DOMContentLoaded', () => {
    // Verificar rol (admin) usando proteger.js
    verificarAdmin();

    cargarProductos();
});

function cambiarTab(tab) {
    currentTab = tab;
    
    // Actualizar UI de tabs
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    cargarProductos();
}

async function cargarProductos() {
    const lista = document.getElementById('listaProductos');
    lista.innerHTML = `
        <div class="text-center py-5 w-100">
            <div class="spinner-border text-pink" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>
    `;

    try {
        const response = await api.get(`/${currentTab}`);
        products = response.data;
        renderizarProductos();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        lista.innerHTML = `<div class="alert alert-danger w-100 text-center">Error al cargar datos</div>`;
    }
}

function renderizarProductos() {
    const lista = document.getElementById('listaProductos');
    lista.innerHTML = '';

    if (products.length === 0) {
        lista.innerHTML = `<div class="alert alert-info w-100 text-center">No hay productos registrados</div>`;
        return;
    }

    products.forEach(p => {
        // Determinar imagen (si existe) o usar placeholder
        let imgUrl = 'img/logo.png'; // Default
        let showImage = true;

        if (currentTab === 'paletas') {
            showImage = false; // No mostrar imagen para paletas
        } else if (currentTab === 'sabores') {
            showImage = false; // No mostrar imagen para sabores, usar color
        } else if (currentTab === 'pasteles') {
            // Usar ruta de uploads del servidor
            if (p.imagen) {
                 imgUrl = `${window.SERVER_BASE_URL}/uploads/${p.imagen}`;
            }
        } else {
            // Otros
            if (p.imagen) imgUrl = p.imagen;
            if (p.img) imgUrl = p.img;
        }

        const isAvailable = p.disponible !== false; // Asumir true si no existe la propiedad o es true
        const badgeClass = isAvailable ? 'bg-available' : 'bg-unavailable';
        const badgeText = isAvailable ? 'Disponible' : 'No Disponible';
        const toggleChecked = isAvailable ? 'checked' : '';
        
        let imgElement = '';
        if (showImage) {
            imgElement = `<img src="${imgUrl}" class="product-img" alt="${p.nombre}" onerror="this.src='img/logo.png'">`;
        } else if (currentTab === 'sabores') {
            const color = p.color || '#e22b5a'; // Default pink
            imgElement = `<div class="product-img d-flex align-items-center justify-content-center" style="background-color: ${color}; color: white; font-size: 2rem;">
                            <i class="fas fa-ice-cream"></i>
                          </div>`;
        }

        // Información adicional para paletas (precio y stock)
        let additionalInfo = '';
        if (currentTab === 'paletas') {
            const stockBadgeClass = p.stock === 0 ? 'badge-stock bg-danger text-white' : 'badge-stock bg-info text-dark';
            additionalInfo = `
                <div class="mb-2">
                    <div class="d-flex justify-content-center align-items-center gap-2 mb-1">
                        <span class="product-price">$${p.precio || 0}</span>
                        <button class="btn btn-sm btn-link p-0 text-primary" onclick="editarPaletaPrecio('${p._id}', ${p.precio || 0})" title="Editar precio">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                    <div class="d-flex justify-content-center align-items-center gap-2">
                        <span class="${stockBadgeClass}">Stock: ${p.stock || 0}</span>
                        <button class="btn btn-sm btn-link p-0 text-primary" onclick="editarPaletaStock('${p._id}', ${p.stock || 0})" title="Editar stock">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        const card = document.createElement('div');
        card.className = 'col-6 col-md-4 col-lg-3';
        card.innerHTML = `
            <div class="product-card h-100">
                ${imgElement}
                <div class="product-body text-center">
                    <h5 class="product-title">${p.nombre}</h5>
                    ${additionalInfo}
                    <div class="mb-2">
                        <span class="badge ${badgeClass}">${badgeText}</span>
                    </div>
                    
                    <div class="d-flex justify-content-center align-items-center gap-2 mt-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" 
                                onchange="toggleDisponibilidad('${p._id}', ${isAvailable})" ${toggleChecked}>
                        </div>
                        <button class="btn btn-sm btn-outline-danger border-0" onclick="eliminarProducto('${p._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        lista.appendChild(card);
    });
}

async function toggleDisponibilidad(id, currentStatus) {
    try {
        // Invertir estado
        const newStatus = !currentStatus;
        
        let data;
        let config = {};

        if (currentTab === 'pasteles') {
            data = new FormData();
            data.append('disponible', newStatus);
            config.headers = { 'Content-Type': 'multipart/form-data' };
        } else {
            data = { disponible: newStatus };
        }

        await api.put(`/${currentTab}/${id}`, data, config);
        
        // Recargar sin mostrar spinner completo para mejor UX, o solo actualizar local
        // Por simplicidad recargamos
        cargarProductos();
        
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500
        });
        Toast.fire({
            icon: 'success',
            title: 'Estado actualizado'
        });

    } catch (error) {
        console.error('Error al actualizar:', error);
        Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
    }
}

async function eliminarProducto(id) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d94c7c',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
        try {
            await api.delete(`/${currentTab}/${id}`);
            Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
            cargarProductos();
        } catch (error) {
            console.error('Error al eliminar:', error);
            Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
        }
    }
}

// ==========================================
//  MODAL Y FORMULARIO
// ==========================================

function abrirModal() {
    document.getElementById('formProducto').reset();
    document.getElementById('prodId').value = '';
    document.getElementById('modalTitle').innerText = `Nuevo ${capitalize(currentTab.slice(0, -1))}`;
    
    const container = document.getElementById('camposDinamicos');
    container.innerHTML = '';

    // Campos específicos según Tab
    if (currentTab === 'sabores') {
        // SaborNieve: nombre, color, disponible
        container.innerHTML += `
            <div class="mb-3">
                <label class="form-label">Color Representativo</label>
                <input type="color" class="form-control form-control-color" id="color" value="#ffffff" title="Elige un color">
            </div>
        `;
    } else if (currentTab === 'paletas') {
        // Paleta: nombre, tipo, precio, color, stock, disponible
        container.innerHTML += `
            <div class="mb-3">
                <label class="form-label">Precio</label>
                <input type="number" class="form-control" id="precio" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Tipo</label>
                <select class="form-select" id="tipo">
                    <option value="agua">Agua</option>
                    <option value="leche">Leche</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Color Representativo</label>
                <input type="color" class="form-control form-control-color" id="color" value="#ff0000" title="Elige un color">
            </div>
            <div class="mb-3">
                <label class="form-label">Stock Inicial</label>
                <input type="number" class="form-control" id="stock" value="0">
            </div>
        `;
    } else if (currentTab === 'pasteles') {
        // Pastel: nombre, descripcion, precioRebanada, imagen (file)
        container.innerHTML += `
            <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" id="descripcion" rows="2"></textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">Precio por Rebanada</label>
                <input type="number" class="form-control" id="precio" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Imagen</label>
                <input type="file" class="form-control" id="imagenFile" accept="image/*">
            </div>
        `;
    }

    const modal = new bootstrap.Modal(document.getElementById('productoModal'));
    modal.show();
}

async function guardarProducto() {
    const nombre = document.getElementById('nombre').value;
    const disponible = document.getElementById('disponible').checked;
    
    if (!nombre) {
        Swal.fire('Atención', 'El nombre es obligatorio', 'warning');
        return;
    }

    let data;
    let isFormData = false;

    if (currentTab === 'pasteles') {
        isFormData = true;
        data = new FormData();
        data.append('nombre', nombre);
        data.append('descripcion', document.getElementById('descripcion').value);
        // Mapear 'precio' del input a 'precioRebanada' del esquema
        data.append('precioRebanada', document.getElementById('precio').value);
        data.append('disponible', disponible); 
        
        const fileInput = document.getElementById('imagenFile');
        if (fileInput.files[0]) {
            data.append('imagen', fileInput.files[0]);
        }
    } else {
        // JSON para los demás
        data = {
            nombre: nombre,
            disponible: disponible
        };

        if (currentTab === 'sabores') {
            data.color = document.getElementById('color').value;
        } else if (currentTab === 'paletas') {
            data.precio = document.getElementById('precio').value;
            data.tipo = document.getElementById('tipo').value; // ya es 'agua' o 'leche'
            data.color = document.getElementById('color').value;
            data.stock = document.getElementById('stock').value;
        }
    }

    try {
        const config = {};
        if (isFormData) {
            config.headers = { 'Content-Type': 'multipart/form-data' };
        }

        await api.post(`/${currentTab}`, data, config);

        // Cerrar modal
        const modalEl = document.getElementById('productoModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        Swal.fire('Guardado', 'Producto agregado correctamente', 'success');
        cargarProductos();

    } catch (error) {
        console.error('Error al guardar:', error);
        Swal.fire('Error', 'No se pudo guardar el producto', 'error');
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
