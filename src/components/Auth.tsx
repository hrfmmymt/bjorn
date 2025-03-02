import { supabase } from "../supabase";

export function Auth() {
  const getRedirectUrl = () => {
    const isProd = import.meta.env.PROD;
    return isProd 
      ? `${window.location.origin}/auth/callback`
      : 'http://localhost:3000/auth/callback';
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
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg border hover:bg-gray-50 transition-colors"
    >
      <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
      Googleでログイン
    </button>
  );
}
