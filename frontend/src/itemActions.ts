import { ItemManage, ItemManageJson, ItemState } from "./domain/item";
import { getFormData } from './utils/form';

export const handleAddItem = async (
  prevState: ItemState,
  formData: FormData,
  updateOptimisticItemList: (prevState: ItemManage[]) => void
): Promise<ItemState> => {

  // get item name from input form
  const name = formData.get("itemName") as string;

  // validate item name
  if (!name) {
    throw new Error("Item name is required");
  }

  // create optimistic item
  updateOptimisticItemList([
    ...prevState.allItemList,
    new ItemManage(0, name, 0),
  ]);

  // post item to API
  const response = await fetch("http://localhost:8080/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  // validate response
  if (!response.ok) {
    throw new Error("Failed to add item");
  }

  // get added item from response
  const addedItem = await response.json();

  // return new state
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
  // get keyword from search input form
  const keyword = formData.get("keyword") as string;

  if (!keyword) {
    throw new Error("Keyword is required");
  }

  // fetch items from API
  const response = await fetch(
    `http://localhost:8080/items?keyword=${keyword}`
  );

  // validate response status
  if (!response.ok) {
    throw new Error("Failed to search item");
  }

  // get item list from response
  const data = (await response.json()) as ItemManageJson[];

  // map item list to ItemManage
  const filteredItemList = data.map(
    (item) => new ItemManage(item.id, item.name, item.point)
  );

  // return new state with filtered item list and keyword
  return {
    ...prevState,
    filteredItemList,
    keyword,
  };
};

export const handleUpdateItemPoint = async (
  prevState: ItemState,
  rawFormData: FormData,
  updateOptimisticItemList: (prevState: ItemManage[]) => void
): Promise<ItemState> => {
  // get form data from point input form
  const formData = getFormData(rawFormData);

  if (formData.formType !== 'update') {
    throw new Error('Invalid form type');
  }

  // get item id from form data
  const id = Number(formData.id);
  // get point from form data
  const point = Number(formData.point) as 0 | 1 | 2 | 3 | 4 | 5;

  // 楽観的更新の対象を現在の表示状態に合わせる
  const currentDisplayList = prevState.filteredItemList ?? prevState.allItemList;
  updateOptimisticItemList(
    currentDisplayList.map((item) =>
      item.id === id ? { ...item, point } : item
    )
  );

  // fetch item from API
  const response = await fetch(`http://localhost:8080/items/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ point }),
  });

  if (!response.ok) {
    throw new Error("Failed to update item");
  }

  // get updated item from response
  const updatedItem = await response.json();

  // 更新後のアイテムリストを作成
  const updatedItemList = prevState.allItemList.map((item) =>
    item.id === id ? updatedItem : item
  );

  // フィルター済みリストがある場合は、そちらも更新する
  const updatedFilteredItemList = prevState.filteredItemList
    ? prevState.filteredItemList.map((item) =>
        item.id === id ? updatedItem : item
      )
    : null;

  // return new state with updated item list and filtered item list
  return {
    ...prevState,
    allItemList: updatedItemList,
    filteredItemList: updatedFilteredItemList,
  };
};
