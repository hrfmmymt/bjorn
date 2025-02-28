import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  use,
  useActionState,
  useOptimistic,
  useRef,
  startTransition,
  FormEvent,
  useState,
  useEffect,
} from "react";
import { CgClose } from "react-icons/cg";
import { HiPlus, HiQrcode, HiCamera, HiSearch, HiTrash } from "react-icons/hi";

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
  handleUpdateItemField,
} from "./itemActions";
import { supabase } from "./supabase";
import { BarcodeScannerModal } from "./features/items/components/BarcodeScannerModal";
import { User } from "@supabase/supabase-js";

async function fetchManageItem(): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

const fetchManageItemPromise = fetchManageItem();

function ItemManager({ user }: { user: User }) {
  const initialItemList = use(fetchManageItemPromise);
  const addFormRef = useRef<HTMLFormElement>(null);
  const searchFormRef = useRef<HTMLFormElement>(null);
  const { signOut } = useAuth();
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    id: number;
    field: "title" | "author" | "image" | "format";
    value: string;
  } | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const authorInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const formatInputRef = useRef<HTMLInputElement>(null);

  const [itemState, updateItemState, isPending] = useActionState(
    async (
      prevState: ItemState | undefined,
      formData: FormData,
    ): Promise<ItemState> => {
      if (!prevState) throw new Error("Invalid state");

      const action = formData.get("formType") as
        | "add"
        | "search"
        | "update"
        | "delete"
        | "updateField";
      const actionHandlerList = {
        add: () => handleAddItem(prevState, formData, updateOptimisticItemList),
        search: () => handleSearchItemList(prevState, formData),
        update: () =>
          handleUpdateItemPoint(prevState, formData, updateOptimisticItemList),
        delete: () =>
          handleDeleteItem(prevState, formData, updateOptimisticItemList),
        updateField: () =>
          handleUpdateItemField(prevState, formData, updateOptimisticItemList),
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
    },
  );

  const [optimisticItemList, updateOptimisticItemList] = useOptimistic<Item[]>(
    itemState?.filteredItemList ?? itemState?.allItemList ?? [],
  );

  useEffect(() => {
    if (!editingCell) return;

    if (editingCell.field === "title" && titleInputRef.current) {
      titleInputRef.current.focus();
    } else if (editingCell.field === "author" && authorInputRef.current) {
      authorInputRef.current.focus();
    } else if (editingCell.field === "image" && imageInputRef.current) {
      imageInputRef.current.focus();
    } else if (editingCell.field === "format" && formatInputRef.current) {
      formatInputRef.current.focus();
    }
  }, [editingCell]);

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

  const closeAddItemModal = () => {
    (document.getElementById("add_item_modal") as HTMLDialogElement)?.close();
    if (addFormRef.current) {
      addFormRef.current.reset();
    }
  };

  const openScannerModal = () => {
    setIsScannerModalOpen(true);
    (
      document.getElementById("barcode_modal") as HTMLDialogElement
    )?.showModal();
  };

  const closeScannerModal = () => {
    setIsScannerModalOpen(false);
    (document.getElementById("barcode_modal") as HTMLDialogElement)?.close();
  };

  const handleScanComplete = (itemInfo: {
    title: string;
    author: string | null;
    image: string | null;
    format: string | null;
  }) => {
    closeScannerModal();

    // アイテム追加モーダルを開き、フォームに値をセット
    const addModal = document.getElementById(
      "add_item_modal",
    ) as HTMLDialogElement;
    addModal.showModal();

    if (addFormRef.current) {
      const titleInput = addFormRef.current.querySelector(
        '[name="title"]',
      ) as HTMLInputElement;
      const authorInput = addFormRef.current.querySelector(
        '[name="author"]',
      ) as HTMLInputElement;
      const imageInput = addFormRef.current.querySelector(
        '[name="image"]',
      ) as HTMLInputElement;
      const formatInput = addFormRef.current.querySelector(
        '[name="format"]',
      ) as HTMLInputElement;

      if (titleInput) titleInput.value = itemInfo.title || '';
      if (authorInput) authorInput.value = itemInfo.author || '';
      if (imageInput) imageInput.value = itemInfo.image || '';
      if (formatInput) formatInput.value = itemInfo.format || '';
    }
  };

  const handleCellClick = (
    id: number,
    field: "title" | "author" | "image" | "format",
    value: string | null
  ) => {
    setEditingCell({
      id,
      field,
      value: value || "",
    });
  };

  const handleCellUpdate = (newValue: string) => {
    if (!editingCell) return;

    // 値が変わっていない場合は何もしない
    if (newValue === editingCell.value) {
      setEditingCell(null);
      return;
    }

    // タイトルが空の場合は更新しない
    if (editingCell.field === "title" && !newValue.trim()) {
      alert("タイトルは必須です");
      return;
    }

    startTransition(() => {
      const formData = new FormData();
      formData.append("formType", "updateField");
      formData.append("id", editingCell.id.toString());
      formData.append("field", editingCell.field);
      formData.append("value", newValue);

      updateItemState(formData);
    });

    setEditingCell(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 ml-auto">
          <img
            src={user?.user_metadata.avatar_url}
            alt="ユーザー画像"
            className="w-8 h-8 rounded-full"
          />
          <button type="button" onClick={signOut}>
            <span>ログアウト</span>
          </button>
        </div>
      </header>

      <div className="flex gap-4 mb-8">
        <button
          type="button"
          className="flex items-center gap-4 bg-transparent hover:bg-blue-500 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
          onClick={() =>
            (
              document.getElementById("add_item_modal") as HTMLDialogElement
            )?.showModal()
          }
        >
          <HiPlus size={20} />
          <span>新しいアイテムを追加</span>
        </button>

        <dialog id="add_item_modal" className="modal">
          <div className="modal-box relative">
            <h3 className="font-bold text-lg mb-4">アイテムの追加</h3>
            <form
              action={(formData: FormData) => {
                try {
                  updateItemState(formData);
                  closeAddItemModal();
                } catch (error) {
                  console.error("Error adding item:", error);
                }
              }}
              ref={addFormRef}
              className="flex flex-col gap-2"
            >
              <input type="hidden" name="formType" value="add" />
              <div>
                <label
                  htmlFor="title"
                  className="flex items-center text-sm mb-1"
                >
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
                  className="w-full border rounded px-2 py-1 mb-4"
                />
              </div>
              <div>
                <label htmlFor="image" className="block text-sm mb-1">
                  画像URL
                </label>
                <input
                  id="image"
                  type="url"
                  name="image"
                  placeholder="https://example.com/image.jpg"
                  className="w-full border rounded px-2 py-1 mb-8"
                />
              </div>
              <div>
                <label htmlFor="format" className="block text-sm mb-1">
                  フォーマット
                </label>
                <input
                  id="format"
                  type="text"
                  name="format"
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
              onClick={closeAddItemModal}
            >
              <CgClose aria-label="アイテム追加ダイアログを閉じる" size={28} />
            </button>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="button">ダイアログを閉じる</button>
          </form>
        </dialog>

        <button
          type="button"
          className="flex items-center gap-4 bg-transparent hover:bg-green-500 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded"
          onClick={openScannerModal}
        >
          <HiQrcode size={20} />
          <span>バーコード読み取り</span>
        </button>

        <BarcodeScannerModal
          isOpen={isScannerModalOpen}
          onScanComplete={handleScanComplete}
          onClose={closeScannerModal}
        />
      </div>

      <div className="flex items-center mb-8">
        <form
          ref={searchFormRef}
          action={updateItemState}
          className="relative w-64"
        >
          <input type="hidden" name="formType" value="search" />
          <input
            type="text"
            name="keyword"
            placeholder="検索..."
            defaultValue={itemState.keyword}
            className="w-full border rounded-sm px-4 py-2 pr-10"
          />
          <button
            type="submit"
            disabled={isPending}
            className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-300"
          >
            <HiSearch size={20} />
          </button>
        </form>

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
            className="ml-2 px-3 py-2 transition-colors text-sm"
          >
            戻る
          </button>
        )}
      </div>

      {optimisticItemList.length === 0 ? (
        <div className="w-full text-center">データがありません</div>
      ) : (
        <div className="relative flex flex-col w-full h-full overflow-scroll bg-clip-border">
          <table className="min-w-max table-auto">
            <thead>
              <tr>
                <th className="p-2 text-left">タイトル</th>
                <th className="p-2 text-left">著者</th>
                <th className="p-2 text-left">画像</th>
                <th className="p-2 text-left">フォーマット</th>
                <th className="p-2 text-left">追加日時</th>
                <th className="p-2 text-left">ポイント</th>
                <th className="p-2 text-left" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {optimisticItemList.map((item: Item) => (
                <tr key={item.id}>
                  <td className="py-2">
                    {editingCell?.id === item.id &&
                    editingCell?.field === "title" ? (
                      <input
                        type="text"
                        defaultValue={editingCell.value}
                        ref={titleInputRef}
                        className="border rounded px-2 py-1 w-full"
                        onBlur={(e) => handleCellUpdate(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCellUpdate(e.currentTarget.value);
                          } else if (e.key === "Escape") {
                            setEditingCell(null);
                          }
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleCellClick(item.id, "title", item.title)
                        }
                        className="text-left w-full hover:border-gray-500 border-transparent border-2 px-2 py-1 rounded"
                      >
                        {item.title}
                      </button>
                    )}
                  </td>
                  <td className="py-2">
                    {editingCell?.id === item.id &&
                    editingCell?.field === "author" ? (
                      <input
                        type="text"
                        defaultValue={editingCell.value}
                        ref={authorInputRef}
                        className="border rounded px-2 py-1 w-full"
                        onBlur={(e) => handleCellUpdate(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCellUpdate(e.currentTarget.value);
                          } else if (e.key === "Escape") {
                            setEditingCell(null);
                          }
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleCellClick(item.id, "author", item.author)
                        }
                        className="text-left w-full hover:border-gray-500 border-transparent border-2 px-2 py-1 rounded"
                      >
                        {item.author || "N/A"}
                      </button>
                    )}
                  </td>
                  <td className="p-2">
                    {editingCell?.id === item.id &&
                    editingCell?.field === "image" ? (
                      <input
                        type="text"
                        defaultValue={editingCell.value}
                        ref={imageInputRef}
                        className="border rounded px-2 py-1 w-full"
                        onBlur={(e) => handleCellUpdate(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCellUpdate(e.currentTarget.value);
                          } else if (e.key === "Escape") {
                            setEditingCell(null);
                          }
                        }}
                      />
                    ) : (
                      <>
                        {item.image ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleCellClick(item.id, "image", item.image)
                            }
                            className="relative block w-[100px] h-[100px] group bg-gray-600"
                          >
                            <img
                              src={item.image}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-gray-800 bg-opacity-50 opacity-0 group-hover:opacity-70 flex items-center justify-center transition-opacity">
                              <HiCamera size={32} className="text-white" />
                            </div>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleCellClick(item.id, "image", item.image)
                            }
                            className="text-left w-full hover:border-gray-500 border-transparent border-2 px-2 py-1 rounded flex items-center gap-2"
                          >
                            <span>画像URLを追加</span>
                          </button>
                        )}
                      </>
                    )}
                  </td>
                  <td className="py-2">
                    {editingCell?.id === item.id && editingCell?.field === "format" ? (
                      <input
                        type="text"
                        defaultValue={editingCell.value}
                        ref={formatInputRef}
                        className="border rounded px-2 py-1 w-full"
                        onBlur={(e) => handleCellUpdate(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCellUpdate(e.currentTarget.value);
                          } else if (e.key === "Escape") {
                            setEditingCell(null);
                          }
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCellClick(item.id, "format", item.format)}
                        className="text-left w-full hover:border-gray-500 border-transparent border-2 px-2 py-1 rounded"
                      >
                        {item.format || "N/A"}
                      </button>
                    )}
                  </td>
                  <td className="py-2">
                    <time dateTime={item.created_at} className="px-2">
                      {formatDate(item.created_at)}
                    </time>
                  </td>
                  <td className="py-2">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        updateItemState(formData);
                      }}
                      className="inline px-2"
                    >
                      <input type="hidden" name="formType" value="update" />
                      <input type="hidden" name="id" value={item.id} />
                      <select
                        name="point"
                        value={item.point}
                        onChange={(e) => {
                          startTransition(() => {
                            const formData = new FormData(
                              e.target.form as HTMLFormElement,
                            );
                            formData.set("point", e.target.value);
                            updateItemState(formData);
                          });
                        }}
                        className="select select-ghost w-full max-w-xs"
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
                    <form onSubmit={handleDeleteClick} className="inline px-2">
                      <input type="hidden" name="formType" value="delete" />
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        disabled={isPending}
                        className="text-gray-300 px-2 py-1"
                      >
                        <HiTrash size={20} aria-label="削除" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

  return !user ? <Auth /> : <ItemManager user={user} />;
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
