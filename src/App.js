import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import Vendedor from './Vendedor'; // Asegúrate de crear este componente
import Marca from './Marca'; // Asegúrate de crear este componente
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vendedor" element={<Vendedor />} />
          <Route path="/marca" element={<Marca />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
