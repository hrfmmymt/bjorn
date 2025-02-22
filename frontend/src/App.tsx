import { use, useActionState, useRef } from "react";
import { ItemManage, ItemManageJson, ItemState } from "./domain/item";
import { handleAddItem } from "./itemActions";

const API_ENDPOINT = "http://localhost:8080/items";

// fetch items from API and return as ItemManage
async function fetchManageItem() {
  // simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // fetch items from API and return as ItemManage
  const response = await fetch(API_ENDPOINT);
  const data = (await response.json()) as ItemManageJson[];

  // map data to ItemManage
  return data.map((item) => new ItemManage(item.id, item.name, item.point));
}

const fetchManageItemPromise = fetchManageItem();

export default function App() {
  // fetch items from API and store in initialItems
  const initialItems = use(fetchManageItemPromise);

  const addFormRef = useRef<HTMLFormElement>(null);

  // add item to API and update state
  const [itemState, updateItemState, isPending] = useActionState(
    async (
      prevState: ItemState | undefined,
      formData: FormData
    ): Promise<ItemState> => {
      if (!prevState) {
        throw new Error("Invalid state");
      }

      return handleAddItem(prevState, formData);
    },
    // initial state
    {
      allItems: initialItems,
    }
  );

  return (
    <>
      <form action={updateItemState} ref={addFormRef}>
        <label htmlFor="itemName">名前</label>
        <input
          id="itemName"
          type="text"
          name="itemName"
        />
        <button type="submit" disabled={isPending}>
          追加
        </button>
      </form>
      <div>
        <ul>
          {itemState.allItems.map((item: ItemManage) => {
            return <li key={item.id}>{item.name}</li>;
          })}
        </ul>
      </div>
    </>
  );
}
