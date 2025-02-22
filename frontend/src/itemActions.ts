import { ItemManage, ItemManageJson, ItemState } from "./domain/item";

export const handleAddItem = async (
  prevState: ItemState,
  formData: FormData
): Promise<ItemState> => {

  // get item name from input form
  const name = formData.get("itemName") as string;

  // validate item name
  if (!name) {
    throw new Error("Item name is required");
  }

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
  const keyword = formData.get("keyword") as string;

  if (!keyword) {
    throw new Error("Keyword is required");
  }

  const response = await fetch(
    `http://localhost:8080/items?keyword=${keyword}`
  );
  const data = (await response.json()) as ItemManageJson[];
  const filteredItemList = data.map(
    (item) => new ItemManage(item.id, item.name, item.point)
  );

  return {
    ...prevState,
    filteredItemList,
    keyword,
  };
};
