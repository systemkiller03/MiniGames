const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
    throw new Error('VITE_API_URL is not defined');
}

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            Accept: 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}
