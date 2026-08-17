const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001/api";

type RequestOptions = RequestInit & { parseAsText?: boolean };

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = "Request failed.";
    try {
      const data = await response.json();
      message = data?.error ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204 || options.parseAsText) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
