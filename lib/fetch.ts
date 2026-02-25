import { useState, useEffect, useCallback } from "react";

// 🔹 Replace with your laptop IP when testing on phone
const API_BASE = "http://172.20.203.102:8000";

/**
 * Generic API caller
 */
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

  // Read response once
  const text = await response.text();

  // Try parsing JSON safely
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    console.warn("⚠️ API Error:", response.status, data);

    throw new Error(
        typeof data === "string"
            ? data
            : data?.detail || `HTTP ${response.status}`
    );
  }

  console.log("✅ API Success:", data);

  return data as T;
};

/**
 * React hook for fetching data
 */
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
  }, [path]); // ✅ only depend on path

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return { data, loading, error, refetch: fetchData };
};