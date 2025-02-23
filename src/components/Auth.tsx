import { supabase } from "../supabase";

export function Auth() {
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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
      onClick={handleGoogleLogin}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg border hover:bg-gray-50 transition-colors"
    >
      <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
      Googleでログイン
    </button>
  );
}
