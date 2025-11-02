import dotenv from 'dotenv';
dotenv.config();

import app from './server.js';

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`🔐 Google OAuth configurado`);
    console.log(`📧 Ruta de login: http://localhost:${PORT}`);
});