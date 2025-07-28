import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const token = localStorage.getItem("auth_token");

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      if (!token) return null;
      
      try {
        const response = await apiRequest("/api/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response;
      } catch (error: any) {
        // If token is invalid, remove it
        if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
          localStorage.removeItem("auth_token");
        }
        throw error;
      }
    },
    retry: false,
    enabled: !!token,
  });

  const logout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  };

  return {
    user,
    isLoading: isLoading && !!token,
    isAuthenticated: !!user && !!token,
    logout,
    error,
  };
}