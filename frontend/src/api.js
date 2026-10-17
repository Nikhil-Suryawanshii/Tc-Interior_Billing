import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data instanceof Blob) {
      return Promise.reject(new Error('The PDF could not be downloaded'));
    }
    const body = error.response?.data;
    const next = new Error(body?.message || 'Something went wrong');
    next.errors = body?.errors || {};
    next.status = error.response?.status;
    return Promise.reject(next);
  },
);

export async function getData(url, params) {
  const response = await api.get(url, { params });
  return response.data;
}

export async function send(method, url, data) {
  const response = await api.request({ method, url, data });
  return response.data;
}

export async function upload(url, file) {
  const data = new FormData();
  data.append('file', file);
  const response = await api.post(url, data);
  return response.data;
}

export async function openPdf(url, filename, print) {
  const response = await api.get(url, { responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const objectUrl = URL.createObjectURL(blob);
  if (print) {
    const popup = window.open(objectUrl);
    if (popup) popup.addEventListener('load', () => popup.print());
    return;
  }
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

export function exportUrl(slug, params) {
  const base = api.defaults.baseURL;
  const search = new URLSearchParams(params);
  return `${base}/reports/${slug}/export?${search.toString()}`;
}

export default api;
