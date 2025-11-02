document.addEventListener('DOMContentLoaded', () => {
    // Animación de aparición suave del contenedor
    const container = document.querySelector('.menu-container');
    container.style.opacity = 0;
    container.style.transform = 'translateY(20px)';
    setTimeout(() => {
        container.style.transition = 'all 0.6s ease';
        container.style.opacity = 1;
        container.style.transform = 'translateY(0)';
    }, 100);

    // Confirmación de cierre de sesión
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const confirmLogout = confirm('¿Seguro que deseas cerrar sesión?');
            if (confirmLogout) {
                window.location.href = logoutBtn.getAttribute('href');
            }
        });
    }

    // Efecto visual al hacer clic en una opción
    const menuOptions = document.querySelectorAll('.menu-option');
    menuOptions.forEach(option => {
        option.addEventListener('click', () => {
            option.classList.add('clicked');
            setTimeout(() => option.classList.remove('clicked'), 300);
        });
    });

    // Guardar y resaltar la última opción seleccionada
    const current = localStorage.getItem('menuEstudianteSeleccion');
    if (current) {
        const activeOption = document.querySelector(`.menu-option[href="${current}"]`);
        if (activeOption) activeOption.classList.add('active');
    }

    menuOptions.forEach(option => {
        option.addEventListener('click', () => {
            localStorage.setItem('menuEstudianteSeleccion', option.getAttribute('href'));
        });
    });
});
