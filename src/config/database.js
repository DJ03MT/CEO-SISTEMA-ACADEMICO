import sql from 'mssql';

// 1. Tu configuración de Azure (está perfecta)
const dbConfig = {
    server: process.env.AZURE_SQL_SERVER,
    port: 1433,
    user: process.env.AZURE_SQL_USER,
    password: process.env.AZURE_SQL_PASSWORD,
    database: process.env.AZURE_SQL_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true
    }
};

// 2. Variable para guardar el pool
let pool = null;

/**
 * Función para obtener el pool de conexiones.
 * Si el pool no existe, lo crea. Si ya existe, lo retorna.
 */
export async function getPool() {
    if (pool) {
        return pool; // Retorna el pool existente
    }
    
    try {
        // 3. Conecta y guarda el pool
        pool = await sql.connect(dbConfig);
        
        // Opcional: Verificar la conexión
        await pool.request().query('SELECT 1 as connected');
        
        console.log('✅ Connected to Azure SQL successfully!');
        return pool;
        
    } catch (err) {
        console.error('❌ Error creating connection pool:', err.message);
        pool = null; // Resetea el pool si falla
        throw err;
    }
}

// 4. (Opcional) Exportar sql para no importarlo en todos lados
export { sql };
