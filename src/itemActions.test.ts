import { Item } from "./domain/item";
import { handleSearchItemList } from "./itemActions";
import { supabase } from "./supabase";
import { describe, it, expect, vi, beforeEach } from "vitest";

// supabaseのモック
vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
  },
}));

describe("itemActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleSearchItemList", () => {
    it("キーワードが提供された場合、フィルタリングされたアイテムリストを返すこと", async () => {
      // モックの設定
      const mockItems = [
        {
          id: 1,
          title: "テスト商品",
          author: null,
          image: null,
          format: null,
          point: 0 as Item["point"],
          created_at: "2025-01-01T00:00:00Z",
        },
      ];
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockResolvedValue({ data: mockItems, error: null }),
        }),
      });

      const formData = new FormData();
      formData.append("formType", "search");
      formData.append("keyword", "テスト");

      const prevState = {
        allItemList: [],
        filteredItemList: [
          {
            id: 1,
            title: "テスト商品",
            author: null,
            image: null,
            format: null,
            point: 0 as Item["point"],
            created_at: "2025-01-01T00:00:00Z",
          },
        ],
        keyword: "テスト",
      };

      const result = await handleSearchItemList(prevState, formData);

      expect(result).toEqual({
        ...prevState,
        filteredItemList: mockItems,
        keyword: "テスト",
      });
    });

    it("resetがtrueの場合、フィルタリングされたアイテムリストをnullに設定すること", async () => {
      const formData = new FormData();
      formData.append("formType", "search");
      formData.append("reset", "true");

      const prevState = {
        allItemList: [],
        filteredItemList: [
          {
            id: 1,
            title: "テスト商品",
            author: null,
            image: null,
            format: null,
            point: 0 as Item["point"],
            created_at: "2025-01-01T00:00:00Z",
          },
        ],
        keyword: "テスト",
      };

      const result = await handleSearchItemList(prevState, formData);

      expect(result).toEqual({
        ...prevState,
        filteredItemList: null,
        keyword: "",
      });
    });
  });
});
