const express = require('express');
const sql = require('mssql');
const cors = require('cors'); // Importa el middleware CORS
const puppeteer = require('puppeteer');
const hanaClient = require('@sap/hana-client');
const app = express();
const fs = require('fs'); // Para operaciones basadas en callbacks
const fsPromises = require('fs').promises; // Para operaciones basadas en promesas
const axios = require('axios');
const path = require('path');
const nodemailer = require('nodemailer');


app.use(cors({
    origin: ['http://localhost:3000', 'https://serviciosmovil.siglo21.net:8443']
}));

const config = {
  user: 'sa',
  password: 'Sa21',
  server: '172.25.2.45',
  database: 'appmovil',
  options: {
    encrypt: true, 
    trustServerCertificate: true 
  }
};

sql.connect(config)
  .then(() => {
    console.log('Conexión a la base de datos exitosa');
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos:', err);
  });

const hanaConfig = {
  host: '172.25.2.16',
  port: 30015,
  user: 'SG21_PGWEB',
  password: 'Siglo.21PGWeb'
};

function connectSAPHana() {
  const connection = hanaClient.createConnection();
  connection.connect(hanaConfig, (err) => {
      if (err) {
          console.error('Error de conexión a SAP HANA:', err);
          return;
      }
      console.log('Conexión exitosa a SAP HANA');

      // Realizar consultas u otras operaciones
      const sql = 'SELECT *FROM SBOSIGLO21.OCRD';
      connection.exec(sql, (err, rows) => {
          if (err) {
              console.error('Error al ejecutar la consulta en SAP HANA:', err);
              return;
          }         
      });
  });
}
connectSAPHana();

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

///DASHBOARD PARA CANAL
const generateDashboardImage = async (email) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navega a la ruta del Dashboard
    await page.goto('http://localhost:3000/', {
      waitUntil: 'networkidle0',
    });

    await wait(20000);

    await page.evaluate(() => {
      document.body.style.background = 'transparent';
    });

    // Guarda la imagen con fondo transparente
    await page.screenshot({ 
      path: `dashboard_${CODIGO_CANAL}_${MES}.png`, 
      fullPage: true,
      omitBackground: true  // Esto hará que el fondo sea transparente
    });

    console.log(`Imagen del dashboard generada con éxito para el código ${CODIGO_CANAL}!`);
    //await enviarCorreo(email, `dashboard_${CODIGO_CANAL}_${MES}.png`);
    await browser.close();
  } catch (error) {
    console.error(`Error al generar la imagen para el código ${CODIGO_CANAL}:`, error);
  }
};

const generateDashboardImageVendedor = async (email) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navega a la ruta del Dashboard
    await page.goto('http://localhost:3000/vendedor', {
      waitUntil: 'networkidle0',
    });

    await wait(20000); // Espera 20 segundos

    // Establece el fondo como transparente
    await page.evaluate(() => {
      document.body.style.background = 'transparent';
    });

    // Guarda la imagen con fondo transparente
    await page.screenshot({ 
      path: `dashboard_${CODIGO_VENDEDOR}_${MES}.png`, 
      fullPage: true,
      omitBackground: true  // Esto hará que el fondo sea transparente
    });

    console.log(`Imagen del dashboard generada con éxito para el código ${CODIGO_VENDEDOR}!`);
    await browser.close();
  } catch (error) {
    console.error(`Error al generar la imagen para el código ${CODIGO_VENDEDOR}:`, error);
  }
};

const generateDashboardImageMarca = async (email) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navega a la ruta del Dashboard
    await page.goto('http://localhost:3000/marca', {
      waitUntil: 'networkidle0',
    });

    await wait(25000); 

    // Modifica estas líneas
    await page.evaluate(() => {
      document.body.style.background = 'transparent';
    });

    // Guarda la imagen con fondo transparente
    await page.screenshot({ 
      path: `dashboard_${MARCA}_${MES}.png`, 
      fullPage: true,
      omitBackground: true  // Esto hará que el fondo sea transparente
    });

    console.log(`Imagen del dashboard generada con éxito para el código ${MARCA}!`);
    // await enviarCorreo(email, `dashboard_${MARCA}_${MES}.png`);

    await browser.close();
  } catch (error) {
    console.error(`Error al generar la imagen para el código ${MARCA}:`, error);
  }
};

const pool = new sql.ConnectionPool(config);

async function connectToSQLServer() {
  try {
    await pool.connect();
    return pool;
  } catch (err) {
    console.error('Error connecting to SQL Server:', err);
    throw err;
  }
}

async function obtenerCodigosCanal() {
  const connection = await connectToSQLServer();
  try {
    const result = await connection.request().query(`
      SELECT * FROM DjangoDeWallet.dbo.RegistroMailsDeWallet WHERE tipo = 'C' and estado = 0
    `);
    return result.recordset.map(item => ({ codigo: item.codigo, email: item.email }));
  } catch (err) {
    console.error('Error al obtener códigos de canal:', err);
    throw new Error('Error al obtener los códigos de canal desde la base de datos');
  } finally {
    await connection.close();
  }
}

async function obtenerCodigosVendedor() {
  const connection = await connectToSQLServer();
  try {
    const result = await connection.request().query(`
      SELECT * FROM DjangoDeWallet.dbo.RegistroMailsDeWallet WHERE tipo = 'V' and estado = 0
    `);
    return result.recordset.map(item => ({ codigo: item.codigo, email: item.email }));
  } catch (err) {
    console.error('Error al obtener códigos de vendedor:', err);
    throw new Error('Error al obtener los códigos de canal desde la base de datos');
  } finally {
    await connection.close();
  }
}

async function obtenerCodigosMarca() {
  const connection = await connectToSQLServer();
  try {
    const result = await connection.request().query(`
      SELECT * FROM DjangoDeWallet.dbo.RegistroMailsDeWallet WHERE tipo = 'M' and estado = 0
    `);
    return result.recordset.map(item => ({ codigo: item.codigo, email: item.email }));
  } catch (err) {
    console.error('Error al obtener códigos de marca:', err);
    throw new Error('Error al obtener los códigos de canal desde la base de datos');
  } finally {
    await connection.close();
  }
}

async function enviarCorreo(email, imagenPath, codigo, tipo) {
  try {
    // Configuración del transporte SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: 'info@siglo21.net',
        pass: 'Siglo-2023'
      }
    });

    // Leer la imagen como buffer
    const imageBuffer = await fsPromises.readFile(imagenPath);

    // Opciones del correo
    const mailOptions = {
      from: '"DeWallet" <info@siglo21.net>',
      to: email,
      subject: 'Tu Reporte en DeWallet✅',
      html: `
        <html>
          <body>
            <p>Hola,</p>
            <p>Aquí tienes un reporte de tu interacción dentro de la aplicación hasta el momento.</p>
            <img src="cid:dashboardImage" alt="Dashboard Image">
          </body>
        </html>
      `,
      attachments: [
        {
          filename: `dashboard_${codigo}.png`,
          content: imageBuffer,
          cid: 'dashboardImage'
        }
      ]
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    console.log(`Correo enviado exitosamente a ${email}`);
    await actualizarEstadoCorreo(codigo, tipo);
  } catch (error) {
    console.error(`Error al enviar el correo a ${email}:`, error);
  }
}

async function actualizarEstadoCorreo(codigo, tipo) {
  const connection = await connectToSQLServer();
  try {
    await connection.request()
      .input('codigo', sql.VarChar, codigo)
      .input('tipo', sql.VarChar, tipo)
      .input('fechaEnvio', sql.DateTime, new Date())
      .query(`
        UPDATE DjangoDeWallet.dbo.RegistroMailsDeWallet
        SET estado = 1, fechaEnvio = @fechaEnvio
        WHERE codigo = @codigo AND tipo = @tipo
      `);

    console.log(`Registro actualizado correctamente para el código ${codigo} y tipo ${tipo}`);
    console.log(`----------------------------------------------------------------------------`);
  } catch (err) {
    console.error(`Error al actualizar el registro para el código ${codigo} y tipo ${tipo}:`, err);
  } finally {
    await connection.close();
  }
}

let CODIGOS_CANAL;
let CODIGOS_VENDEDOR;
let CODIGOS_MARCA;

const START_DATE = '2024-08-01';
const END_DATE = '2024-08-31';

const START_DATE_2 = '2024-08-01T00:00:00';
const END_DATE_2 = '2024-08-31T23:59:59.997';

const START_DATE_3 = '2024-08-01 00:00:00';
const END_DATE_3 = '2024-08-31 23:59:59';

const MES ='AGOSTO';




const runProcessForAllChannels = async () => {
  CODIGOS_CANAL = await obtenerCodigosCanal();
  for (const { codigo, email } of CODIGOS_CANAL) {
    global.CODIGO_CANAL = codigo; 
    await generateDashboardImage(email); 
    await enviarCorreo(email, `dashboard_${codigo}_${MES}.png`, codigo, 'C');
  }

  CODIGOS_VENDEDOR = await obtenerCodigosVendedor();
  for (const  { codigo, email } of CODIGOS_VENDEDOR) {
    global.CODIGO_VENDEDOR = codigo; 
    await generateDashboardImageVendedor(email); 
    await enviarCorreo(email, `dashboard_${codigo}_${MES}.png`, codigo, 'V');
  }

  CODIGOS_MARCA = await obtenerCodigosMarca();
  for (const  { codigo, email } of CODIGOS_MARCA) {
    global.MARCA = codigo; 
    await generateDashboardImageMarca(email); 
    await enviarCorreo(email, `dashboard_${codigo}_${MES}.png`, codigo, 'M');
  }
};

runProcessForAllChannels();

app.get('/api/top-10-productos-registrados', async (req, res) => {
  try {
      const result = await sql.query(`
      SELECT TOP 5 CAST(descripcion AS NVARCHAR(MAX)) AS descripcion, COUNT(*) AS cantidad
      FROM detSerie
      WHERE codCliente = '${CODIGO_CANAL}'
      GROUP BY CAST(descripcion AS NVARCHAR(MAX))
      ORDER BY cantidad DESC;
      `);
      res.json(result.recordset);
  } catch (error) {
      console.error('Error en la consulta de top-10-productos-registrados', error);
      res.status(500).json({ error: 'Error al obtener los datos detop-10-productos-registrados' });
  }
});

app.get('/api/nombre-vendedor', async (req, res) => {
    try {
      const result = await sql.query(`
      SELECT nombre, apellido
      FROM detalleVendedor
      WHERE codigoVendedor = '${CODIGO_VENDEDOR}';      
      `);
      res.json(result.recordset);
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    }
});

app.get('/api/top-items', async (req, res) => {
  try {
    const result = await sql.query(`
    SELECT TOP 5 CAST(descripcion AS NVARCHAR(MAX)) AS descripcion, COUNT(*) AS cantidad
    FROM detSerie
    WHERE codVendedor = '${CODIGO_VENDEDOR}'
    GROUP BY CAST(descripcion AS NVARCHAR(MAX))
    ORDER BY cantidad DESC;
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

app.get('/api/ruc-clientes-marca', async (req, res) => {
  try {
    // Consultar datos de SQL Server
    const result = await sql.query(`
      SELECT dv.rucCanal, dv.canal, COUNT(*) AS cantidad
      FROM detSerie ds
      JOIN cabeceraProductosParticipantes cpp 
        ON ds.itemCodigo = cpp.itemCode
      JOIN detalleVendedor dv 
        ON ds.codVendedor  = dv.codigoVendedor 
      WHERE CONVERT(datetime, ds.created_at, 120) >= '${START_DATE_2}'
      AND CONVERT(datetime, ds.created_at, 120) <= '${END_DATE_2}'
      AND cpp.marca = '${MARCA}'
      GROUP BY dv.rucCanal, dv.canal
      ORDER BY cantidad DESC;
    `);

    // Extraer rucCanal para consulta en SAP HANA
    const rucCanales = result.recordset.map(item => item.rucCanal);

    if (rucCanales.length === 0) {
      return res.json([]); // Si no hay rucCanal, retornar resultados vacíos
    }

    // Conectar a SAP HANA
    const connection = hanaClient.createConnection();
    connection.connect(hanaConfig, async (err) => {
      if (err) {
        console.error('Error de conexión a SAP HANA:', err);
        return res.status(500).json({ error: 'Error al conectar a SAP HANA' });
      }

      // Consulta parametrizada para obtener ciudades
      const sqlQuery = `SELECT "CardCode", "City" FROM SBOSIGLO21.OCRD WHERE "CardCode" IN (${rucCanales.map(() => '?').join(',')})`;
      connection.exec(sqlQuery, rucCanales, (err, rows) => {
        if (err) {
          console.error('Error al ejecutar la consulta en SAP HANA:', err);
          connection.disconnect();
          return res.status(500).json({ error: 'Error al obtener las ciudades de SAP HANA' });
        }

        // Crear un mapa de rucCanal a ciudad
        const rucCanalCiudadMap = rows.reduce((acc, row) => {
          acc[row.CardCode] = row.City;
          return acc;
        }, {});

        // Consolidar los resultados por ciudad
        const ciudadCantidad = result.recordset.reduce((acc, item) => {
          const ciudad = rucCanalCiudadMap[item.rucCanal] || 'Ciudad no encontrada';
          if (!acc[ciudad]) {
            acc[ciudad] = 0;
          }
          acc[ciudad] += item.cantidad;
          return acc;
        }, {});

        // Convertir el mapa a un arreglo de objetos y ordenar por cantidad de mayor a menor
        const consolidatedResults = Object.keys(ciudadCantidad).map(ciudad => ({
          ciudad,
          cantidad: ciudadCantidad[ciudad]
        })).sort((a, b) => b.cantidad - a.cantidad);

        connection.disconnect();
        res.json(consolidatedResults);
      });
    });
  } catch (error) {
    console.error('Error en la consulta de ', error);
    res.status(500).json({ error: 'Error al obtener los datos de ' });
  }
});

app.get('/api/total-filtrado', async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT COUNT(*) as totalFilas
      FROM detSerie
      WHERE codVendedor = '${CODIGO_VENDEDOR}'
      AND CONVERT(date, created_at, 120) >= '${START_DATE}'
    AND CONVERT(date, created_at, 120) <= '${END_DATE}';
    `);
    //console.log('Resultado de la consulta:', result.recordset[0]);
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener el total de registros:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

app.get('/api/total-valor-premio', async (req, res) => {
    try {
      const result = await sql.query(`
        SELECT SUM(valorPremio) as totalValorPremio
        FROM detSerie
        WHERE codVendedor = '${CODIGO_VENDEDOR}'
      `);
      res.json({ totalValorPremio: result.recordset[0].totalValorPremio });
    } catch (error) {
      console.error('Error en la consulta:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    }
});

app.get('/api/registros-historicos', async (req, res) => {
    try {
      const result = await sql.query(`
        SELECT COUNT(*) as totalFilas
        FROM detSerie
        WHERE codVendedor = '${CODIGO_VENDEDOR}'
      `);
      res.json({ totalFilas: result.recordset[0].totalFilas });
    } catch (error) {
      console.error('Error en la consulta:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    }
});

app.get('/api/registros-mensuales', async (req, res) => {
    try {
        const result = await sql.query(`
            WITH UltimosMeses AS (
                SELECT MONTH(GETDATE()) as mes
                UNION ALL
                SELECT MONTH(DATEADD(MONTH, -1, GETDATE()))
                UNION ALL
                SELECT MONTH(DATEADD(MONTH, -2, GETDATE()))
                UNION ALL
                SELECT MONTH(DATEADD(MONTH, -3, GETDATE()))
            )
            SELECT 
                u.mes,
                COUNT(d.created_at) as totalRegistros
            FROM UltimosMeses u
            LEFT JOIN detSerie d
                ON u.mes = MONTH(d.created_at)
                AND d.codVendedor = '${CODIGO_VENDEDOR}'
                AND YEAR(d.created_at) = YEAR(GETDATE())
            GROUP BY u.mes
            ORDER BY u.mes;
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
});

app.get('/api/categorias-registradas', async (req, res) => {
    try {
        const result = await sql.query(`
        SELECT p.marca, COUNT(*) AS cantidad
        FROM detSerie d
        INNER JOIN cabeceraProductosParticipantes p
            ON d.itemCodigo = p.ItemCode
        WHERE d.codVendedor = '${CODIGO_VENDEDOR}'
          AND d.created_at BETWEEN CONVERT(DATETIME, '${START_DATE_3}', 120) 
                              AND CONVERT(DATETIME, '${END_DATE_3}', 120)
        GROUP BY p.marca
        ORDER BY cantidad DESC;
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error en la consulta de categorias registradas:', error);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
});

app.get('/api/valor-canjeado-del-mes', async (req, res) => {
    try {
        const result = await sql.query(`
        SELECT SUM(d.valorPremio) as totalValorPremioCanjeado
        FROM detSerie d
        WHERE d.codVendedor = '${CODIGO_VENDEDOR}'
          AND CONVERT(DATETIME, d.created_at, 120) BETWEEN CONVERT(DATETIME, '${START_DATE_3}', 120) 
                                                      AND CONVERT(DATETIME, '${END_DATE_3}', 120);
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error en la consulta de valor-canjeado-del-mes', error);
        res.status(500).json({ error: 'Error al obtener los datos de valor-canjeado-del-mes' });
    }
});


////////////// PARA CANAL ///////////////////

app.get('/api/top-10-productos-registrados', async (req, res) => {
    try {
        const result = await sql.query(`
        SELECT TOP 5 CAST(descripcion AS NVARCHAR(MAX)) AS descripcion, COUNT(*) AS cantidad
        FROM detSerie
        WHERE codCliente = '${CODIGO_CANAL}'
        GROUP BY CAST(descripcion AS NVARCHAR(MAX))
        ORDER BY cantidad DESC;
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error en la consulta de top-10-productos-registrados', error);
        res.status(500).json({ error: 'Error al obtener los datos detop-10-productos-registrados' });
    }
});


app.get('/api/registros-por-mes-canal', async (req, res) => {
    try {
      const result = await sql.query(`
      SELECT COUNT(*) as totalFilas
      FROM detSerie
      WHERE codCliente  = '${CODIGO_CANAL}'
      AND CONVERT(date, created_at, 120) >= '${START_DATE}'
      AND CONVERT(date, created_at, 120) <= '${END_DATE}';
      `);
      //console.log('Resultado de la consulta registros-por-mes-canal:', result.recordset[0]);
      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Error al obtener el total de registros registros-por-mes-canal:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    }
  });

  app.get('/api/nombre-canal', async (req, res) => {
    try {
      const result = await sql.query(`
      SELECT canal 
      FROM detalleVendedor
      WHERE rucCanal = '${CODIGO_CANAL}';      
      `);
      res.json(result.recordset);
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    }
});


app.get('/api/total-valor-premio-canal', async (req, res) => {
    try {
      const result = await sql.query(`
        SELECT SUM(valorPremio) as totalValorPremio
        FROM detSerie
        WHERE codCliente = '${CODIGO_CANAL}'
      `);
      res.json({ totalValorPremio: result.recordset[0].totalValorPremio });
    } catch (error) {
      console.error('Error en la consulta:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    }
});


app.get('/api/registros-historicos-canal', async (req, res) => {
    try {
      const result = await sql.query(`
        SELECT COUNT(*) as totalFilas
        FROM detSerie
        WHERE codCliente = '${CODIGO_CANAL}'
      `);
      res.json({ totalFilas: result.recordset[0].totalFilas });
    } catch (error) {
      console.error('Error en la consulta:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    }
});

app.get('/api/categorias-registradas-canal', async (req, res) => {
    try {
        const result = await sql.query(`
        SELECT p.marca, COUNT(*) AS cantidad
        FROM detSerie d
        INNER JOIN cabeceraProductosParticipantes p
            ON d.itemCodigo = p.ItemCode
        WHERE d.codCliente = '${CODIGO_CANAL}'
          AND d.created_at BETWEEN CONVERT(DATETIME, '${START_DATE_3}', 120) 
                              AND CONVERT(DATETIME, '${END_DATE_3}', 120)
        GROUP BY p.marca
        ORDER BY cantidad DESC;
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error en la consulta de categorias registradas:', error);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
});


app.get('/api/valor-canjeado-del-mes-canal', async (req, res) => {
    try {
        const result = await sql.query(`
        SELECT SUM(d.valorPremio) as totalValorPremioCanjeado
        FROM detSerie d
        WHERE d.codCliente = '${CODIGO_CANAL}'
          AND CONVERT(DATETIME, d.created_at, 120) BETWEEN CONVERT(DATETIME, '${START_DATE_3}', 120) 
                                                      AND CONVERT(DATETIME, '${END_DATE_3}', 120);
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error en la consulta de valor-canjeado-del-mes', error);
        res.status(500).json({ error: 'Error al obtener los datos de valor-canjeado-del-mes' });
    }
});

app.get('/api/top-vendedores', async (req, res) => {
    try {
        const result = await sql.query(`
        SELECT dv.nombre, dv.apellido, ds.codVendedor, COUNT(*) as totalFilas
        FROM detSerie ds
        INNER JOIN detalleVendedor dv ON ds.codVendedor = dv.codigoVendedor
        WHERE ds.codCliente ='${CODIGO_CANAL}'
        AND CONVERT(date, ds.created_at, 120) >= '${START_DATE}'
        AND CONVERT(date, ds.created_at, 120) <= '${END_DATE}'
        GROUP BY dv.nombre, dv.apellido, ds.codVendedor
        ORDER BY totalFilas DESC;
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error en la consulta de /top-vendedores', error);
        res.status(500).json({ error: 'Error al obtener los datos de/top-vendedores' });
    }
});


app.get('/api/marcas-mas-registradas', async (req, res) => {
    try {
        const result = await sql.query(`
        SELECT 
        cpp.marca, 
        COUNT(*) AS cantidad
        FROM detSerie ds
        INNER JOIN cabeceraProductosParticipantes cpp 
            ON ds.itemCodigo = cpp.ItemCode
        WHERE CONVERT(date, ds.created_at, 120) BETWEEN '${START_DATE}' AND '${END_DATE}'
        GROUP BY cpp.marca
        ORDER BY cantidad DESC;
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error en la consulta de /marcas-mas-registradas', error);
        res.status(500).json({ error: 'Error al obtener los datos de /marcas-mas-registradas' });
    }
});

app.get('/api/productos-mas-canjeados', async (req, res) => {
    try {
        const result = await sql.query(`
        SELECT TOP 10 
        CAST(descripcion AS NVARCHAR(MAX)) AS producto, 
        COUNT(*) AS cantidad
        FROM detSerie
        WHERE CONVERT(date, created_at, 120) BETWEEN '${START_DATE}' AND '${END_DATE}'
        GROUP BY CAST(descripcion AS NVARCHAR(MAX))
        ORDER BY cantidad DESC;
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error en la consulta de/productos-mas-canjeados', error);
        res.status(500).json({ error: 'Error al obtener los datos de /productos-mas-canjeados' });
    }
});

app.get('/api/registros-mes-canal', async (req, res) => {
    try {
        const result = await sql.query(`
        SELECT COUNT(*) as totalFilas
        FROM detSerie
        WHERE codCliente  = '${CODIGO_CANAL}'
        AND CONVERT(date, created_at, 120) >= '${START_DATE}'
        AND CONVERT(date, created_at, 120) <= '${END_DATE}';
        `);
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error en la consulta de /marcas-mas-registradas', error);
        res.status(500).json({ error: 'Error al obtener los datos de /marcas-mas-registradas' });
    }
});

/////MARCA//////////////////////////
app.get('/api/cantidad-registros-marca', async (req, res) => {
    try {
      const result = await sql.query(`
    SELECT COUNT(*) AS cantidad
      FROM detSerie ds
      JOIN cabeceraProductosParticipantes cpp ON ds.itemCodigo = cpp.itemCode
      WHERE CONVERT(datetime, ds.created_at, 120) >= '${START_DATE_2}'
        AND CONVERT(datetime, ds.created_at, 120) <= '${END_DATE_2}'
        AND cpp.marca = '${MARCA}';
      `);
      //console.log('Resultado de la consulta:', result.recordset[0]);
      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Error al obtener el total de registros:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    }
  });



  app.get('/api/valor-registros-marca', async (req, res) => {
    try {
      const result = await sql.query(`
      SELECT SUM(ds.valorPremio) AS totalValorPremio
      FROM detSerie ds
      JOIN cabeceraProductosParticipantes cpp ON ds.itemCodigo = cpp.itemCode
      WHERE CONVERT(datetime, ds.created_at, 120) >= '${START_DATE_2}'
        AND CONVERT(datetime, ds.created_at, 120) <= '${END_DATE_2}'
        AND cpp.marca = '${MARCA}';
      `);
      //console.log('Resultado de la consulta:', result.recordset[0]);
      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Error al obtener el total de registros:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    }
  });

  app.get('/api/cantidad-clientes-marca', async (req, res) => {
    try {
      const result = await sql.query(`
      SELECT COUNT(DISTINCT ds.codCliente) AS cantidadClientes
      FROM detSerie ds
      JOIN cabeceraProductosParticipantes cpp ON ds.itemCodigo = cpp.itemCode
      WHERE CONVERT(datetime, ds.created_at, 120) >= '${START_DATE_2}'
        AND CONVERT(datetime, ds.created_at, 120) <= '${END_DATE_2}'
        AND cpp.marca = '${MARCA}';
      `);
      //console.log('Resultado de la consulta:', result.recordset[0]);
      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Error al obtener el total de registros:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    }
  });
  
    app.get('/api/clientes-marca', async (req, res) => {
        try {
            const result = await sql.query(`
            SELECT dv.canal, COUNT(*) AS cantidad
            FROM detSerie ds
            JOIN cabeceraProductosParticipantes cpp ON ds.itemCodigo = cpp.itemCode
            JOIN detalleVendedor dv ON ds.codCliente = dv.rucCanal
            WHERE CONVERT(datetime, ds.created_at, 120) >= '${START_DATE_2}'
            AND CONVERT(datetime, ds.created_at, 120) <= '${END_DATE_2}'
            AND cpp.marca = '${MARCA}'
            GROUP BY dv.canal
            ORDER BY cantidad DESC;
            `);
            res.json(result.recordset);
        } catch (error) {
            console.error('Error en la consulta de/productos-mas-canjeados', error);
            res.status(500).json({ error: 'Error al obtener los datos de /productos-mas-canjeados' });
        }
    });

    app.get('/api/productos-marca', async (req, res) => {
        try {
            const result = await sql.query(`
            SELECT cpp.descripcion, COUNT(*) AS cantidad
            FROM detSerie ds
            JOIN cabeceraProductosParticipantes cpp ON ds.itemCodigo = cpp.itemCode
            WHERE CONVERT(datetime, ds.created_at, 120) >= '${START_DATE_2}'
              AND CONVERT(datetime, ds.created_at, 120) <= '${END_DATE_2}'
              AND cpp.marca = '${MARCA}'
            GROUP BY cpp.descripcion
            ORDER BY cantidad DESC;
            `);
            res.json(result.recordset);
        } catch (error) {
            console.error('Error en la consulta de/productos-mas-canjeados', error);
            res.status(500).json({ error: 'Error al obtener los datos de /productos-mas-canjeados' });
        }
    });

    app.get('/api/ruc-clientes-marca', async (req, res) => {
      try {
          const result = await sql.query(`
          SELECT dv.rucCanal, dv.canal, COUNT(*) AS cantidad
          FROM detSerie ds
          JOIN cabeceraProductosParticipantes cpp ON ds.itemCodigo = cpp.itemCode
          JOIN detalleVendedor dv ON ds.codCliente = dv.rucCanal
          WHERE CONVERT(datetime, ds.created_at, 120) >= '${START_DATE_2}'
          AND CONVERT(datetime, ds.created_at, 120) <= '${END_DATE_2}'
          AND cpp.marca = '${MARCA}'
          GROUP BY dv.rucCanal, dv.canal
          ORDER BY cantidad DESC;
                                     
          `);
          res.json(result.recordset);
      } catch (error) {
          console.error('Error en la consulta de/productos-mas-canjeados', error);
          res.status(500).json({ error: 'Error al obtener los datos de /productos-mas-canjeados' });
      }
  });

  app.get('/api/cantidad-historico-marca', async (req, res) => {
    try {
      const result = await sql.query(`
      SELECT SUM(ds.valorPremio) AS totalValorPremio
      FROM detSerie ds
      JOIN cabeceraProductosParticipantes cpp ON ds.itemCodigo = cpp.itemCode
        AND cpp.marca = '${MARCA}';
      `);
      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Error al obtener el total de registros historicos:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    }
  });
  
  app.get('/api/cantidad-historico-clientes-marca', async (req, res) => {
    try {
      const result = await sql.query(`
      SELECT COUNT(DISTINCT ds.codCliente) AS cantidadClientes
      FROM detSerie ds
      JOIN cabeceraProductosParticipantes cpp ON ds.itemCodigo = cpp.itemCode
      WHERE cpp.marca = '${MARCA}';
      `);
      //console.log('Resultado de la consulta:', result.recordset[0]);
      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Error al obtener el total de  historico cantidad marcas:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    }
  });

  app.get('/api/cantidad-historico-valor-marca', async (req, res) => {
    try {
      const result = await sql.query(`
      SELECT SUM(ds.valorPremio) AS totalValorPremio
      FROM detSerie ds
      JOIN cabeceraProductosParticipantes cpp ON ds.itemCodigo = cpp.itemCode
        AND cpp.marca = '${MARCA}';
      `);
      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Error al obtener el total de  historico cantidad marcas:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    }
  });

  app.get('/api/cantidad-historico-registros-marca', async (req, res) => {
    try {
      const result = await sql.query(`
      SELECT COUNT(*) AS cantidad
      FROM detSerie ds
      JOIN cabeceraProductosParticipantes cpp ON ds.itemCodigo = cpp.itemCode
      WHERE cpp.marca = '${MARCA}';
      `);
      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Error al obtener el total de  historico cantidad marcas:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    }
  });
  
  
  app.get('/api/linea-de-negocio', async (req, res) => {
    try {
      // Consulta en SQL Server
      const result = await sql.query(`
        SELECT cpp.descripcion, cpp.ItemCode, COUNT(*) AS cantidad
        FROM detSerie ds
        JOIN cabeceraProductosParticipantes cpp 
          ON ds.itemCodigo = cpp.itemCode
        WHERE CONVERT(datetime, ds.created_at, 120) >= '2024-08-01T00:00:00'
        AND CONVERT(datetime, ds.created_at, 120) <= '2024-08-31T23:59:59.997'
        AND cpp.marca = 'HPINC'
        GROUP BY cpp.descripcion, cpp.ItemCode
        ORDER BY cantidad DESC;
      `);
  
      // Extraer ItemCodes para la consulta en SAP HANA
      const itemCodes = result.recordset.map(item => item.ItemCode);
  
      if (itemCodes.length === 0) {
        return res.json([]); // Si no hay ItemCodes, retornar resultados vacíos
      }
  
      // Conectar a SAP HANA
      const connection = hanaClient.createConnection();
      connection.connect(hanaConfig, async (err) => {
        if (err) {
          console.error('Error de conexión a SAP HANA:', err);
          return res.status(500).json({ error: 'Error al conectar a SAP HANA' });
        }
  
        // Consulta parametrizada para obtener línea de negocio
        const sqlQuery = `
          SELECT 
              OITM."ItemCode", 
              OITM."U_ExxCodLineaNegocio", 
              LN."U_DescLineaNegocio"
          FROM 
              SBOSIGLO21.OITM
          JOIN 
              SBOSIGLO21."@AEXX_LINEA_NEGOCIO" LN 
              ON OITM."U_ExxCodLineaNegocio" = LN."Code"
          WHERE 
              OITM."U_ExxCodLineaNegocio" IS NOT NULL
              AND OITM."ItemCode" IN (${itemCodes.map(() => '?').join(',')})
        `;
        
        connection.exec(sqlQuery, itemCodes, (err, rows) => {
          if (err) {
            console.error('Error al ejecutar la consulta en SAP HANA:', err);
            connection.disconnect();
            return res.status(500).json({ error: 'Error al obtener la línea de negocio de SAP HANA' });
          }
  
          // Crear un mapa de ItemCode a línea de negocio
          const itemCodeLineaNegocioMap = rows.reduce((acc, row) => {
            acc[row.ItemCode] = {
              codigoLineaNegocio: row.U_ExxCodLineaNegocio,
              descripcionLineaNegocio: row.U_DescLineaNegocio
            };
            return acc;
          }, {});
  
          // Consolidar los resultados por línea de negocio
          const lineaNegocioCantidad = result.recordset.reduce((acc, item) => {
            const lineaNegocio = itemCodeLineaNegocioMap[item.ItemCode] || { descripcionLineaNegocio: 'Línea de negocio no encontrada' };
            if (!acc[lineaNegocio.descripcionLineaNegocio]) {
              acc[lineaNegocio.descripcionLineaNegocio] = 0;
            }
            acc[lineaNegocio.descripcionLineaNegocio] += item.cantidad;
            return acc;
          }, {});
  
          // Convertir el mapa a un arreglo de objetos y ordenar por cantidad de mayor a menor
          const consolidatedResults = Object.keys(lineaNegocioCantidad).map(descripcion => ({
            descripcionLineaNegocio: descripcion,
            cantidad: lineaNegocioCantidad[descripcion]
          })).sort((a, b) => b.cantidad - a.cantidad);
  
          connection.disconnect();
          res.json(consolidatedResults);
        });
      });
    } catch (error) {
      console.error('Error en la consulta de ', error);
      res.status(500).json({ error: 'Error al obtener los datos de ' });
    }
  });
  


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
