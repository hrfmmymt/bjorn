import { useRef, useState } from "react";
import { startTransition, use, useActionState, useOptimistic } from "react";
import type { Item, ItemState } from "../../../domain/item";
import {
  handleAddItem,
  handleDeleteItem,
  handleSearchItemList,
  handleUpdateItemField,
  handleUpdateItemPoint,
} from "../../../itemActions";
import { supabase } from "../../../supabase";

// データ取得関数
async function fetchManageItem(): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// データ取得Promiseを作成
const fetchManageItemPromise = fetchManageItem();

export function useItemManager() {
  const initialItemList = use(fetchManageItemPromise);
  const addFormRef = useRef<HTMLFormElement>(null);
  const searchFormRef = useRef<HTMLFormElement>(null);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

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
    }
  );

  const [optimisticItemList, updateOptimisticItemList] = useOptimistic<Item[]>(
    itemState?.filteredItemList ?? itemState?.allItemList ?? []
  );

  // アイテム追加モーダルを開く
  const openAddItemModal = () => {
    (
      document.getElementById("add_item_modal") as HTMLDialogElement
    )?.showModal();
  };

  // アイテム追加モーダルを閉じる
  const closeAddItemModal = () => {
    (document.getElementById("add_item_modal") as HTMLDialogElement)?.close();
    if (addFormRef.current) {
      addFormRef.current.reset();
    }
  };

  // スキャナーモーダルを開く
  const openScannerModal = () => {
    setIsScannerModalOpen(true);
    (
      document.getElementById("barcode_modal") as HTMLDialogElement
    )?.showModal();
  };

  // スキャナーモーダルを閉じる
  const closeScannerModal = () => {
    setIsScannerModalOpen(false);
    (document.getElementById("barcode_modal") as HTMLDialogElement)?.close();
  };

  // スキャン完了時の処理
  const handleScanComplete = (itemInfo: {
    title: string;
    author: string | null;
    image: string | null;
    format: string | null;
  }) => {
    closeScannerModal();

    // アイテム追加モーダルを開き、フォームに値をセット
    const addModal = document.getElementById(
      "add_item_modal"
    ) as HTMLDialogElement;
    addModal.showModal();

    if (addFormRef.current) {
      const titleInput = addFormRef.current.querySelector(
        '[name="title"]'
      ) as HTMLInputElement;
      const authorInput = addFormRef.current.querySelector(
        '[name="author"]'
      ) as HTMLInputElement;
      const imageInput = addFormRef.current.querySelector(
        '[name="image"]'
      ) as HTMLInputElement;
      const formatInput = addFormRef.current.querySelector(
        '[name="format"]'
      ) as HTMLInputElement;

      if (titleInput) titleInput.value = itemInfo.title || "";
      if (authorInput) authorInput.value = itemInfo.author || "";
      if (imageInput) imageInput.value = itemInfo.image || "";
      if (formatInput) formatInput.value = itemInfo.format || "";
    }
  };

  // 検索リセット処理
  const handleSearchReset = () => {
    startTransition(() => {
      const formData = new FormData();
      formData.append("formType", "search");
      formData.append("reset", "true");
      updateItemState(formData);
      if (searchFormRef.current) {
        searchFormRef.current.reset();
      }
    });
  };

  return {
    itemState,
    optimisticItemList,
    updateItemState,
    isPending,
    addFormRef,
    searchFormRef,
    isScannerModalOpen,
    openAddItemModal,
    closeAddItemModal,
    openScannerModal,
    closeScannerModal,
    handleScanComplete,
    handleSearchReset,
  };
}
