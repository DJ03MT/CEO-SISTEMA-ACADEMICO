import sql from 'mssql';
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

async function mostrarTodosLosEstudiantesCompleto() {
    try {
        const pool = await sql.connect(dbConfig);
        
        const result = await pool.request().query(`
            SELECT 
                GRADO,
                SECCION,
                CODIGO_ESTUDIANTE,
                PRIMER_NOMBRE,
                SEGUNDO_NOMBRE,
                PRIMER_APELLIDO,
                SEGUNDO_APELLIDO,
                CONVERT(VARCHAR, FECHA_NACIMIENTO, 103) as FECHA_NACIMIENTO,
                NACIONALIDAD_MENOR,
                SEXO,
                PESO,
                TALLA,
                DIAGNOSTICO_SALUD,
                DOMICILIO,
                PRIMER_NOMBRE_RESPONSABLE,
                SEGUNDO_NOMBRE_RESPONSABLE,
                PRIMER_APELLIDO_RESPONSABLE,
                SEGUNDO_APELLIDO_RESPONSABLE,
                CONVERT(VARCHAR, FECHA_NACIMIENTO_RESPONSABLE, 103) as FECHA_NACIMIENTO_RESPONSABLE,
                NACIONALIDAD_RESPONSABLE,
                TIPO_DOCUMENTO,
                NUMERO_DOCUMENTO,
                CELULAR,
                HERMANOS_COLEGIO,
                RELIGION,
                OBSERVACION
            FROM Estudiantes 
            ORDER BY GRADO, SECCION, PRIMER_APELLIDO, SEGUNDO_APELLIDO
        `);
        
        console.log('══════════════════════════════════════════════════════════════════════════════════');
        console.log('                            LISTA COMPLETA DE ESTUDIANTES                         ');
        console.log('══════════════════════════════════════════════════════════════════════════════════');
        console.log(`Total de estudiantes registrados: ${result.recordset.length}`);
        console.log('══════════════════════════════════════════════════════════════════════════════════\n');
        
        result.recordset.forEach((estudiante, index) => {
            console.log(`🏫 ESTUDIANTE #${index + 1}`);
            console.log('══════════════════════════════════════════════════════════════════════════════════');
            
            // Información básica del estudiante
            console.log(`📝 INFORMACIÓN PERSONAL:`);
            console.log(`   ▸ Nombre completo: ${estudiante.PRIMER_NOMBRE} ${estudiante.SEGUNDO_NOMBRE || ''} ${estudiante.PRIMER_APELLIDO} ${estudiante.SEGUNDO_APELLIDO || ''}`);
            console.log(`   ▸ Código: ${estudiante.CODIGO_ESTUDIANTE || 'No asignado'}`);
            console.log(`   ▸ Grado/Sección: ${estudiante.GRADO} - ${estudiante.SECCION}`);
            console.log(`   ▸ Fecha nacimiento: ${estudiante.FECHA_NACIMIENTO}`);
            console.log(`   ▸ Sexo: ${estudiante.SEXO === 'M' ? 'Masculino' : 'Femenino'}`);
            console.log(`   ▸ Nacionalidad: ${estudiante.NACIONALIDAD_MENOR}`);
            console.log(`   ▸ Peso/Talla: ${estudiante.PESO || 'N/A'} kg / ${estudiante.TALLA || 'N/A'} cm`);
            console.log(`   ▸ Diagnóstico salud: ${estudiante.DIAGNOSTICO_SALUD || 'Ninguno'}`);
            console.log(`   ▸ Religión: ${estudiante.RELIGION || 'No especificada'}`);
            
            // Información del responsable
            console.log(`👨‍👩‍👧‍👦 RESPONSABLE:`);
            console.log(`   ▸ Nombre: ${estudiante.PRIMER_NOMBRE_RESPONSABLE} ${estudiante.SEGUNDO_NOMBRE_RESPONSABLE || ''} ${estudiante.PRIMER_APELLIDO_RESPONSABLE} ${estudiante.SEGUNDO_APELLIDO_RESPONSABLE || ''}`);
            console.log(`   ▸ Fecha nacimiento: ${estudiante.FECHA_NACIMIENTO_RESPONSABLE || 'No registrada'}`);
            console.log(`   ▸ Nacionalidad: ${estudiante.NACIONALIDAD_RESPONSABLE}`);
            console.log(`   ▸ Documento: ${estudiante.TIPO_DOCUMENTO} - ${estudiante.NUMERO_DOCUMENTO}`);
            console.log(`   ▸ Teléfono: ${estudiante.CELULAR || 'No registrado'}`);
            
            // Información adicional
            console.log(`📍 INFORMACIÓN ADICIONAL:`);
            console.log(`   ▸ Domicilio: ${estudiante.DOMICILIO || 'No registrado'}`);
            console.log(`   ▸ Hermanos en el colegio: ${estudiante.HERMANOS_COLEGIO || 'Ninguno'}`);
            console.log(`   ▸ Observaciones: ${estudiante.OBSERVACION || 'Ninguna'}`);
            
            console.log('──────────────────────────────────────────────────────────────────────────────────\n');
        });
        
        // Mostrar resumen por grados
        const resumenGrados = await pool.request().query(`
            SELECT GRADO, SECCION, COUNT(*) as Cantidad
            FROM Estudiantes 
            GROUP BY GRADO, SECCION
            ORDER BY GRADO, SECCION
        `);
        
        console.log('📊 RESUMEN POR GRADOS:');
        console.log('══════════════════════════════════════════════════════════════════════════════════');
        resumenGrados.recordset.forEach(grado => {
            console.log(`   ▸ ${grado.GRADO}${grado.SECCION}: ${grado.Cantidad} estudiantes`);
        });
        
        await pool.close();
        return result.recordset;
        
    } catch (err) {
        console.error('❌ Error al obtener los estudiantes:', err.message);
        throw err;
    }
}

// Ejecutar la consulta
mostrarTodosLosEstudiantesCompleto()
    .then(() => {
        console.log('✅ Consulta completada exitosamente');
    })
    .catch(err => {
        console.error('❌ Error en la aplicación:', err.message);
    });