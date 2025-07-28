import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const token = localStorage.getItem("auth_token");

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        // In development mode, the backend handles auth without requiring a token
        const response = await apiRequest("/api/auth/user", {
          headers: token ? {
            Authorization: `Bearer ${token}`,
          } : {},
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
    enabled: !!token, // Only run query if token exists
  });

  const logout = async () => {
    try {
      // Call logout endpoint
      await apiRequest("/api/auth/logout", {
        method: "POST",
        headers: token ? {
          Authorization: `Bearer ${token}`,
        } : {},
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear token and redirect, even if API call fails
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
  };

  return {
    user,
    isLoading: token ? isLoading : false, // Don't show loading if no token
    isAuthenticated: !!user,
    logout,
    error,
  };
}