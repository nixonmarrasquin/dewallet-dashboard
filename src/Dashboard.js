import React, { useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import axios from 'axios';
import './Dashboard.css';

const barData = [
  { name: 'Producto A', value: 200 },
  { name: 'Producto B', value: 150 },
  { name: 'Producto C', value: 120 },
  { name: 'Producto D', value: 100 },
  { name: 'Producto E', value: 50 },
];

const lineData = [
  { year: 2000, 'North America': 1.1, Asia: 0.2, Europe: 0.35, 'South America': 0.7 },
  { year: 2020, 'North America': 0.48, Asia: 0.22, Europe: 0.35, 'South America': 0.9 },
];

const pieData = [
  { name: 'Producto A', value: 41.43 },
  { name: 'Producto B', value: 35.71 },
  { name: 'Producto C', value: 22.86 },
];

const COLORS = ['#fca311', '#14213d', '#000000'];

const BarChartComponent = ({ data }) => (
  <div className="chart-container">
    <h2 className="chart-title">Productos DeWallet</h2>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ right: 100, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 200]} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 20 }} width={150} />
        <Tooltip />
        <Bar dataKey="value" fill="#14213d" barSize={50} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const LineChartComponent = ({ data }) => (
  <div className="chart-container">
    <h2 className="chart-title">Tendencias por Región</h2>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="North America" stroke="#fca311" />
        <Line type="monotone" dataKey="Asia" stroke="#14213d" />
        <Line type="monotone" dataKey="Europe" stroke="#000000" />
        <Line type="monotone" dataKey="South America" stroke="#fb8500" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const PieChartComponent = ({ data }) => (
  <div className="chart-container">
    <h2 className="chart-title">Distribución de Géneros</h2>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ percent }) => `${(percent * 100).toFixed(2)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const InfoCard = ({ value, description }) => (
  <div className="info-card">
    <h2 className="info-value">{value}</h2>
    <p>{description}</p>
  </div>
);

const Dashboard = () => {
  const dashboardRef = useRef(null);

  useEffect(() => {
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

        // Download the image
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'dashboard-dewallet.jpg';
        link.click();

        // Send the image via email
        axios.post('https://serviciosmovil.siglo21.net:8443/api/enviarCorreo', {
          correo: 'gcaiza@siglo21.net',
          asunto: 'Prueba Dashboard DeWallet✅',
          cuerpo: `<!DOCTYPE html>
            <html>
            <body>
              <p>Adjunto el dashboard generado como imagen:</p>
              <img src="${imgData}" alt="Dashboard DeWallet" />
            </body>
            </html>`,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then(response => {
          console.log('Correo enviado con éxito:', response.data);
        })
        .catch(error => {
          console.error('Error al enviar el correo:', error);
        });
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
    }, 2000);

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
        <BarChartComponent data={barData} />
        
        <div className="info-cards">
          <InfoCard value="50%" description="datos informativos" />
          <InfoCard value="45%" description="datos informativos" />
        </div>
        
        <div className="charts-row">
          <LineChartComponent data={lineData} />
          <PieChartComponent data={pieData} />
        </div>
        
        <InfoCard value="000.00$ - 000.00$" description="datos informativos" />
      </div>
    </div>
  );
};

export default Dashboard;
