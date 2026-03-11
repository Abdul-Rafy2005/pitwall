import { API_BASE_URL } from '../config/api.js';

export const fetchLiveTiming = async () => {
  const res = await fetch(`${API_BASE_URL}/timing/live`);
  return res.json();
};

export const fetchHealth = async () => {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
};
