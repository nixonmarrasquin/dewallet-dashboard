const express = require('express');
const sql = require('mssql');
const cors = require('cors'); // Importa el middleware CORS

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'https://serviciosmovil.siglo21.net:8443']
}));

const CODIGO_VENDEDOR = '0958208217';
const CODIGO_CANAL = 'C0704374586001';

const config = {
  user: 'sa',
  password: 'Sa21',
  server: '172.25.2.45',
  database: 'appmovil',
  options: {
    encrypt: true, 
    trustServerCertificate: true // Para evitar problemas con certificados autofirmados
  }
};

sql.connect(config)
  .then(() => {
    console.log('Conexión a la base de datos exitosa');
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos:', err);
  });

app.get('/test-db', async (req, res) => {
  try {
    const result = await sql.query('SELECT 1 + 1 AS solution');
    res.send(`La solución es: ${result.recordset[0].solution}`);
  } catch (error) {
    res.status(500).send('Error en la base de datos');
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

app.get('/api/total-filtrado', async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT COUNT(*) as totalFilas
      FROM detSerie
      WHERE codVendedor = '${CODIGO_VENDEDOR}'
      AND CONVERT(date, created_at, 120) >= '2024-07-01'
    AND CONVERT(date, created_at, 120) <= '2024-07-31';
    `);
    console.log('Resultado de la consulta:', result.recordset[0]);
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
          AND d.created_at BETWEEN CONVERT(DATETIME, '2024-07-01 00:00:00', 120) 
                              AND CONVERT(DATETIME, '2024-07-31 23:59:59', 120)
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
          AND CONVERT(DATETIME, d.created_at, 120) BETWEEN CONVERT(DATETIME, '2024-07-01 00:00:00', 120) 
                                                      AND CONVERT(DATETIME, '2024-07-31 23:59:59', 120);
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
      AND CONVERT(date, created_at, 120) >= '2024-07-01'
      AND CONVERT(date, created_at, 120) <= '2024-07-31';
      `);
      console.log('Resultado de la consulta registros-por-mes-canal:', result.recordset[0]);
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
          AND d.created_at BETWEEN CONVERT(DATETIME, '2024-07-01 00:00:00', 120) 
                              AND CONVERT(DATETIME, '2024-07-31 23:59:59', 120)
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
          AND CONVERT(DATETIME, d.created_at, 120) BETWEEN CONVERT(DATETIME, '2024-07-01 00:00:00', 120) 
                                                      AND CONVERT(DATETIME, '2024-07-31 23:59:59', 120);
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
        AND CONVERT(date, ds.created_at, 120) >= '2024-07-01'
        AND CONVERT(date, ds.created_at, 120) <= '2024-07-31'
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
        WHERE CONVERT(date, ds.created_at, 120) BETWEEN '2024-07-01' AND '2024-07-31'
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
        WHERE CONVERT(date, created_at, 120) BETWEEN '2024-07-01' AND '2024-07-31'
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
        AND CONVERT(date, created_at, 120) >= '2024-07-01'
        AND CONVERT(date, created_at, 120) <= '2024-07-31';
        `);
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error en la consulta de /marcas-mas-registradas', error);
        res.status(500).json({ error: 'Error al obtener los datos de /marcas-mas-registradas' });
    }
});


// Cambia el puerto a 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
