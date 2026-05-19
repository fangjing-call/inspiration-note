import { useCallback } from "react";
import { trpc } from "@/providers/trpc";

export function useAuth() {
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    // If API is down, fail fast and fall back to offline mode
    staleTime: Infinity,
    gcTime: 0,
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      utils.auth.me.invalidate();
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      utils.auth.me.invalidate();
    },
  });

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    utils.auth.me.invalidate();
    window.location.reload();
  }, [utils]);

  // When API is unavailable (query errors), treat as not authenticated
  // This allows the app to fall back to localStorage mode
  const apiUnavailable = meQuery.isError;
  const isLoading = meQuery.isLoading && !meQuery.isError;

  return {
    user: meQuery.data,
    isLoading,
    isAuthenticated: !!meQuery.data,
    apiUnavailable,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    loginError: loginMutation.error?.message,
    registerError: registerMutation.error?.message,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
