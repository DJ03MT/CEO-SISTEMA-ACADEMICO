// Efectos interactivos para el menú de profesores
document.addEventListener('DOMContentLoaded', function() {
    const menuOptions = document.querySelectorAll('.menu-option');
    
    // Efecto de carga escalonada
    menuOptions.forEach((option, index) => {
        option.style.opacity = '0';
        option.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            option.style.transition = 'all 0.5s ease';
            option.style.opacity = '1';
            option.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Efecto de sonido al hacer hover (opcional)
    menuOptions.forEach(option => {
        option.addEventListener('mouseenter', function() {
            // Efecto visual mejorado
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        option.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Efecto de click
        option.addEventListener('click', function(e) {
            // Efecto de pulsación
            this.style.transform = 'translateY(-1px) scale(0.98)';
            
            setTimeout(() => {
                this.style.transform = 'translateY(-3px) scale(1.02)';
            }, 150);
            
            // Agregar loading state
            const originalText = this.innerHTML;
            this.innerHTML = `
                <svg class="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                </svg>
                Cargando...
            `;
            
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 1000);
        });
    });
    
    // Detectar dispositivo táctil
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
        
        // Ajustes específicos para touch
        menuOptions.forEach(option => {
            option.style.padding = '20px 15px';
            option.style.minHeight = '60px';
        });
    }
    
    // Efecto de confeti para logout (solo en desktop)
    const logoutBtn = document.querySelector('.menu-option.logout');
    if (!isTouchDevice) {
        logoutBtn.addEventListener('mouseenter', function() {
            // Efecto visual especial para logout
            this.style.background = 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)';
        });
        
        logoutBtn.addEventListener('mouseleave', function() {
            this.style.background = '';
        });
    }
    
    console.log('🎯 Menú de profesores cargado correctamente');
});

  // Funciones básicas para la interactividad
        function subirNota() {
            const estudiante = document.getElementById('estudiante-nota').value;
            const calificacion = document.getElementById('calificacion').value;
            
            if (!estudiante || !calificacion) {
                alert('Por favor, complete todos los campos obligatorios');
                return;
            }
            
            alert('✅ Nota registrada exitosamente');
            // Aquí iría la lógica para enviar los datos al servidor
        }

        function marcarAsistencia(boton, estado) {
            // Remover clase activa de todos los botones del mismo estudiante
            const buttons = boton.parentElement.querySelectorAll('.btn-attendance');
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Agregar clase activa al botón clickeado
            boton.classList.add('active');
            
            // Aquí iría la lógica para guardar el estado temporalmente
        }

        function guardarAsistencia() {
            alert('✅ Asistencia guardada correctamente');
            // Aquí iría la lógica para enviar todas las asistencias al servidor
        }

        function cerrarSesion() {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                alert('Sesión cerrada. Redirigiendo...');
                redirectToLogout('/logout');
            }
        }

        function cancelarLogout() {
            // Regresar al dashboard
            mostrarSeccion('ver-estudiantes');
        }

        // Navegación entre secciones
        function mostrarSeccion(seccionId) {
            // Ocultar todas las secciones
            document.querySelectorAll('.content-section').forEach(sec => {
                sec.style.display = 'none';
            });
            
            // Mostrar la sección seleccionada
            document.getElementById(seccionId).style.display = 'block';
            
            // Actualizar menú activo
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
            });
            event.target.classList.add('active');
        }

        // Configurar navegación
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                mostrarSeccion(targetId);
            });
        });

        // Mostrar sección por defecto al cargar
        document.addEventListener('DOMContentLoaded', function() {
            mostrarSeccion('ver-estudiantes');
            // Establecer fecha actual por defecto
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('fecha-asistencia').value = today;
        });