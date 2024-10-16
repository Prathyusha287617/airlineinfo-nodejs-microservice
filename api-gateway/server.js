const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 2000;

// Define the URLs of your microservices
const AIRPLANE_SERVICE_URL = 'http://localhost:2001/airplane';
const FLIGHT_SERVICE_URL = 'http://localhost:2002/flight';
const PASSENGER_SERVICE_URL = 'http://localhost:2003/passenger';

// Proxy requests to the Airplane service
app.use('/airplane', createProxyMiddleware({ target: AIRPLANE_SERVICE_URL, changeOrigin: true }));

// Proxy requests to the Flight service
app.use('/flight', createProxyMiddleware({ target: FLIGHT_SERVICE_URL, changeOrigin: true }));

// Proxy requests to the Passenger service
app.use('/passenger', createProxyMiddleware({ target: PASSENGER_SERVICE_URL, changeOrigin: true }));

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
