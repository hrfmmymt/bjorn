import { type FormEvent, useRef, useState } from "react";
import { startTransition } from "react";
import { HiCamera, HiTrash } from "react-icons/hi";
import type { Item } from "../../../domain/item";

type ItemTableProps = {
  items: Item[];
  isPending: boolean;
  onUpdateItemPoint: (formData: FormData) => void;
  onDeleteItem: (formData: FormData) => void;
  onUpdateItemField: (formData: FormData) => void;
  formatDate: (dateString: string) => string;
};

export function ItemTable({
  items,
  isPending,
  onUpdateItemPoint,
  onDeleteItem,
  onUpdateItemField,
  formatDate,
}: ItemTableProps) {
  const [editingCell, setEditingCell] = useState<{
    id: number;
    field: "title" | "author" | "image" | "format";
    value: string;
  } | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const authorInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const formatInputRef = useRef<HTMLInputElement>(null);

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

      onUpdateItemField(formData);
    });

    setEditingCell(null);
  };

  const handleDeleteClick = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (window.confirm("このアイテムを削除してもよろしいですか？")) {
      const formData = new FormData(e.currentTarget);
      onDeleteItem(formData);
    }
  };

  if (items.length === 0) {
    return <div className="w-full text-center">データがありません</div>;
  }

  return (
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
          {items.map((item: Item) => (
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
                {editingCell?.id === item.id &&
                editingCell?.field === "format" ? (
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
                    onClick={() =>
                      handleCellClick(item.id, "format", item.format)
                    }
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
                    onUpdateItemPoint(formData);
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
                          e.target.form as HTMLFormElement
                        );
                        formData.set("point", e.target.value);
                        onUpdateItemPoint(formData);
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
  );
}
