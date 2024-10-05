const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/generate-map',
    createProxyMiddleware({
      target: 'http://localhost:5001', // Flask server URL
      changeOrigin: true,
    })
  );
};
