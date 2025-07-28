import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey, signal }) => {
        let url = queryKey[0] as string;
        
        // Handle query parameters if present
        if (queryKey[1] && typeof queryKey[1] === 'object') {
          const params = new URLSearchParams();
          Object.entries(queryKey[1]).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              params.append(key, String(value));
            }
          });
          if (params.toString()) {
            url += `?${params.toString()}`;
          }
        }
        
        // Get auth token for authenticated requests
        const token = localStorage.getItem("auth_token");
        const headers: any = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
          credentials: "same-origin",
          headers,
          signal,
        });

        if (!response.ok) {
          const error = new Error(
            `${response.status}: ${response.statusText}`
          );
          (error as any).response = response;
          throw error;
        }

        return response.json();
      },
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 1000,
    },
  },
});

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  // Get auth token
  const token = localStorage.getItem("auth_token");
  const headers: any = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "same-origin",
  });

  if (!response.ok) {
    const error = new Error(`${response.status}: ${response.statusText}`);
    (error as any).response = response;
    throw error;
  }

  return response.json();
}