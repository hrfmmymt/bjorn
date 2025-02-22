import { use, useActionState, useRef } from "react";

import { ItemManage, ItemManageJson, ItemState } from "./domain/item";
import { handleAddItem, handleSearchItemList } from "./itemActions";

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
  // fetch items from API and store in initialItemList
  const initialItemList = use(fetchManageItemPromise);

  // add form
  const addFormRef = useRef<HTMLFormElement>(null);
  // search form
  const searchFormRef = useRef<HTMLFormElement>(null);

  // add item to API and update state
  const [itemState, updateItemState, isPending] = useActionState(
    async (
      prevState: ItemState | undefined,
      formData: FormData
    ): Promise<ItemState> => {
      if (!prevState) {
        throw new Error("Invalid state");
      }

      const action = formData.get("formType") as string;

      const actionHandlerList = {
        add: () => handleAddItem(prevState, formData),
        search: () => handleSearchItemList(prevState, formData),
      } as const;

      if (action !== "add" && action !== "search") {
        throw new Error(`Invalid action: ${action}`);
      }

      return actionHandlerList[action]();
    },
    // initial state
    {
      allItemList: initialItemList,
      filteredItemList: null,
      keyword: "",
    }
  );

  const itemList = itemState.filteredItemList || itemState.allItemList;

  return (
    <>
      <form action={updateItemState} ref={addFormRef}>
        <input type="hidden" name="formType" value="add" />
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

      <form ref={searchFormRef} action={updateItemState}>
        <input type="hidden" name="formType" value="search" />
        <label htmlFor="keyword">キーワード</label>
        <input id="keyword" type="text" name="keyword" />
        <button type="submit" disabled={isPending}>
          検索
        </button>
      </form>

      <div>
        <ul>
          {itemList?.map((item: ItemManage) => {
            return <li key={item.id}>{item.name}</li>;
          })}
        </ul>
      </div>
    </>
  );
}
