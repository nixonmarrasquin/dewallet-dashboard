import React, { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Treemap, LineChart, Line, LabelList } from 'recharts';
import html2canvas from 'html2canvas';
import axios from 'axios';
import './Dashboard.css';
import { Phone, Mail } from 'lucide-react';


// Truncar texto largo
const truncateText = (text, maxLength) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Colores para el gráfico de pastel
const COLORS = ['#004e98', '#3a6ea5', '#1b4965', '#ffa62b', '#e07a5f', '#f58549', '#0fa3b1' ];

// Datos para gráficos
/*const pieData = [
  { name: 'MONITORES GAMING', value: 33.20 },
  { name: 'HP - Computadoras Consumo', value: 26.13 },
  { name: 'EPSON IMPRESION', value: 15.52 },
  { name: 'OTROS', value: 25.15 },
];*/


const BarChartComponent = ({ data }) => (
    <div className="chart-container">
      <h2 className="chart-title">Tus productos más registrados este año</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ right: 100, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            domain={[0, Math.max(...data.map(item => item.value)) + 10]} 
          />
          <YAxis
            dataKey="name"
            type="category"
            tickFormatter={(value) => truncateText(value, 40)}
            tick={{ fontSize: 16 }}
            width={300}
          />
          <Tooltip />
          <Bar dataKey="value" fill="#14213d" barSize={50}>
            {/* Aquí agregamos el LabelList para mostrar los valores en cada barra */}
            <LabelList dataKey="value" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );



  const PieChartComponent = ({ data }) => {
    console.log('Datos en PieChartComponent:', data);
  
    // Ensure data is in the correct format
    const processedData = data.map(item => ({
      name: item.name,
      value: parseFloat(item.value) // Ensure value is a number
    }));
  
    return (
      <div className="chart-container">
        <h2 className="chart-title">Marcas registradas - Julio</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => ` ${(percent * 100).toFixed(2)}%`}
              outerRadius={100} // Increased from 80 to 100
              fill="#8884d8"
              dataKey="value"
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  

const LineChartComponent = ({ data }) => (
    <div className="chart-container">
      <h2 className="chart-title">Tus últimos registros</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis label={{ value: '', angle: -90, position: 'insideLeft', dy: -10 }} />
          <Tooltip formatter={(value) => [`${value} Registros`, 'Mes']} />
          <Legend formatter={(value) => `Cantidad de ${value}`} />
          <Line type="monotone" dataKey="value" stroke="black" strokeWidth={2} name="Registros">
            <LabelList dataKey="value" position="top" offset={10} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const InfoCard = ({ values }) => (
    <div className="info-card">
      <div className="value">
        {values[0].value}
      </div>
      <div className="description">
        {values[0].description}
      </div>
    </div>
  );



const CustomizedContent = ({ root, depth, x, y, width, height, index, payload, colors, rank, name, size }) => {
  const fontSize = 12;
  const minHeightForPercentage = 50; // Altura mínima para mostrar el porcentaje

  // Verifica si root o root.children es null o undefined
  const fillColor = depth < 2 && root && root.children
    ? colors[Math.floor((index / root.children.length) * 6)]
    : 'none';

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: fillColor,
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            fill="#fff"
            fontSize={fontSize}
            dominantBaseline="central"
          >
            {name}
          </text>
          {height > minHeightForPercentage && (
            <text
              x={x + width / 2}
              y={y + height - fontSize}
              textAnchor="middle"
              fill="#fff"
              fontSize={fontSize}
            >
              {`${size.toFixed(1)}%`}
            </text>
          )}
        </>
      )}
    </g>
  );
};


const StraightAnglePieChart = ({ data, title, dataKey, valueKey }) => {
  const totalValue = data.reduce((sum, entry) => sum + entry[valueKey], 0);
  
  const treeMapData = {
    name: "Root",
    children: data.map((entry, index) => ({
      name: entry[dataKey],
      size: (entry[valueKey] / totalValue) * 100,
      fill: COLORS[index % COLORS.length]
    }))
  };

  return (
    <div className="chart-container">
      <h2 className="chart-title">{title}</h2>
      <ResponsiveContainer width="100%" height={400}>
        <Treemap
          data={treeMapData.children}
          dataKey="size"
          ratio={4 / 3}
          stroke="#fff"
          content={<CustomizedContent colors={COLORS} />}
        >
          <Tooltip 
            formatter={(value, name) => [`${value.toFixed(2)}%`, name]}
          />
        </Treemap>
      </ResponsiveContainer>
      <div className="legend-container" style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {treeMapData.children.map((entry, index) => (
          <div key={`legend-${index}`} className="legend-item" style={{ display: 'flex', alignItems: 'center', margin: '0 10px 10px 0', minWidth: '200px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: COLORS[index % COLORS.length], marginRight: '10px' }}></div>
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Top5ProductsTable = ({ data, title }) => {
  const totalQuantity = data.reduce((sum, item) => sum + item.cantidad, 0);
  const top6Data = data.slice(0, 6);
  const othersSum = data.slice(6).reduce((sum, item) => sum + item.cantidad, 0);

  const calculatePercentage = (value) => ((value / totalQuantity) * 100).toFixed(2);

  const chartData = [
    ...top6Data.map(item => ({
      name: truncateText(item.producto, 35),
      value: parseFloat(calculatePercentage(item.cantidad))
    })),
    { name: 'Otros', value: parseFloat(calculatePercentage(othersSum)) }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '5px', border: '1px solid #ccc' }}>
          <p className="label">{`${payload[0].name}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h2 className="chart-title">{title}</h2>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={(entry) => `${entry.value}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="legend-container" style={{ marginTop: '-20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
      {chartData.map((entry, index) => (
        <div key={`legend-${index}`} className="legend-item" style={{ display: 'flex', alignItems: 'center', margin: '0 10px 10px 0', minWidth: '200px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: COLORS[index % COLORS.length], marginRight: '10px' }}></div>
          <span>{entry.name}</span>
        </div>
      ))}
      </div>
    </div>
  );
};


const Vendedor = () => {
  const [totalRegistros, setTotalRegistros] = useState(null);
  const [barData, setBarData] = useState([]);
  const [totalValorPremio, setTotalValorPremio] = useState(null); 
  const [totalValorPremioCanjeado, setTotalValorPremioCanjeado] = useState(null); 
  const [totalHistoricoRegistros, setTotalHistoricoRegistros] = useState(null);
  const [lineData, setLineData] = useState([]); // Estado para los datos del gráfico de líneas
  const [vendedor, setVendedor] = useState({ nombre: '', apellido: '' });
  const [marcasRegistradas, setMarcasRegistradas] = useState([]);
  const [productosCanjeados, setProductosCanjeados] = useState([]);
  const [pieData, setPieData] = useState([]);

  const dashboardRef = useRef(null);


  useEffect(() => {
    const fetchTotalRegistros = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/total-filtrado');
        console.log('Respuesta del servidor:', response.data);
        setTotalRegistros(response.data.totalFilas);
      } catch (error) {
        console.error('Error al obtener el total de registros:', error);
      }
    };

    const fetchMarcasRegistradas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/marcas-mas-registradas');
        let marcasRegistradas = response.data;
    
        // Si hay más de 5 marcas, agrupar las demás en "OTRAS"
        if (marcasRegistradas.length > 5) {
          const top5Marcas = marcasRegistradas.slice(0, 5);
          const otras = {
            marca: "OTRAS",
            cantidad: marcasRegistradas.slice(5).reduce((sum, marca) => sum + marca.cantidad, 0)
          };
          marcasRegistradas = [...top5Marcas, otras];
        }
        setMarcasRegistradas(marcasRegistradas);
      } catch (error) {
        console.error('Error al obtener las marcas más registradas:', error);
      }
    };
    

    const fetchProductosCanjeados = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/productos-mas-canjeados');
        setProductosCanjeados(response.data);
      } catch (error) {
        console.error('Error al obtener los productos más canjeados:', error);
      }
    };


    // Define la función para obtener el valor total del premio
    const fetchTotalValorPremio = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/total-valor-premio');
          if (!response.ok) {
            throw new Error('Error en la solicitud');
          }
          const data = await response.json();
          setTotalValorPremio(data.totalValorPremio); // Actualiza el estado con el valor total del premio
        } catch (error) {
          console.error('Error al obtener el valor del premio:', error);
          setTotalValorPremio(null); // Establece null en caso de error
        }
      };

      const fetchValorCanjeadodelMes = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/valor-canjeado-del-mes');
          if (!response.ok) {
            throw new Error('Error en la solicitud');
          }
          const data = await response.json();
          
          if (Array.isArray(data) && data.length > 0) {
            // Accede al primer objeto del array
            const valorCanjeado = data[0]?.totalValorPremioCanjeado;
            console.log('Valor Canjeado del Mes:', valorCanjeado);
            setTotalValorPremioCanjeado(valorCanjeado); // Actualiza el estado con el valor total del premio
          } else {
            console.log('No hay datos disponibles.');
            setTotalValorPremioCanjeado(null); // Establece null si no hay datos
          }
        } catch (error) {
          console.error('Error al obtener el valor del premio:', error);
          setTotalValorPremioCanjeado(null); // Establece null en caso de error
        }
      };
      

    const fetchBarData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/top-items');
        const items = response.data;

        // Transformar los datos obtenidos de la API
        const transformedData = items.map(item => ({
          name: item.descripcion,
          value: item.cantidad
        }));

        // Actualizar el estado con los datos transformados
        setBarData(transformedData);
      } catch (error) {
        console.error('Error al obtener los datos de productos:', error);
      }
    };

    const fetchTotalHistoricoRegistros = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/registros-historicos');
          setTotalHistoricoRegistros(response.data.totalFilas);
        } catch (error) {
          console.error('Error al obtener el total de registros históricos:', error);
          setTotalHistoricoRegistros(null);
        }
      };

      const fetchNombreVendedor = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/nombre-vendedor'); // Asegúrate de que esta URL sea la correcta
          const data = response.data;
    
          // Asegúrate de que `data` es un array y accede al primer elemento
          if (Array.isArray(data) && data.length > 0) {
            setVendedor({
              nombre: data[0].nombre,
              apellido: data[0].apellido
            });
            console.log('Correctos los datos del vendedor:', data[0]);
          } else {
            console.log('No se encontraron datos del vendedor.');
          }
        } catch (error) {
          console.error('Error al obtener los datos del vendedor:', error);
        }
      };

      const fetchLineData = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/registros-mensuales');
          const monthlyRecords = response.data;
      
          // Array con los nombres de los meses
          const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
          ];
      
          // Transformar los datos obtenidos de la API
          const transformedData = monthlyRecords.map(record => ({
            month: monthNames[record.mes - 1], // Mapear el número del mes al nombre del mes
            value: record.totalRegistros
          }));
      
          // Actualizar el estado con los datos transformados
          setLineData(transformedData);
        } catch (error) {
          console.error('Error al obtener los datos de registros mensuales:', error);
        }
      };
      
      
      const fetchPieData = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/categorias-registradas');
          const data = await response.json();
          
          const total = data.reduce((acc, item) => acc + item.cantidad, 0);
          const transformedData = data.map(item => ({
            name: item.marca,
            value: (item.cantidad / total * 100).toFixed(2) // Calcula el porcentaje
          }));
      
          setPieData(transformedData);
          console.log('Datos de PieChart:', data);
        } catch (error) {
          console.error('Error fetching data PieData:', error);
          setPieData([]); // Asegúrate de establecer un array vacío en caso de error
        }
      };
      
      
    fetchPieData();
    fetchTotalRegistros();
    fetchBarData();
    fetchTotalValorPremio();
    fetchValorCanjeadodelMes();
    fetchTotalHistoricoRegistros();
    fetchLineData(); 
    fetchNombreVendedor();
    fetchMarcasRegistradas();
    fetchProductosCanjeados();

    const saveDashboardAsJPEG = () => {
      const options = {
        useCORS: true,
        width: dashboardRef.current.clientWidth,
        height: dashboardRef.current.scrollHeight,
        backgroundColor: 'white',
      };

      html2canvas(dashboardRef.current, options)
      .then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg');

        // Descargar la imagen
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'dashboard-dewallet.jpg';
        link.click();

        // Enviar la imagen por correo
        axios.post('https://serviciosmovil.siglo21.net:8443/api/enviarCorreo', {
          correo: 'amoran@siglo21.net',
          asunto: 'Prueba Dashboard DeWallet✅',
          cuerpo: `<!DOCTYPE html>
                <html lang="es">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Dashboard DeWallet</title>
                </head>
                <body>
                <h2>Hola ADMINISTRADOR DE DEWALLET</h2>
                <p>Te adjuntamos la imagen del dashboard.</p>
                <img src="${imgData}" alt="Dashboard" style="max-width: 100%; height: auto;" />
                </body>
                </html>`
            })
        .then(response => {
          console.log('Correo enviado con éxito:', response);
        })
        .catch(error => {
          console.error('Error al enviar el correo:', error);
        });
      })
      .catch(error => {
        console.error('Error al guardar el dashboard como imagen:', error);
      });
    };

    const ensureWindowSize = () => {
      if (window.innerWidth < 990) {
        window.resizeTo(990, window.innerHeight);
      }
    };

    ensureWindowSize();
    window.addEventListener('resize', ensureWindowSize);

    const timer = setTimeout(() => {
      saveDashboardAsJPEG();
    }, 5000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', ensureWindowSize);
    };
  }, []);

  return (
    <div className="dashboard">
      <div className="container" ref={dashboardRef}>
        <div className="dashboard-header">
          <img src="/dewallet.png" alt="DeWallet Logo" className="dashboard-logo" />
        </div>
        <h2 className="chart-title-principal">Hola {vendedor.nombre} {vendedor.apellido}, este es tu resumen en DeWallet hasta el momento</h2>
        <div className="info-cards-container">
      <div className="info-cards-group">  
        <InfoCard
          values={[
            {
              value: totalRegistros !== null ? totalRegistros.toLocaleString() : 'Cargando...',
              description: 'registros en julio',
            },
          ]}
        />
        <InfoCard
          values={[
            {
              value: totalValorPremioCanjeado !== null ? `$${totalValorPremioCanjeado.toLocaleString()}` : 'Cargando...',
              description: 'registrado en julio',
            },
          ]}
        />
      </div>
      <div className="info-cards-group">
        <InfoCard
          values={[
            {
              value: totalHistoricoRegistros !== null ? `${totalHistoricoRegistros.toLocaleString()}` : 'Cargando...',
              description: 'histórico de registros',
            },
          ]}
        />
        <InfoCard
          values={[
            {
              value: totalValorPremio !== null ? `$${totalValorPremio.toLocaleString()}` : 'Cargando...',
              description: 'histórico canjeado',
            },
          ]}
        />
      </div>
        </div>
    <div className="charts-row">
        <BarChartComponent data={barData} />
        </div>
        <div className="charts-row">
          <div className="chart-container">
            <LineChartComponent data={lineData} />
          </div>
          <div className="chart-container">
            <PieChartComponent data={pieData} />
          </div>
        </div>
        <h1 className="chart-second-title">Información DeWallet</h1>
        <div className="charts-row">
          <div className="chart-container">
          <StraightAnglePieChart  
              data={marcasRegistradas} 
              title="Marcas populares en DeWallet" 
              dataKey="marca"
              valueKey="cantidad"
            />
          </div>
          <div className="chart-container">
          <Top5ProductsTable  
              data={productosCanjeados} 
              title="Productos populares en DeWallet" 
            />
          </div>
        </div>
        <div className="pie-pagina">
        <img src="/dewallet.png" alt="DeWallet Logo" className="dashboard-logo" />
        <h2>Para mayor información comunícate con:</h2>
        <h2 className="nombre">Michael Guevara</h2>
        <div className="contacto">
        <h3>
              <Phone size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
              0987688605
            </h3>
            <h3>
              <Mail size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
              mguevara@siglo21.net
            </h3>
        </div>
      </div>
      </div>
    </div>
    
  );
};

export default Vendedor;
