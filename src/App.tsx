import { use, useActionState, useOptimistic, useRef } from "react";

import { AuthProvider } from './contexts/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { Auth } from './components/Auth';
import { Item, ItemState } from "./domain/item";
import { handleAddItem, handleSearchItemList, handleUpdateItemPoint } from "./itemActions";
import { supabase } from "./supabase";

// Supabaseからアイテムを取得
async function fetchManageItem(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

const fetchManageItemPromise = fetchManageItem();

function ItemManager() {
  const initialItemList = use(fetchManageItemPromise);
  const addFormRef = useRef<HTMLFormElement>(null);
  const searchFormRef = useRef<HTMLFormElement>(null);
  const { signOut } = useAuth();

  const [itemState, updateItemState, isPending] = useActionState(
    async (prevState: ItemState | undefined, formData: FormData): Promise<ItemState> => {
      if (!prevState) throw new Error("Invalid state");

      const action = formData.get("formType") as string;
      const actionHandlerList = {
        add: () => handleAddItem(prevState, formData, updateOptimisticItemList),
        search: () => handleSearchItemList(prevState, formData),
        update: () => handleUpdateItemPoint(prevState, formData, updateOptimisticItemList),
      } as const;

      if (action !== "add" && action !== "search" && action !== "update") {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={signOut}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          ログアウト
        </button>
      </div>

      <form action={updateItemState} ref={addFormRef} className="mb-4">
        <input type="hidden" name="formType" value="add" />
        <label htmlFor="itemName" className="mr-2">名前</label>
        <input
          id="itemName"
          type="text"
          name="itemName"
          className="border rounded px-2 py-1 mr-2"
        />
        <button type="submit" disabled={isPending} className="bg-blue-500 text-white px-4 py-1 rounded">
          追加
        </button>
      </form>

      <form ref={searchFormRef} action={updateItemState} className="mb-4">
        <input type="hidden" name="formType" value="search" />
        <label htmlFor="keyword" className="mr-2">キーワード</label>
        <input 
          id="keyword" 
          type="text" 
          name="keyword"
          className="border rounded px-2 py-1 mr-2"
        />
        <button type="submit" disabled={isPending} className="bg-blue-500 text-white px-4 py-1 rounded">
          検索
        </button>
      </form>

      <ul className="space-y-2">
        {optimisticItemList.map((item: Item) => (
          <li key={item.id} className="flex items-center gap-2">
            <span>{item.name}</span>
            <form action={updateItemState} className="inline">
              <input type="hidden" name="formType" value="update" />
              <input type="hidden" name="id" value={item.id} />
              <select
                name="point"
                value={item.point}
                onChange={(e) => e.target.form?.requestSubmit()}
                className="border rounded px-2 py-1"
              >
                {[0,1,2,3,4,5].map(value => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return !user ? <Auth /> : <ItemManager />;
}
