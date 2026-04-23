/**
 * Frontend Configuration
 * This file contains the API configuration
 */

// LOCAL TESTING: Use localhost backend
// const API_BASE_URL = 'http://localhost/gaon-backend';

// PRODUCTION: Uncomment below line when deploying to hosting
const API_BASE_URL = 'https://adminsamgadevi.infinityfree.me';

// API Key for authentication
const API_KEY = 'a7f3e9c2b8d4f1a6e5c9b7d3f8a2e6c4b9d7f1a5e3c8b6d2f9a4e7c1b5d8f3a6';

// Set API base URL globally
window.API_BASE_URL = API_BASE_URL;

// Set API key globally
window.API_KEY = API_KEY;

// Helper function to build full API URL
window.getApiUrl = function(endpoint) {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${window.API_BASE_URL}/${cleanEndpoint}`;
};

console.log('✅ Frontend initialized with API Base URL:', window.API_BASE_URL);
console.log('✅ API Key configured:', API_KEY ? 'Yes' : 'No');
console.log('📍 Mode: PRODUCTION (Live Backend)');
