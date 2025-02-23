import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  use,
  useActionState,
  useOptimistic,
  useRef,
  startTransition,
  FormEvent,
} from "react";
import { CgClose } from "react-icons/cg";

import { AuthProvider } from "./contexts/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import { Auth } from "./components/Auth";
import { AuthCallback } from "./routes/AuthCallback";
import { Item, ItemState } from "./domain/item";
import {
  handleAddItem,
  handleSearchItemList,
  handleUpdateItemPoint,
  handleDeleteItem,
} from "./itemActions";
import { supabase } from "./supabase";

async function fetchManageItem(): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

const fetchManageItemPromise = fetchManageItem();

function ItemManager() {
  const initialItemList = use(fetchManageItemPromise);
  const addFormRef = useRef<HTMLFormElement>(null);
  const searchFormRef = useRef<HTMLFormElement>(null);
  const { signOut } = useAuth();

  const [itemState, updateItemState, isPending] = useActionState(
    async (
      prevState: ItemState | undefined,
      formData: FormData
    ): Promise<ItemState> => {
      if (!prevState) throw new Error("Invalid state");

      const action = formData.get("formType") as
        | "add"
        | "search"
        | "update"
        | "delete";
      const actionHandlerList = {
        add: () => handleAddItem(prevState, formData, updateOptimisticItemList),
        search: () => handleSearchItemList(prevState, formData),
        update: () =>
          handleUpdateItemPoint(prevState, formData, updateOptimisticItemList),
        delete: () =>
          handleDeleteItem(prevState, formData, updateOptimisticItemList),
      } as const;

      if (!Object.keys(actionHandlerList).includes(action)) {
        throw new Error(`Invalid action: ${action}`);
      }

      return actionHandlerList[action]();
    },
    {
      allItemList: initialItemList,
      filteredItemList: null,
      keyword: "",
    }
  );

  const [optimisticItemList, updateOptimisticItemList] = useOptimistic<Item[]>(
    itemState?.filteredItemList ?? itemState?.allItemList ?? []
  );

  const handleDeleteClick = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (window.confirm("このアイテムを削除してもよろしいですか？")) {
      const formData = new FormData(e.currentTarget);
      updateItemState(formData);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/\//g, "-");
  };

  const closeModal = () => {
    (document.getElementById("my_modal_2") as HTMLDialogElement).close();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <button
          onClick={signOut}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors ml-auto"
        >
          ログアウト
        </button>
      </header>

      <button
        className="btn"
        onClick={() =>
          (
            document.getElementById("my_modal_2") as HTMLDialogElement
          )?.showModal()
        }
      >
        新しいアイテムを追加
      </button>
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box relative">
          <h3 className="font-bold text-lg mb-4">アイテムの追加</h3>
          <form
            action={updateItemState}
            ref={addFormRef}
            className="flex flex-col gap-2"
          >
            <input type="hidden" name="formType" value="add" />
            <div>
              <label htmlFor="title" className="flex items-center text-sm mb-1">
                <span>タイトル</span>
                <span className="text-rose-500 ml-1">(必須)</span>
              </label>
              <input
                id="title"
                type="text"
                name="title"
                required
                className="w-full border rounded px-2 py-1 mb-4"
              />
            </div>
            <div>
              <label htmlFor="author" className="block text-sm mb-1">
                著者
              </label>
              <input
                id="author"
                type="text"
                name="author"
                className="w-full border rounded px-2 py-1 mb-8"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-24 mx-auto bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition-colors"
            >
              追加
            </button>
          </form>
          <button
            className="absolute top-6 right-6"
            type="button"
            onClick={closeModal}
          >
            <CgClose aria-label="ダイアログを閉じる" size={28} />
          </button>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>ダイアログを閉じる</button>
        </form>
      </dialog>

      <form
        ref={searchFormRef}
        action={updateItemState}
        className="flex gap-2 items-end mb-4"
      >
        <div>
          <input type="hidden" name="formType" value="search" />
          <label htmlFor="keyword" className="block text-sm mb-1">
            キーワード
          </label>
          <input
            id="keyword"
            type="text"
            name="keyword"
            defaultValue={itemState.keyword}
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition-colors"
        >
          検索
        </button>
        {itemState.filteredItemList && (
          <button
            type="button"
            onClick={() => {
              startTransition(() => {
                const formData = new FormData();
                formData.append("formType", "search");
                formData.append("reset", "true");
                updateItemState(formData);
                if (searchFormRef.current) {
                  searchFormRef.current.reset();
                }
              });
            }}
            disabled={isPending}
            className="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600 transition-colors"
          >
            絞り込み解除
          </button>
        )}
      </form>

      <table className="min-w-full">
        <thead>
          <tr>
            <th className="py-2">タイトル</th>
            <th className="py-2">著者</th>
            <th className="py-2">追加日時</th>
            <th className="py-2">ポイント</th>
            <th className="py-2">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {optimisticItemList.map((item: Item) => (
            <tr key={item.id}>
              <td className="py-2">{item.title}</td>
              <td className="py-2">{item.author || "N/A"}</td>
              <td className="py-2">{formatDate(item.created_at)}</td>
              <td className="py-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    updateItemState(formData);
                  }}
                  className="inline"
                >
                  <input type="hidden" name="formType" value="update" />
                  <input type="hidden" name="id" value={item.id} />
                  <select
                    name="point"
                    value={item.point}
                    onChange={(e) => {
                      startTransition(() => {
                        const formData = new FormData(e.target.form!);
                        formData.set("point", e.target.value);
                        updateItemState(formData);
                      });
                    }}
                    className="border rounded px-2 py-1"
                  >
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </form>
              </td>
              <td className="py-2">
                <form onSubmit={handleDeleteClick} className="inline">
                  <input type="hidden" name="formType" value="delete" />
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                  >
                    削除
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return !user ? <Auth /> : <ItemManager />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<AppContent />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
