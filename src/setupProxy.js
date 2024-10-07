const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/nasa-api',
    createProxyMiddleware({
      target: 'https://gibs.earthdata.nasa.gov',
      changeOrigin: true,
      pathRewrite: {
        '^/nasa-api': '', // remove /nasa-api prefix when forwarding
      },
    })
  );
  app.use(
    '/sedac-api',
    createProxyMiddleware({
      target: 'https://sedac.ciesin.columbia.edu',
      changeOrigin: true,
      pathRewrite: {
        '^/sedac-api': '', // remove /sedac-api prefix when forwarding
      },
    })
  );
};
