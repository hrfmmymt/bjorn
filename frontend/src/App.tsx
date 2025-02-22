import { use, useActionState, useOptimistic, useRef } from "react";

import { ItemManage, ItemManageJson, ItemState } from "./domain/item";
import { handleAddItem, handleSearchItemList, handleUpdateItemPoint } from "./itemActions";

const API_ENDPOINT = "http://localhost:8080/";

// fetch items from API and return as ItemManage
async function fetchManageItem() {
  // simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // fetch items from API and return as ItemManage
  const response = await fetch(`${API_ENDPOINT}items`);
  const data = (await response.json()) as ItemManageJson[];

  // map data to ItemManage
  return data.map((item) => new ItemManage(item.id, item.name, item.point));
}

// fetch items from API
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

      // get form type
      const action = formData.get("formType") as string;

      // action handler
      const actionHandlerList = {
        add: () => handleAddItem(prevState, formData, updateOptimisticItemList),
        search: () => handleSearchItemList(prevState, formData),
        update: () => handleUpdateItemPoint(prevState, formData, updateOptimisticItemList),
      } as const;

      // validate action
      if (action !== "add" && action !== "search" && action !== "update") {
        throw new Error(`Invalid action: ${action}`);
      }

      // execute action handler
      return actionHandlerList[action]();
    },
    // initial state
    {
      allItemList: initialItemList,
      filteredItemList: null,
      keyword: "",
    }
  );

  const [optimisticItemList, updateOptimisticItemList] = useOptimistic<ItemManage[]>(
    itemState?.filteredItemList ?? itemState?.allItemList ?? []
  );

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
          {optimisticItemList.map((item: ItemManage) => {
            const itemPoint = item.point;

            return (
              <li key={item.id}>
                {item.name}
                <form action={updateItemState}>
                  <input type="hidden" name="formType" value="update" />
                  <input type="hidden" name="id" value={item.id} />
                  <select
                    key={`select-${item.id}-${itemPoint}`}
                    name="point"
                    defaultValue={itemPoint}
                    onChange={(e) => {
                      e.target.form?.requestSubmit();
                    }}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </form>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
