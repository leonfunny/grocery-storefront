import axios from 'axios';
import Cookies from 'js-cookie';

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
}

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('grocery_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const shopApi = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

export async function getSalon(slug: string) {
  const { data } = await shopApi.get(`/public/salon/${slug}`);
  return data;
}
