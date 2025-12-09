// Sistema de notificaciones para la app
// Notificaciones locales cuando hay cambios de estado

let ultimoEstadoPedidos = new Map(); // Guardar último estado conocido de cada pedido
let notificacionesActivas = true;

// Inicializar sistema de notificaciones
function inicializarNotificaciones() {
  // 1. Web API Standard
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      console.log('Permiso de notificaciones Web:', permission);
    });
  }

  // 2. Android Runtime Permissions (Cordova)
  if (typeof cordova !== 'undefined') {
    document.addEventListener("deviceready", () => {
        const permissions = cordova.plugins.permissions;
        if (permissions) {
            // Para Android 13+ (API 33)
            const POST_NOTIFICATIONS = "android.permission.POST_NOTIFICATIONS";
            
            permissions.checkPermission(POST_NOTIFICATIONS, (status) => {
                if (!status.hasPermission) {
                    console.log("Solicitando permiso POST_NOTIFICATIONS...");
                    permissions.requestPermission(POST_NOTIFICATIONS, 
                        (s) => console.log('Permiso notificaciones otorgado'), 
                        (e) => console.warn('Permiso notificaciones denegado')
                    );
                }
            }, null);
        }
    });
  }
  
  // Guardar preferencia
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario) {
    // Verificar cambios cada 10 segundos
    setInterval(() => {
      if (notificacionesActivas) {
         // Evitar duplicidad si estamos en vendedor.html (vendedor.js ya hace polling)
         if (!window.location.pathname.includes('vendedor.html')) {
             verificarNuevosPedidos();
             verificarCambiosEstado();
         }
      }
    }, 10000);
  }
}

// Verificar nuevos pedidos (para vendedores)
async function verificarNuevosPedidos() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) return;
  
  const rol = usuario.rol?.toLowerCase();
  if (rol !== 'vendedor' && rol !== 'admin') return;
  
  try {
    const response = await api.get('/pedidos/todos');
    const pedidos = response.data;
    
    // Obtener IDs de pedidos ya conocidos
    const idsConocidos = new Set(ultimoEstadoPedidos.keys());
    
    // Buscar nuevos pedidos
    const nuevosPedidos = pedidos.filter(p => !idsConocidos.has(p._id));
    
    if (nuevosPedidos.length > 0) {
      nuevosPedidos.forEach(pedido => {
        mostrarNotificacion(
          '¡Nuevo Pedido!',
          `Ticket #${pedido.ticketId || 'N/A'} - Total: $${pedido.total?.toFixed(2)}`,
          'info'
        );
        ultimoEstadoPedidos.set(pedido._id, pedido.estado);
      });
    }
    
    // Actualizar estados conocidos
    pedidos.forEach(p => {
      ultimoEstadoPedidos.set(p._id, p.estado);
    });
    
    // Cleanup de cache viejo si es necesario...
  } catch (error) {
    console.error('Error verificando nuevos pedidos:', error);
  }
}

// Verificar cambios de estado (para clientes)
async function verificarCambiosEstado() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) return;
  
  const rol = usuario.rol?.toLowerCase();
  if (rol === 'vendedor' || rol === 'admin') return; // Solo para clientes
  
  try {
    const response = await api.get('/pedidos/mios');
    const pedidos = response.data;
    
    pedidos.forEach(pedido => {
      const estadoAnterior = ultimoEstadoPedidos.get(pedido._id);
      const estadoActual = pedido.estado;
      
      if (estadoAnterior && estadoAnterior !== estadoActual) {
        // Hubo un cambio de estado
        if (estadoActual === 'Listo') {
          mostrarNotificacion(
            '¡Tu pedido está listo!',
            `Ticket #${pedido.ticketId || 'N/A'} está listo para recoger`,
            'success'
          );
        } else if (estadoActual === 'Entregado') {
          mostrarNotificacion(
            'Pedido entregado',
            `Ticket #${pedido.ticketId || 'N/A'} ha sido entregado`,
            'success'
          );
        } else if (estadoActual === 'Preparando') {
          mostrarNotificacion(
            'Tu pedido está en preparación',
            `Ticket #${pedido.ticketId || 'N/A'} está siendo preparado`,
            'info'
          );
        }
      }
      
      ultimoEstadoPedidos.set(pedido._id, estadoActual);
    });
    
  } catch (error) {
    console.error('Error verificando cambios de estado:', error);
  }
}

// Mostrar notificación
function mostrarNotificacion(titulo, mensaje, tipo = 'info') {
  // Notificación del navegador si está permitida
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(titulo, {
      body: mensaje,
      icon: 'img/logo.png',
      badge: 'img/logo.png',
      tag: 'pedido-notification',
      requireInteraction: false
    });
  }
  
  // Notificación visual en la app (toast)
  if (typeof Swal !== 'undefined') {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    
    Toast.fire({
      icon: tipo === 'success' ? 'success' : tipo === 'error' ? 'error' : 'info',
      title: titulo,
      text: mensaje
    });
  }
  
  // Guardar en localStorage para mostrarlo más tarde si es necesario
  const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
  notificaciones.push({
    titulo,
    mensaje,
    tipo,
    fecha: new Date().toISOString()
  });
  
  // Mantener solo las últimas 50 notificaciones
  if (notificaciones.length > 50) {
    notificaciones.shift();
  }
  
  localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
}

// Notificar cuando se crea un pedido (llamar desde Carrito.js)
function notificarPedidoCreado(pedido) {
  console.log('Pedido creado, notificaciones se enviarán automáticamente');
}

// Notificar cuando cambia el estado (llamar desde vendedor.js)
function notificarCambioEstado(pedidoId, nuevoEstado) {
  console.log('Estado cambiado, notificaciones se enviarán automáticamente');
}

// Inicializar cuando la página carga
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarNotificaciones);
} else {
  inicializarNotificaciones();
}
