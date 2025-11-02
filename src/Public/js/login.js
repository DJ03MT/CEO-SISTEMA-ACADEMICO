document.addEventListener('DOMContentLoaded', function() {
    const systemAccountForm = document.getElementById('systemAccountForm');

    // Manejo de envío del formulario
    systemAccountForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Simulación de inicio de sesión
        showMessage('Iniciando sesión...', 'loading');
        setTimeout(() => {
            showMessage('¡Bienvenido al sistema!', 'success');
        }, 1500);
    });

    // Función para mostrar mensajes de estado
    function showMessage(text, type) {
        // Eliminar mensaje anterior
        const existingMessage = document.querySelector('.message');
        if (existingMessage) existingMessage.remove();

        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            message.style.background = 'linear-gradient(to right, #27ae60, #2ecc71)';
        } else if (type === 'loading') {
            message.style.background = 'linear-gradient(to right, #3498db, #2980b9)';
        }

        document.body.appendChild(message);

        // Eliminar mensaje después de 3 segundos
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
});
