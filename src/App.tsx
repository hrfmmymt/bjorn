import type { User } from "@supabase/supabase-js";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Auth } from "./components/Auth";
import { AuthProvider } from "./contexts/AuthProvider";
import { ActionButtons } from "./features/items/components/ActionButtons";
import { AddItemModal } from "./features/items/components/AddItemModal";
import { BarcodeScannerModal } from "./features/items/components/BarcodeScannerModal";
import { ItemTable } from "./features/items/components/ItemTable";
import { SearchForm } from "./features/items/components/SearchForm";
import { useItemManager } from "./features/items/hooks/useItemManager";
import { useAuth } from "./hooks/useAuth";
import { AuthCallback } from "./routes/AuthCallback";
import { formatDate } from "./utils/dateFormatter";

/**
 * アイテム管理コンポーネント
 */
function ItemManager({ user }: { user: User }) {
  const {
    itemState,
    optimisticItemList,
    updateItemState,
    isPending,
    addFormRef,
    searchFormRef,
    isScannerModalOpen,
    openAddItemModal,
    closeAddItemModal,
    openScannerModal,
    closeScannerModal,
    handleScanComplete,
    handleSearchReset,
  } = useItemManager();

  const { signOut } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 ml-auto">
          <img
            src={user?.user_metadata.avatar_url}
            alt="ユーザー画像"
            className="w-8 h-8 rounded-full"
          />
          <button type="button" onClick={signOut}>
            <span>ログアウト</span>
          </button>
        </div>
      </header>

      <ActionButtons
        onOpenAddModal={openAddItemModal}
        onOpenScannerModal={openScannerModal}
      />

      <AddItemModal
        addFormRef={addFormRef}
        isPending={isPending}
        onAddItem={updateItemState}
        onClose={closeAddItemModal}
      />

      <SearchForm
        keyword={itemState.keyword}
        isPending={isPending}
        searchFormRef={searchFormRef}
        onSearch={updateItemState}
        onReset={handleSearchReset}
        isFiltered={!!itemState.filteredItemList}
      />

      <ItemTable
        items={optimisticItemList}
        isPending={isPending}
        onUpdateItemPoint={updateItemState}
        onDeleteItem={updateItemState}
        onUpdateItemField={updateItemState}
        formatDate={formatDate}
      />

      <BarcodeScannerModal
        isOpen={isScannerModalOpen}
        onScanComplete={handleScanComplete}
        onClose={closeScannerModal}
      />
    </div>
  );
}

/**
 * アプリケーションのメインコンテンツ
 */
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return !user ? <Auth /> : <ItemManager user={user} />;
}

/**
 * アプリケーションのルートコンポーネント
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
