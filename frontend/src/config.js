/**
 * Global Configuration for API Base URL
 */
export const API_BASE_URL = window.CUSTOM_API_BASE_URL || (
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8000/api'
        : '/api'
);
