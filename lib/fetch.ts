import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";

export class APIError extends Error {
  status: number;
  name = "APIError"; // ← add this
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, APIError.prototype); // ← add this
  }
}

export const fetchAPI = async <T>(
    path: string,
    options?: RequestInit
): Promise<T> => {
  const url = `${API_BASE}${path}`;
  console.log("📡 Calling API:", url);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    console.warn("⚠️ API Error:", response.status, JSON.stringify(data, null, 2));
    throw new APIError(
        typeof data === "string"
            ? data
            : data?.detail || `HTTP ${response.status}`,
        response.status
    );
  }

  console.log("✅ API Success:", data);
  return data as T;
};

export const useFetch = <T>(
    path: string,
    options?: RequestInit,
    autoFetch: boolean = true
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAPI<T>(path, options);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (autoFetch) {
      void fetchData();
    }
  }, [fetchData, autoFetch]);

  return { data, loading, error, refetch: fetchData };
};