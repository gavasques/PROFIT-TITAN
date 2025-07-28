import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const token = localStorage.getItem("auth_token");

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        // apiRequest now automatically adds the token
        const response = await apiRequest("/api/auth/user");
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
    enabled: !!token, // Only fetch if token exists
  });

  const logout = async () => {
    try {
      // Call logout endpoint (apiRequest automatically adds token)
      await apiRequest("/api/auth/logout", {
        method: "POST",
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
    isLoading,
    isAuthenticated: !!user && !!token,
    logout,
    error,
  };
}