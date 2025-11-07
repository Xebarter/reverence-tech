// Vercel configuration for SPA routing
module.exports = {
  rewrites: [
    // Rewrite everything to index.html to support client-side routing
    { source: '/(.*)', destination: '/index.html' }
  ]
};