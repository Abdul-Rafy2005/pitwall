const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

export const API_BASE_URL = trimTrailingSlash(
	import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
);

export const apiUrl = (path = '') => {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${API_BASE_URL}${normalizedPath}`;
};

const resolveWsHost = () => {
	try {
		return new URL(API_BASE_URL).host;
	} catch {
		if (typeof window !== 'undefined') {
			return window.location.host;
		}
		return 'localhost:8080';
	}
};

const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';

export const WS_URL = `${wsProtocol}://${resolveWsHost()}/ws`;

export const wsUrl = (path = '/ws') => {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${wsProtocol}://${resolveWsHost()}${normalizedPath}`;
};
