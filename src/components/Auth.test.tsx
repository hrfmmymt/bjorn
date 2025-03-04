import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../supabase";
import { Auth } from "./Auth";

// supabaseのモック
vi.mock("../supabase", () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(),
    },
  },
}));

describe("Auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ログインボタンが表示されること", () => {
    render(<Auth />);
    const loginButton = screen.getByText(/Sign in with Google/i);
    expect(loginButton).toBeInTheDocument();
  });

  it("ボタンがクリックされた場合、signInWithOAuthが呼び出されること", () => {
    // モック関数の設定
    const mockSignIn = vi.fn().mockResolvedValue({ error: null });
    (
      supabase.auth.signInWithOAuth as ReturnType<typeof vi.fn>
    ).mockImplementation(mockSignIn);

    render(<Auth />);
    const loginButton = screen.getByText(/Sign in with Google/i);

    fireEvent.click(loginButton);

    expect(mockSignIn).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: expect.any(String),
      },
    });
  });
});
