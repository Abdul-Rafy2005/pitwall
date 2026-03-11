import { apiUrl } from '../config/api.js';

export const fetchLiveTiming = async () => {
  const res = await fetch(apiUrl('/api/timing/live'));
  return res.json();
};

export const fetchHealth = async () => {
  const res = await fetch(apiUrl('/api/health'));
  return res.json();
};
