// main.js

// Volver atrás
function goBack() {
    window.history.back();
}

// Seleccionar categoría
function selectCategory(category) {
    switch(category) {
        case 'Nieves':
            window.location.href = 'elegirContenedor.html';
            break;
        case 'Paletas':
            window.location.href = 'paletas.html';
            break;
        case 'Nachos':
            window.location.href = 'nachos.html';
            break;
        case 'Pasteles':
            window.location.href = 'pasteles.html';
            break;
    }
}

// Navegación inferior
// Navegación inferior
// Navegación inferior
function navigateTo(page) {
    if (page === 'inicio') {
        window.location.href = 'index.html';
    } else if (page === 'cuenta') {
        window.location.href = 'perfil.html';
    } else {
        window.location.href = page + ".html";
    }
}

// Resaltar icono activo según la página actual
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    const page = path.split("/").pop().replace(".html", "") || "index";
    
    // Mapeo de páginas a IDs de botones (data-page)
    // index -> inicio
    // productos, paletas, nachos, pasteles -> productos
    // carrito -> carrito
    // perfil, login, registro -> cuenta
    
    let activePage = "inicio";
    
    if (page === "index" || page === "") activePage = "inicio";
    else if (["productos", "paletas", "nachos", "pasteles", "elegirContenedor", "sabores"].includes(page)) activePage = "productos";
    else if (page === "carrito") activePage = "carrito";
    else if (["perfil", "login", "registro", "admin", "vendedor", "ticket"].includes(page)) activePage = "cuenta";
    
    // Remover activos previos
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
    
    // Activar el correcto
    const activeBtn = document.querySelector(`.nav-link[data-page="${activePage}"]`);
    if (activeBtn) activeBtn.classList.add('active');
});

// Animación
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.categoria-card-mobile');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
});
