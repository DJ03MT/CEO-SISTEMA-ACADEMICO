// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const options = document.querySelectorAll('.menu-option');

    options.forEach(option => {
        // 🟢 Efecto de onda (ripple)
        option.addEventListener('click', function (e) {
            // Evitar múltiples ondas
            const existingRipple = this.querySelector('.ripple');
            if (existingRipple) existingRipple.remove();

            // Crear span para la onda
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);

            // Calcular posición del clic
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            // Quitar el efecto después de la animación
            setTimeout(() => ripple.remove(), 600);
        });

        // 🟡 Resaltar opción activa (visual)
        option.addEventListener('mouseenter', () => {
            option.classList.add('hovered');
        });
        option.addEventListener('mouseleave', () => {
            option.classList.remove('hovered');
        });
    });

    // 🔵 Marcar enlace activo según la URL
    const currentPath = window.location.pathname.toLowerCase();
    options.forEach(link => {
        if (currentPath === link.getAttribute('href').toLowerCase()) {
            link.classList.add('active');
        }
    });
});
