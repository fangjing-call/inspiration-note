import { useCallback } from "react";
import { trpc } from "@/providers/trpc";

export function useAuth() {
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
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

  return {
    user: meQuery.data,
    isLoading: meQuery.isLoading,
    isAuthenticated: !!meQuery.data,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    loginError: loginMutation.error?.message,
    registerError: registerMutation.error?.message,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
