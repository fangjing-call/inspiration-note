import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { THEMES } from "@/types";

type Theme = (typeof THEMES)[number];

export function LoginPage({ theme }: { theme: Theme }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const { login, register, isLoggingIn, isRegistering } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("请填写所有字段");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (!isLogin && password.length < 6) {
      setError("密码至少6位");
      return;
    }

    try {
      if (isLogin) {
        await login({ username: username.trim(), password });
      } else {
        await register({ username: username.trim(), password });
      }
    } catch (err: any) {
      setError(err.message || "操作失败，请重试");
    }
  };

  return (
    <div
      className="w-screen h-screen flex items-center justify-center p-4"
      style={{ background: theme.bg }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        <h1
          className="text-2xl font-bold text-center mb-2"
          style={{ color: theme.text, fontFamily: "'Noto Serif SC', Georgia, serif" }}
        >
          灵感速记
        </h1>
        <p className="text-center text-sm mb-8" style={{ color: theme.textMuted }}>
          {isLogin ? "登录你的账号" : "注册新账号"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="用户名"
              className="w-full px-4 py-3 rounded-xl bg-white/20 outline-none text-sm transition-all duration-200 focus:bg-white/30"
              style={{ color: theme.text }}
              autoComplete="username"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              className="w-full px-4 py-3 rounded-xl bg-white/20 outline-none text-sm transition-all duration-200 focus:bg-white/30"
              style={{ color: theme.text }}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>
          {!isLogin && (
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="确认密码"
                className="w-full px-4 py-3 rounded-xl bg-white/20 outline-none text-sm transition-all duration-200 focus:bg-white/30"
                style={{ color: theme.text }}
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <div className="text-sm text-center" style={{ color: "#c44" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn || isRegistering}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{
              background: theme.accent,
              color: "#fff",
            }}
          >
            {isLogin
              ? isLoggingIn
                ? "登录中..."
                : "登录"
              : isRegistering
                ? "注册中..."
                : "注册"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-sm transition-all duration-200 hover:opacity-80"
            style={{ color: theme.textMuted }}
          >
            {isLogin ? "没有账号？点击注册" : "已有账号？点击登录"}
          </button>
        </div>
      </div>
    </div>
  );
}
