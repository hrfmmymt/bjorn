import type { RefObject } from "react";
import { CgClose } from "react-icons/cg";

type AddItemModalProps = {
  addFormRef: RefObject<HTMLFormElement | null>;
  isPending: boolean;
  onAddItem: (formData: FormData) => void;
  onClose: () => void;
};

export function AddItemModal({
  addFormRef,
  isPending,
  onAddItem,
  onClose,
}: AddItemModalProps) {
  return (
    <dialog id="add_item_modal" className="modal">
      <div className="modal-box relative">
        <h3 className="font-bold text-lg mb-4">アイテムの追加</h3>
        <form
          action={(formData: FormData) => {
            try {
              onAddItem(formData);
              onClose();
            } catch (error) {
              console.error("Error adding item:", error);
            }
          }}
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
          onClick={onClose}
        >
          <CgClose aria-label="アイテム追加ダイアログを閉じる" size={28} />
        </button>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button">ダイアログを閉じる</button>
      </form>
    </dialog>
  );
}
