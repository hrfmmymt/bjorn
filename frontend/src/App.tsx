import { use, useState, useTransition } from "react";
import { ItemManage, ItemManageJson } from "./domain/item";

async function fetchManageItem() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const response = await fetch("http://localhost:8080/items");
  const data = (await response.json()) as ItemManageJson[];
  return data.map((item) => new ItemManage(item.id, item.name, item.point));
}

const fetchManageItemPromise = fetchManageItem();

function App() {
  const initialItems = use(fetchManageItemPromise);
  const [items, setItems] = useState<ItemManage[]>(initialItems);
  const [itemName, setItemName] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleAddItem = () => {
    startTransition(async () => {
      const response = await fetch("http://localhost:8080/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: itemName }),
      });
      const data = (await response.json()) as ItemManageJson;
      setItems((prev) => [
        ...prev,
        new ItemManage(data.id, data.name, data.point),
      ]);
    });
  };

  return (
    <>
      <div>
        <form>
          <label htmlFor="itemName">名前</label>
          <input
            id="itemName"
            type="text"
            name="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <button type="submit" disabled={isPending} onClick={handleAddItem}>
            追加
          </button>
        </form>
        <div>
          <ul>
            {items.map((item: ItemManage) => {
              return <li key={item.id}>{item.name}</li>;
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

export default App;
