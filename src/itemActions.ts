import { Item, ItemState } from "./domain/item";
import { supabase } from "./supabase";
import { getFormData } from "./utils/form";

export const handleAddItem = async (
  prevState: ItemState,
  formData: FormData,
  updateOptimisticItemList: (prevState: Item[]) => void
): Promise<ItemState> => {
  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  if (!title) throw new Error("Title is required");

  updateOptimisticItemList([
    {
      id: Date.now(),
      title,
      author: author || null,
      point: 0,
      created_at: new Date().toISOString(),
    },
    ...prevState.allItemList,
  ]);

  const { data: addedItem, error } = await supabase
    .from("items")
    .insert([
      {
        title,
        author: author || null,
        point: 0,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return {
    ...prevState,
    allItemList: [addedItem, ...prevState.allItemList],
    filteredItemList: prevState.filteredItemList
      ? [addedItem, ...prevState.filteredItemList]
      : null,
  };
};

export const handleSearchItemList = async (
  prevState: ItemState,
  formData: FormData
): Promise<ItemState> => {
  const keyword = formData.get("keyword") as string;
  const isReset = formData.get("reset") === "true";

  // リセットの場合またはキーワードが空の場合は全件表示
  if (isReset || !keyword) {
    return {
      ...prevState,
      filteredItemList: null,
      keyword: "",
    };
  }

  const { data: filteredItemList, error } = await supabase
    .from("items")
    .select("*")
    .ilike("title", `%${keyword}%`);

  if (error) throw error;

  return {
    ...prevState,
    filteredItemList,
    keyword,
  };
};

export const handleUpdateItemPoint = async (
  prevState: ItemState,
  rawFormData: FormData,
  updateOptimisticItemList: (prevState: Item[]) => void
): Promise<ItemState> => {
  const formData = getFormData(rawFormData);
  if (formData.formType !== "update") throw new Error("Invalid form type");

  const id = Number(formData.id);
  const point = Number(formData.point) as 0 | 1 | 2 | 3 | 4 | 5;

  const currentDisplayList =
    prevState.filteredItemList ?? prevState.allItemList;
  updateOptimisticItemList(
    currentDisplayList.map((item) =>
      item.id === id ? { ...item, point } : item
    )
  );

  const { data: updatedItem, error } = await supabase
    .from("items")
    .update({ point })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  const updatedItemList = prevState.allItemList.map((item) =>
    item.id === id ? updatedItem : item
  );

  const updatedFilteredItemList = prevState.filteredItemList
    ? prevState.filteredItemList.map((item) =>
        item.id === id ? updatedItem : item
      )
    : null;

  return {
    ...prevState,
    allItemList: updatedItemList,
    filteredItemList: updatedFilteredItemList,
  };
};

export const handleDeleteItem = async (
  prevState: ItemState,
  formData: FormData,
  updateOptimisticItemList: (prevState: Item[]) => void
): Promise<ItemState> => {
  const id = Number(formData.get("id"));
  if (!id) throw new Error("Item ID is required");

  const currentDisplayList =
    prevState.filteredItemList ?? prevState.allItemList;
  updateOptimisticItemList(currentDisplayList.filter((item) => item.id !== id));

  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) {
    throw error;
  }

  // 状態を更新
  return {
    ...prevState,
    allItemList: prevState.allItemList.filter((item) => item.id !== id),
    filteredItemList: prevState.filteredItemList
      ? prevState.filteredItemList.filter((item) => item.id !== id)
      : null,
  };
};
