/*const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://serviciosmovil.siglo21.net:8443',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    })
  );
};*/

// src/setupProxy.js
// client/src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3000', // Asegúrate de que el puerto sea correcto
      changeOrigin: true,
    })
  );
};

