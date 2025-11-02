import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// ✅ PASO 1: Importa tu módulo de base de datos
import { getPool, sql } from './config/database.js'; // Ruta corregida

// Obtener __dirname equivalente en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000; // Usa el puerto de Azure o 3000 local

// Configuración EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ ===================================
// ✅ RUTA ESTÁTICA (CORREGIDA)
// ✅ ===================================
// Le decimos a Express que sirva archivos estáticos (CSS, JS, img)
// desde la carpeta 'Public' que está UN NIVEL ARRIBA de 'src'.
const staticPath = path.join(__dirname, '/Public'); // <-- Cambié 'public' a 'Public'
app.use(express.static(staticPath));
console.log(`[Ruta Estática] Sirviendo archivos desde: ${staticPath}`);
// ===================================


console.log('🔄 Configurando EJS...');
console.log('📁 Views path:', path.join(__dirname, 'views'));

// Middlewares esenciales
// (ELIMINAMOS la línea estática duplicada que estaba aquí)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de sesiones
app.use(session({
    secret: 'ceo_sistema_secreto_2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Poner en 'true' en producción (Azure)
        maxAge: 24 * 60 * 60 * 1000 // 1 día
    }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuración de Google OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// ✅ PASO 2: Lógica de Passport conectada a la BD
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback" // Ajusta a tu URL de Azure en producción
}, 
async (accessToken, refreshToken, profile, done) => {
    
    const email = profile.emails[0].value;
    console.log(`Intentando autenticar con email: ${email}`);

    try {
        // 1. Obtener el pool de conexión de tu database.js
        const pool = await getPool();

        // 2. Buscar al usuario y su ROL
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query(`
                SELECT 
                    U.ID_Usuario, 
                    U.Email, 
                    R.NombreRol 
                FROM 
                    Usuarios U
                JOIN 
                    Roles R ON U.ID_Rol = R.ID_Rol
                WHERE 
                    U.Email = @email AND U.EstaActivo = 1
            `);

        // 3. Lógica de autorización
        if (result.recordset.length > 0) {
            const dbUser = result.recordset[0];
            
            const user = {
                id: dbUser.ID_Usuario,
                email: dbUser.Email,
                rol: dbUser.NombreRol, // <-- ¡LA CLAVE!
                name: profile.displayName,
                photo: profile.photos[0].value
            };
            console.log(`Éxito: ${user.email} tiene el rol ${user.rol}`);
            return done(null, user); 

        } else {
            // Usuario no encontrado o no activo
            console.log(`Fallo: Email ${email} no está autorizado en la BD.`);
            return done(null, false, { message: 'Email no autorizado.' });
        }

    } catch (err) {
        console.error("Error en la base de datos durante la autenticación", err);
        return done(err, null);
    }
}));


// Serialización del usuario (Guarda el 'user' en la sesión)
passport.serializeUser((user, done) => {
    done(null, user);
}); 

// Deserialización (Lee el 'user' de la sesión en cada request)
passport.deserializeUser((user, done) => {
    done(null, user);
});

// ✅ PASO 3: Middlewares de Autorización
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/?error=not_logged_in');
};

// Middleware para roles específicos
const isSecretaria = (req, res, next) => {
    if (req.isAuthenticated() && (req.user.rol === 'SECRETARIA' || req.user.rol === 'DIRECTOR')) {
        return next();
    }
    res.redirect('/?error=unauthorized');
};

const isProfesor = (req, res, next) => {
    if (req.isAuthenticated() && req.user.rol === 'PROFESORES') {
        return next();
    }
    res.redirect('/?error=unauthorized');
};

const isEstudiante = (req, res, next) => {
    if (req.isAuthenticated() && req.user.rol === 'ESTUDIANTES') {
        return next();
    }
    res.redirect('/?error=unauthorized');
};

// ===================================
// RUTAS DE AUTENTICACIÓN
// ===================================

// 🔐 Rutas de autenticación Google
app.get('/auth/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account' 
    })
);

// ✅ PASO 4: Callback de Google con Redirección por ROL
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/?error=auth_failed' }),
    (req, res) => {
        
        const rol = req.user.rol;
        console.log(`Redirigiendo usuario con rol: ${rol}`);

        // Redirige según el rol guardado en la sesión
        switch (rol) {
            case 'SECRETARIA':
            case 'DIRECTOR':
                res.redirect('/secretaria');
                break;
            case 'PROFESORES':
                res.redirect('/profesores');
                break;
            case 'ESTUDIANTES':
                res.redirect('/estudiantes');
                break;
            case 'ACOMPANATES':
                res.redirect('/acompanantes'); // Asegúrate que esta ruta exista
                break;
            default:
                // Si tiene un rol no reconocido
                req.logout((err) => {
                    res.redirect('/?error=rol_invalido');
                });
        }
    }
);

// 🔓 Cerrar sesión
app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.clearCookie('connect.sid'); // Limpia la cookie de sesión
            res.redirect('/');
        });
    });
});

// ===================================
// RUTAS DE LA APLICACIÓN
// ===================================

// 🏠 Ruta principal - Login
app.get('/', (req, res) => {
    // Si el usuario ya está logueado, redirigir
    if (req.isAuthenticated()) {
        const rol = req.user.rol;
        switch (rol) {
            case 'SECRETARIA':
            case 'DIRECTOR':
                return res.redirect('/secretaria');
            case 'PROFESORES':
                return res.redirect('/profesores');
            case 'ESTUDIANTES':
                return res.redirect('/estudiantes');
            case 'ACOMPANATES':
                return res.redirect('/acompanantes');
            default:
                return res.redirect('/logout');
        }
    }
    
    // Si no está logueado, muestra el login
    const error = req.query.error;
    let errorMessage = null;
    if (error === 'auth_failed') errorMessage = 'Error en la autenticación con Google.';
    if (error === 'not_logged_in') errorMessage = 'Necesitas iniciar sesión para continuar.';
    if (error === 'unauthorized') errorMessage = 'No tienes permisos para acceder a esa página.';
    if (error === 'rol_invalido') errorMessage = 'Tu usuario tiene un rol no reconocido por el sistema.';

    res.render('login', {
        error: errorMessage,
        success: null,
        user: null // No hay usuario en el login
    });
});


// 👨‍🏫 Profesores (Ruta protegida por rol)
app.get('/profesores', isProfesor, (req, res) => {
    res.render('profesores/menu-profesores', {
        user: req.user // Pasa el objeto 'user' a la plantilla
    });
});

// 👨‍🎓 Estudiantes (Ruta protegida por rol)
app.get('/estudiantes', isEstudiante, (req, res) => {
    res.render('estudiantes/menu-estudiantes', {
        user: req.user
    });
});

// 🧾 Secretaría (Ruta protegida por rol)
app.get('/secretaria', isSecretaria, (req, res) => {
    res.render('secretaria/menu-secretaria', {
        user: req.user
    });
});

// (Aquí van el resto de tus rutas '/secretaria/agregar-estudiante', etc.)
// ¡Asegúrate de protegerlas con 'isSecretaria'!
app.get('/secretaria/agregar-estudiante', isSecretaria, (req, res) => {
    res.render('secretaria/AdminEstudiantes/agregar-estudiante', {
        user: req.user
    });
});

app.get('/secretaria/editar-estudiante', isSecretaria, (req, res) => {
    res.render('secretaria/AdminEstudiantes/editar-estudiante', {
        user: req.user
    });
});

// (Tu ruta de ejemplo de editar-profesor)
app.get('/secretaria/editar-profesor', isSecretaria, (req, res) => {
    // ... (Tu lógica para obtener el profesor real de la BD irá aquí) ...
    const profesorEjemplo = { id: 1, nombres: "Juan", apellidos: "Ejemplo" };
    res.render('secretaria/AdminProfesores/editar-profesor', {
        user: req.user,
        profesor: profesorEjemplo
    });
});

app.get('/secretaria/agregar-profesor', isSecretaria, (req, res) => {
    res.render('secretaria/AdminProfesores/agregar-profesor', {
        user: req.user,
        error: req.query.error
    });
});


// Ruta de prueba para verificar EJS
app.get('/test-ejs', (req, res) => {
    res.render('test', { 
        message: '✅ EJS está funcionando correctamente!',
        timestamp: new Date().toISOString()
    });
});


// ✅ PASO 5: Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    // Intentar conectar a la BD al iniciar
    getPool().catch(err => {
        console.error("Fallo al conectar con la BD al inicio:", err);
    });
});

export default app;

