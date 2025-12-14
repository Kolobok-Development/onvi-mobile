const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const geoip = require('geoip-lite');

const app = express();
const PORT = process.env.PORT || 3000;

// Backend API URL - should be set via environment variable
const BACKEND_URL = process.env.BACKEND_URL || 'https://api.onvi-mobile.com';

// Russian IP ranges (CIDR notation) - common ranges
const RUSSIAN_IP_RANGES = [
  // Major Russian IP ranges
  { start: '5.8.0.0', end: '5.8.255.255' },
  { start: '31.131.0.0', end: '31.131.255.255' },
  { start: '37.139.0.0', end: '37.139.255.255' },
  { start: '46.17.0.0', end: '46.17.255.255' },
  { start: '46.21.0.0', end: '46.21.255.255' },
  { start: '46.232.0.0', end: '46.232.255.255' },
  { start: '77.88.0.0', end: '77.88.255.255' },
  { start: '79.142.0.0', end: '79.142.255.255' },
  { start: '84.201.0.0', end: '84.201.255.255' },
  { start: '87.250.0.0', end: '87.250.255.255' },
  { start: '93.158.0.0', end: '93.158.255.255' },
  { start: '95.163.0.0', end: '95.163.255.255' },
  { start: '109.207.0.0', end: '109.207.255.255' },
  { start: '178.154.0.0', end: '178.154.255.255' },
  { start: '185.71.0.0', end: '185.71.255.255' },
  { start: '188.93.0.0', end: '188.93.255.255' },
  { start: '213.180.0.0', end: '213.180.255.255' },
];

// Convert IP to number for range checking
function ipToNumber(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

// Check if IP is in Russian range
function isRussianIP(ip) {
  // First try geoip-lite for accurate detection
  const geo = geoip.lookup(ip);
  if (geo && geo.country === 'RU') {
    return true;
  }
  
  // Fallback to IP range checking
  const ipNum = ipToNumber(ip);
  return RUSSIAN_IP_RANGES.some(range => {
    const startNum = ipToNumber(range.start);
    const endNum = ipToNumber(range.end);
    return ipNum >= startNum && ipNum <= endNum;
  });
}

// Get client IP address
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    '127.0.0.1'
  );
}

// Middleware to block Russian IPs
function blockRussianIPs(req, res, next) {
  const clientIP = getClientIP(req);
  
  // Remove IPv6 prefix if present
  const cleanIP = clientIP.replace(/^::ffff:/, '');
  
  if (isRussianIP(cleanIP)) {
    console.log(`Blocked Russian IP: ${cleanIP}`);
    return res.status(403).json({
      error: 'Access denied',
      message: 'Service not available in your region'
    });
  }
  
  next();
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'onvi-reverse-proxy' });
});

// Apply Russian IP blocking middleware
app.use(blockRussianIPs);

// Proxy configuration
const proxyOptions = {
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/': '/', // Keep the path as is
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward original IP
    const clientIP = getClientIP(req);
    proxyReq.setHeader('X-Forwarded-For', clientIP);
    proxyReq.setHeader('X-Real-IP', clientIP);
    
    console.log(`Proxying ${req.method} ${req.url} from ${clientIP} to ${BACKEND_URL}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Unable to connect to backend service'
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log successful responses
    console.log(`Response ${proxyRes.statusCode} for ${req.method} ${req.url}`);
  }
};

// Apply proxy to all routes
app.use('/', createProxyMiddleware(proxyOptions));

// Start server
app.listen(PORT, () => {
  console.log(`Reverse proxy server running on port ${PORT}`);
  console.log(`Proxying to: ${BACKEND_URL}`);
  console.log(`Blocking Russian IPs`);
});

