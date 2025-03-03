import { FcGoogle } from "react-icons/fc";

import { supabase } from "../supabase";

export function Auth() {
  const getRedirectUrl = () => {
    const isProd = import.meta.env.PROD;
    return isProd
      ? `${import.meta.env.VITE_PRODUCTION_URL || window.location.origin}/auth/callback`
      : `${window.location.origin}/auth/callback`;
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getRedirectUrl(),
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(error);
      alert("ログインエラーが発生しました");
    }
  };

  return (
    // 画面中央に配置
    <div className="flex justify-center items-center h-screen">
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg border hover:bg-gray-50 transition-colors"
      >
        <FcGoogle className="w-5 h-5" />
        Sign in with Google
      </button>
    </div>
  );
}
