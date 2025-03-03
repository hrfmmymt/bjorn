import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URLからハッシュパラメータを処理
        const hashParams = window.location.hash;

        if (hashParams) {
          // セッションを取得して確立
          const { error } = await supabase.auth.getSession();

          if (error) {
            throw error;
          }

          // ホームにリダイレクト
          navigate("/");
        } else {
          console.log("No hash parameters found");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "認証エラーが発生しました",
        );
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <span>エラー: {error}</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <span className="text-2xl font-bold">認証中...</span>
    </div>
  );
}
