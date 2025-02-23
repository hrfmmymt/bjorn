import { Item, ItemState } from "./domain/item";
import { supabase } from "./supabase";
import { getFormData } from './utils/form';

export const handleAddItem = async (
  prevState: ItemState,
  formData: FormData,
  updateOptimisticItemList: (prevState: Item[]) => void
): Promise<ItemState> => {
  const name = formData.get("itemName") as string;
  if (!name) throw new Error("Item name is required");

  updateOptimisticItemList([
    ...prevState.allItemList,
    { id: Date.now(), name, point: 0 },
  ]);

  const { data: addedItem, error } = await supabase
    .from('items')
    .insert([{ 
      name, 
      point: 0,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();

  if(error) throw error;

  return {
    ...prevState,
    allItemList: [...prevState.allItemList, addedItem],
    filteredItemList: prevState.filteredItemList
      ? [...prevState.filteredItemList, addedItem]
      : null,
  };
};

export const handleSearchItemList = async (
  prevState: ItemState,
  formData: FormData
): Promise<ItemState> => {
  const keyword = formData.get("keyword") as string;
  if (!keyword) throw new Error("Keyword is required");

  const { data: filteredItemList, error } = await supabase
    .from('items')
    .select('*')
    .ilike('name', `%${keyword}%`);

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
  if (formData.formType !== 'update') throw new Error('Invalid form type');

  const id = Number(formData.id);
  const point = Number(formData.point) as 0 | 1 | 2 | 3 | 4 | 5;

  const currentDisplayList = prevState.filteredItemList ?? prevState.allItemList;
  updateOptimisticItemList(
    currentDisplayList.map((item) =>
      item.id === id ? { ...item, point } : item
    )
  );

  const { data: updatedItem, error } = await supabase
    .from('items')
    .update({ point })
    .eq('id', id)
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
