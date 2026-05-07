import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const contactService = {
    submit: async (data, type = 'contact') => {
        const endpoint = type === 'brochure' ? '/api/contact/brochure' : '/api/contact';
        return api.post(endpoint, data);
    }
};
