const sql = require('mssql');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración de la conexión a SQL Server
const dbConfig = {
    user: 'sa',
  password: 'Sa21',
  server: '172.25.2.45',
  database: 'appmovil',
  options: {
    encrypt: true, 
    trustServerCertificate: true // Para evitar problemas con certificados autofirmados
  }
};

async function generateImages() {
    try {
        // Conectar a SQL Server
        await sql.connect(dbConfig);

        // Consultar los códigos de canal desde la base de datos
        const result = await sql.query`SELECT CODIGO_CANAL FROM Canal`;

        // Verificar si se obtuvieron resultados
        if (result.recordset.length > 0) {
            for (const row of result.recordset) {
                const codigoCanal = row.CODIGO_CANAL;

                try {
                    // Solicitar la creación de la imagen al servidor local
                    const response = await axios.post('http://localhost:3000/generate-image', {
                        CODIGO_CANAL: codigoCanal
                    }, { responseType: 'arraybuffer' });

                    // Guardar la imagen con el nombre del código de canal
                    const imageName = `${codigoCanal}.png`;
                    const outputPath = path.join(__dirname, 'imagenes', imageName);
                    fs.writeFileSync(outputPath, response.data);
                    console.log(`Imagen guardada: ${imageName}`);
                } catch (error) {
                    console.error(`Error al generar la imagen para el código ${codigoCanal}:`, error.message);
                }
            }
        } else {
            console.log('No se encontraron códigos de canal en la base de datos.');
        }
    } catch (err) {
        console.error('Error al conectarse a la base de datos o realizar la consulta:', err.message);
    } finally {
        // Cerrar la conexión a la base de datos
        sql.close();
    }
}

// Crear el directorio de imágenes si no existe
if (!fs.existsSync(path.join(__dirname, 'imagenes'))) {
    fs.mkdirSync(path.join(__dirname, 'imagenes'));
}

// Ejecutar la función para generar imágenes
generateImages();
