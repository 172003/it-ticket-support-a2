import axios from 'axios';

// All API calls use paths like '/api/tickets', so the base URL is empty:
// - local dev: package.json "proxy" forwards /api to http://localhost:5001
// - AWS: Nginx on each EC2 instance forwards /api to the backend, behind the ALB
// To point at another server, set REACT_APP_API_URL when building.
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
