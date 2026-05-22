import { useCallback, useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";

export function useAuth() {
  const utils = trpc.useUtils();
  const [timedOut, setTimedOut] = useState(false);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    gcTime: 0,
  });

  // If API takes more than 3 seconds, assume it's unavailable
  useEffect(() => {
    if (meQuery.isLoading) {
      const timer = setTimeout(() => {
        setTimedOut(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [meQuery.isLoading]);

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

  // API is unavailable if query errors OR times out
  const apiUnavailable = meQuery.isError || timedOut;
  // Only show loading for first 3 seconds
  const isLoading = meQuery.isLoading && !timedOut;

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
