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
function navigateTo(page) {
    document.querySelectorAll('.nav-link').forEach(btn => 
        btn.classList.remove('active')
    );

    const button = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (button) button.classList.add('active');

    switch(page) {
        case 'inicio':
            window.location.href = 'index.html';
            break;
        case 'productos':
            window.location.href = 'productos.html';
            break;
        case 'carrito':
            window.location.href = 'carrito.html';
            break;
        case 'cuenta':
            window.location.href = 'perfil.html';
            break;
    }
}

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
