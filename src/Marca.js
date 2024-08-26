import React, { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import html2canvas from 'html2canvas';
import axios from 'axios';
import './Dashboard.css';
import { Phone, Mail } from 'lucide-react';
import MapaEcuador from './MapaEcuador'; // Asegúrate de que la ruta sea correcta



// Truncar texto largo
function truncateText(text, maxLength) {
    // Ensure 'text' is a string before checking its length
    if (typeof text !== 'string') {
        return ''; // or handle the error as needed
    }
    
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    
    return text;
}

// Colores para el gráfico de pastel
const COLORS = [
  '#004e98', // Azul oscuro
  'black', // Negro
  '#ffa62b', // Naranja
  '#e07a5f', // Coral
  '#f58549', // Naranja claro
  '#0fa3b1', // Turquesa
  '#81b29a', // Verde menta
  '#ffcc29', // Amarillo
  '#e63946', // Rojo
  '#6a0572', // Púrpura oscuro
  '#b5179e', // Magenta
  '#720e3a', // Rojo vino
  '#d9bf77', // Beige
  '#a0c4ff', // Azul claro
  '#84a59d'  // Verde grisáceo
];

const BarChartComponent = ({ data }) => (
    <div className="chart-container">
      <h2 className="chart-title">Productos más registrados hasta ahora</h2>
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
            tickFormatter={(value) => truncateText(value, 55)}
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

const BarChartComponentCiudad = ({ data }) => (
    <div className="chart-container">
      <h2 className="chart-title">Cantidad de Productos Registrados</h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical" margin={{ right: 100, left: 1 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            domain={[0, Math.max(...data.map(item => item.value)) + 10]} 
          />
          <YAxis
            dataKey="name"
            type="category"
            tickFormatter={(value) => truncateText(value, 50)}
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
      value: parseFloat(item.value)
    }));
  
    const mes = process.env.REACT_APP_MES; 

    return (
      <div className="chart-container">
        <h2 className="chart-title">Participación de Clientes - {mes}</h2>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              labelLine={true}
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
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ fontSize: '18px', paddingLeft: '10px' }} // Ajusta el tamaño de la fuente aquí
              />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const InfoCardAlone = ({ values }) => (
    <div className="info-card-alone">
      <div className="value">
        {values[0].value}
      </div>
      <div className="description-alone">
        {values[0].description}
      </div>
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



const Marca = () => {
  const [totalRegistros, setTotalRegistros] = useState(null);
  const [barData, setBarData] = useState([]);
  const [barDataCiudad, setBarDataCiudad] = useState([]);
  const [totalValorPremio, setTotalValorPremio] = useState(null); 
  const [totalValorPremioCanjeado, setTotalValorPremioCanjeado] = useState(null); 
  const [totalHistoricoRegistros, setTotalClientes] = useState(null);

  const [totalHistoricoClientes, setTotalHistoricoClientes] = useState(null);
  const [totalHistoricoRegistrosMarca, setRegistroHistoricoMarcas] = useState(null);
  const [totalHistoricoValorRegistros, setCantidadRegistros] = useState(null);

  const [lineData, setLineData] = useState([]); // Estado para los datos del gráfico de líneas
  const [vendedor, setVendedor] = useState({ nombre: '', apellido: '' });
  const [marcasRegistradas, setMarcasRegistradas] = useState([]);
  const [productosCanjeados, setProductosCanjeados] = useState([]);
  const [pieData, setPieData] = useState([]);

  const dashboardRef = useRef(null);


  useEffect(() => {
    const fetchTotalRegistros = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cantidad-registros-marca');
        console.log('Respuesta del servidor:', response.data);
        setTotalRegistros(response.data.cantidad);
      } catch (error) {
        console.error('Error al obtener el total de registros:', error);
      }
    };

    const fetchProductosCanjeados = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/productos-marca');
        setProductosCanjeados(response.data);
      } catch (error) {
        console.error('Error al obtener los productos más canjeados:', error);
      }
    };


    const fetchTotalValorPremio = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/valor-registros-marca');
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
      
////LISTO
const fetchBarData = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/productos-marca');
    const items = response.data;

    // Transformar los datos obtenidos de la API
    const transformedData = items.map(item => ({
      name: item.descripcion,
      value: item.cantidad
    }));

    // Obtener solo los primeros 5 elementos
    const limitedData = transformedData.slice(0, 5);

    // Actualizar el estado con los datos transformados y limitados
    setBarData(limitedData);
  } catch (error) {
    console.error('Error al obtener los datos de productos:', error);
  }
};

    const fetchBarDataCiudad = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ruc-clientes-marca');
        const items = response.data;

        // Transformar los datos obtenidos de la API
        const transformedData = items.map(item => ({
          name: item.ciudad,
          value: item.cantidad
        }));

        // Actualizar el estado con los datos transformados
        setBarDataCiudad(transformedData);
      } catch (error) {
        console.error('Error al obtener los datos de productos:', error);
      }
    };
////LISTO
    const fetchTotalClientes = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/cantidad-clientes-marca');
          setTotalClientes(response.data.cantidadClientes);
        } catch (error) {
          console.error('Error al obtener el total de registros históricos:', error);
          setTotalClientes(null);
        }
      };

      const fetchTotalHistoricoClientes = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/cantidad-historico-clientes-marca');
          setTotalHistoricoClientes(response.data.cantidadClientes);
        } catch (error) {
          console.error('Error al obtener el total de registros históricos:', error);
          setTotalHistoricoClientes(null);
        }
      };

      const fetchTotalHistoricoRegistros = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/cantidad-historico-valor-marca');
          setRegistroHistoricoMarcas(response.data.totalValorPremio);
        } catch (error) {
          console.error('Error al obtener el total de registros históricos:', error);
          setRegistroHistoricoMarcas(null);
        }
      };

      const fetchCantidadHistoricoRegistros = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/cantidad-historico-registros-marca');
          setCantidadRegistros(response.data.cantidad);
        } catch (error) {
          console.error('Error al obtener el total de registros históricos:', error);
          setCantidadRegistros(null);
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
          const response = await fetch('http://localhost:5000/api/clientes-marca');
          const data = await response.json();
          
          // Calcula el total
          const total = data.reduce((acc, item) => acc + item.cantidad, 0);
      
          // Ordena los datos por cantidad en orden descendente
          const sortedData = data.sort((a, b) => b.cantidad - a.cantidad);
      
          // Toma los primeros 5 elementos
          const top5Data = sortedData.slice(0, 8);
      
          // Calcula el porcentaje de los primeros 5 elementos
          const top5Transformed = top5Data.map(item => ({
            name: item.canal,
            value: (item.cantidad / total * 100).toFixed(2) // Calcula el porcentaje
          }));
      
          // Calcula la suma de las cantidades de los elementos no incluidos en los primeros 5
          const othersTotal = sortedData.slice(8).reduce((acc, item) => acc + item.cantidad, 0);
      
          // Agrega la categoría "Otros" si hay elementos adicionales
          const othersTransformed = othersTotal > 0 ? [{
            name: 'Otros',
            value: (othersTotal / total * 100).toFixed(2) // Calcula el porcentaje
          }] : [];
      
          // Combina los datos
          const transformedData = [...top5Transformed, ...othersTransformed];
      
          setPieData(transformedData);
          console.log('Datos de PieChart:', transformedData);
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
    fetchTotalClientes();
    fetchLineData(); 
    fetchProductosCanjeados();
    fetchBarDataCiudad();
    fetchTotalHistoricoClientes();
    fetchTotalHistoricoRegistros();
    fetchCantidadHistoricoRegistros();

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
          correo: 'a',
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
  const mes = process.env.REACT_APP_MES; // Valor de la variable de entorno


  return (
    <div className="dashboard">
      <div className="container" ref={dashboardRef}>
        <div className="dashboard-header">
          <img src="/dewallet.png" alt="DeWallet Logo" className="dashboard-logo" />
        </div>
        <h2 className="chart-title-principal">Hola, este es tu resumen en DeWallet hasta el momento</h2>
        <div className="info-cards-container">
      <div className="info-cards-group">  
        <InfoCard
          values={[
            {
              value: totalRegistros !== null ? totalRegistros.toLocaleString() : '0',
              description: '',
            },
          ]}
        />
        <InfoCardAlone
          values={[
            {
              value: '',
              description: `registros de productos en ${mes}`,
            },
          ]}
        />
      </div>
      <div className="info-cards-group">
        <InfoCard
          values={[
            {
              value: totalHistoricoRegistros !== null ? `${totalHistoricoRegistros.toLocaleString()}` : '0',
              description: `clientes en ${mes}`,
            },
          ]}
        />
        <InfoCard
          values={[
            {
              value: totalValorPremio !== null ? `$${totalValorPremio.toLocaleString()}` : '0',
              description: `valor registrado en ${mes}`,
            },
          ]}
        />
      </div>
    
        </div>
        <div className="charts-row-row">
  <div className="title-container">
  <h1 className="custom-title">Histórico</h1>
 
  </div>
  <div className="custom-underline"></div>
  <div className="info-cards-container">
    <InfoCard
      values={[
        {
          value: totalHistoricoClientes !== null ? `${totalHistoricoClientes.toLocaleString()}` : '0',
          description: 'clientes',
        },
      ]}
    />
    <InfoCard
      values={[
        {
          value: totalHistoricoValorRegistros !== null ? `${totalHistoricoValorRegistros.toLocaleString()}` : '0',
          description: 'registros',
        },
      ]}
    />
    <InfoCard
      values={[
        {
          value: totalHistoricoRegistrosMarca !== null ? `$${totalHistoricoRegistrosMarca.toLocaleString()}` : '0',
          description: 'valor registrado',
        },
      ]}
    />
  </div>
</div>

    <div className="charts-row">
        <>
          {barData && barData.length > 0 ? (
            <BarChartComponent data={barData} />
          ) : (
            <div>No existen registros</div>
          )}
        </>
        </div>
        <div className="charts-row">
          <div className="chart-container">
            <PieChartComponent data={pieData} />
          </div>
        </div>
        <h1 className="chart-second-title">Participación por Ciudades</h1>
        <div className="charts-row">
          <div className="chart-container">
        {/*  <>
          {barDataCiudad && barDataCiudad.length > 0 ? (
            <BarChartComponentCiudad data={barDataCiudad} />
          ) : (
            <div>No existen registros</div>
          )}
        </>*/}
        <MapaEcuador />
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

export default Marca;


