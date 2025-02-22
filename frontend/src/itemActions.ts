import { ItemState } from "./domain/item";

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
    allItems: [...prevState.allItems, addedItem],
  };
};
