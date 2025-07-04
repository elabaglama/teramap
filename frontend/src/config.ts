const isDevelopment = import.meta.env.DEV;

export const API_URL = isDevelopment 
  ? 'http://localhost:3001/api'
  : 'https://www.teramap.works/api'; 