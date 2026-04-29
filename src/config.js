export const API_BASE_URL = window.location.hostname === '76.13.38.150' 
  ? 'http://76.13.38.150:8503' 
  : 'https://api-scouting.theanalyst.cloud';

export const CLIPMAKER_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? ''
  : 'https://api-clipmaker.theanalyst.cloud';
