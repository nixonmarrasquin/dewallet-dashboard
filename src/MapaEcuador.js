import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps";

// URL del archivo GeoJSON de Ecuador
const geoUrl =
  "https://raw.githubusercontent.com/jpmarindiaz/geo-collection/master/ecu/ecuador.geojson";

// Lista de colores
const COLORS = [
    '#004e98', // Azul oscuro
    'black', // Rosa claro
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
  
  
// Función para calcular el tamaño del círculo basado en la cantidad
const getCircleRadius = (quantity) => {
  return Math.sqrt(quantity) * 0.2; // Ajusta la fórmula para obtener un tamaño adecuado
};

// Función para obtener el color basado en el índice
const getColor = (index) => {
  return COLORS[index % COLORS.length]; // Usa el índice para seleccionar un color
};

const MapChart = () => {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // URL de la API que devuelve los datos
    const apiUrl = "http://localhost:5000/api/ruc-clientes-marca";

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const cityCoordinates = {
            GUAYAQUIL: [-79.9558, -2.1700],
            QUITO: [-78.4678, -0.180],
            LOJA: [-79.2020, -4.0050],
            'SANTO DOMINGO': [-79.2636, -0.2389],
            MACHALA: [-79.9601, -3.2491],
            PORTOVIEJO: [-80.4561, -1.0549],
            MANTA: [-80.7014, -0.9537],
            CUENCA: [-79.4623, -2.9006],
            LATACUNGA: [-78.6164, -0.9163],
            PASAJE: [-79.8235, -3.2812],
            AMBATO: [-78.6232, -1.2427],
            ESMERALDAS: [-79.6516, 0.9600],
            TENA: [-77.8216, -0.9811],
            IBARRA: [-79.8612, 0.3438],
            BABAHOYO: [-79.5366, -1.8042],
            RIOBAMBA: [-78.6414, -1.6660],
            PUYO: [-77.9836, -1.5000],
            QUEVEDO: [-79.4674, -1.0467],
            PIÑAS: [-79.5261, -3.7210],
            ZAMORA: [-78.9797, -4.0685],
            DAULE: [-79.9303, -1.9216],
            AZOGUES: [-79.1838, -2.7405],
          };
          

        // Formatea los datos de la API para los marcadores
        const formattedMarkers = data.map((item, index) => ({
          markerOffset: -15,
          name: item.ciudad,
          coordinates: cityCoordinates[item.ciudad] || [0, 0], // Usa coordenadas predeterminadas si la ciudad no está en el mapa
          quantity: item.cantidad * 150,
          index: index, // Añade el índice para asignar colores
        }));

        setMarkers(formattedMarkers);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  return (
<div style={{ display: 'flex', alignItems: 'center' }}> {/* Cambiado alignItems a 'center' */}
      <div style={{ marginRight: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: 40,  textAlign: 'left' }}>
        <h2 style={{ alignItems: 'left' }}>Cantidad de Registros del mes</h2>
          {markers.map((marker, index) => (
            <div key={marker.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: getColor(index),
                  marginRight: 10
                }}
              ></div>
             <div style={{ fontFamily: 'system-ui', fontSize: 15, color: '#5D5A6D', textAlign: 'left', whiteSpace: 'nowrap' }}>
            {marker.name}: <strong>{marker.quantity / 150}</strong>
            </div>

            </div>
          ))}
        </div>
      </div>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 4650, // Ajusta la escala para hacer zoom más grande
          center: [-78, -1.35] // Centra el mapa en Ecuador
          
        }}
        style={{ marginTop: -60, paddingBottom: 0 }} // Añade los estilos aquí

      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#EAEAEC"
                stroke="#D6D6DA"
                strokeWidth={0.5}
              />
            ))
          }
        </Geographies>
        {markers.map((marker, index) => (
          <Marker key={marker.name} coordinates={marker.coordinates}>
            <circle
              r={getCircleRadius(marker.quantity)} // Ajusta el radio del círculo basado en la cantidad
              fill={getColor(index)} // Usa la función getColor para asignar el color
              stroke="none" // Elimina el borde alrededor del círculo
            />
            <text
              textAnchor="middle"
              y={marker.markerOffset - 5} // Ajusta la posición del texto para que esté arriba del marcador
              style={{ fontFamily: "system-ui", fontSize: 10, fill: "#5D5A6D"}}
            >
              {marker.name}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
};

export default MapChart;
