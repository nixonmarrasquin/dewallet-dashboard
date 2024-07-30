const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://serviciosmovil.siglo21.net:8443',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    })
  );
};
