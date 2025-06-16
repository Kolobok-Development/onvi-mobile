import { HelmetOptions } from 'helmet';

// Configuration optimized for mobile API endpoints
export const helmetConfig: HelmetOptions = {
  // Security policy for loading resources
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Allow backend to connect to payment gateways and other necessary external services
      connectSrc: [
        "'self'",
        'https://api.yookassa.ru',
        'https://*.logtail.com',
        'http://ds-cloud.ru',
      ],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      // Disable blocking reporting for mobile app API (clients handle this differently)
      reportUri: null,
      upgradeInsecureRequests: null,
    },
  },

  // Protect against Clickjacking
  xFrameOptions: { action: 'deny' },

  // Strict MIME type checking
  noSniff: true,

  // Disable browser's DNS prefetching
  dnsPrefetchControl: { allow: false },

  // Prevent browser from trying to detect reflected XSS
  // Mobile clients typically handle this differently
  xssFilter: false,

  // Enforce HTTPS connections
  hsts: {
    maxAge: 63072000, // 2 years in seconds
    includeSubDomains: true,
    preload: true,
  },

  // Hide X-Powered-By header to avoid information disclosure
  hidePoweredBy: true,

  // For API, we can disable this
  referrerPolicy: { policy: 'no-referrer' },

  // No permission policy needed for API
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },

  // Cross-origin settings for mobile API
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-site' },

  // Origin isolation - not needed for API
  originAgentCluster: true,
};
