import axios from 'axios';
import { config } from 'dotenv';
config();

export const api = axios.create({
    baseURL: process.env.BACKEND_URL || 'http://localhost:9000/api',
    timeout: 5000,
});

export const getRandomMusic = (token) => api.get('/music/random', { headers: { Authorization: `Bearer ${token}` } });

export const addMusic = (data, token) => api.post('/music', data, { headers: { Authorization: `Bearer ${token}` } });

export const getAlbums = (token) => api.get('/album', { headers: { Authorization: `Bearer ${token}` } });

export const createAlbum = (data, token) => api.post('/album', data, { headers: { Authorization: `Bearer ${token}` } });
