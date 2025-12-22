import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Resolve API base in this order:
  // 1. Vite env `VITE_API_URL` if provided
  // 2. If running on localhost (any port) and backend likely on 5000, use http://localhost:5000
  // 3. Otherwise use relative paths (same origin)
  // Prefer an explicit `VITE_API_URL` when provided (for standalone backend).
  // Otherwise use relative paths so the app works when served together (e.g. integrated dev server on port 3000).
  const viteApiUrl = typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_API_URL : undefined;
  const devApiBase = viteApiUrl || "";
  const fullUrl = url.startsWith("http") ? url : `${devApiBase}${url}`;
  const token = localStorage.getItem("deepshift_access_token");
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem("deepshift_access_token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // Resolve API base the same way as apiRequest
    const viteApiUrl = typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_API_URL : undefined;
    const devApiBase = viteApiUrl || "";
    const queryUrl = queryKey.join("/") as string;
    const fullQueryUrl = queryUrl.startsWith("http") ? queryUrl : `${devApiBase}${queryUrl}`;

    const res = await fetch(fullQueryUrl, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
