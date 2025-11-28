// ==========================================
//  FUNCIONES DE EDICIÓN PARA PALETAS
// ==========================================

async function editarPaletaPrecio(id, precioActual) {
    const { value: nuevoPrecio } = await Swal.fire({
        title: 'Editar Precio',
        input: 'number',
        inputLabel: 'Nuevo precio',
        inputValue: precioActual,
        showCancelButton: true,
        confirmButtonColor: '#d94c7c',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value || value <= 0) {
                return 'Debes ingresar un precio válido';
            }
        }
    });

    if (nuevoPrecio) {
        try {
            await api.put(`/paletas/${id}`, { precio: parseFloat(nuevoPrecio) });
            
            Swal.fire({
                icon: 'success',
                title: 'Precio actualizado',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500
            });
            
            cargarProductos();
        } catch (error) {
            console.error('Error al actualizar precio:', error);
            Swal.fire('Error', 'No se pudo actualizar el precio', 'error');
        }
    }
}

async function editarPaletaStock(id, stockActual) {
    const { value: nuevoStock } = await Swal.fire({
        title: 'Editar Stock',
        input: 'number',
        inputLabel: 'Nuevo stock',
        inputValue: stockActual,
        showCancelButton: true,
        confirmButtonColor: '#d94c7c',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (value === null || value === '' || value < 0) {
                return 'Debes ingresar un stock válido (0 o mayor)';
            }
        }
    });

    if (nuevoStock !== undefined) {
        try {
            const stockNum = parseInt(nuevoStock);
            const updateData = { stock: stockNum };
            
            // Si el stock es 0, también marcar como no disponible
            if (stockNum === 0) {
                updateData.disponible = false;
            }
            
            await api.put(`/paletas/${id}`, updateData);
            
            const mensaje = stockNum === 0 ? 
                'Stock actualizado a 0. La paleta se marcó como no disponible.' : 
                'Stock actualizado correctamente';
            
            Swal.fire({
                icon: 'success',
                title: mensaje,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
            
            cargarProductos();
        } catch (error) {
            console.error('Error al actualizar stock:', error);
            Swal.fire('Error', 'No se pudo actualizar el stock', 'error');
        }
    }
}
