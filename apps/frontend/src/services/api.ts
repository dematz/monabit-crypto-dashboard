const API_URL = import.meta.env.VITE_API_URL as string;

let _getToken: (() => string | null) | null = null;
let _refreshToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => string | null) {
  _getToken = fn;
}

export function setRefreshTokenFn(fn: () => Promise<string | null>) {
  _refreshToken = fn;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = _getToken?.();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && _refreshToken) {
    const newToken = await _refreshToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
