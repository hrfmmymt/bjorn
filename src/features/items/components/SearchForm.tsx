import type { FormEvent, RefObject } from "react";
import { startTransition } from "react";
import { HiSearch } from "react-icons/hi";

type SearchFormProps = {
  keyword: string;
  isPending: boolean;
  searchFormRef: RefObject<HTMLFormElement | null>;
  onSearch: (formData: FormData) => void;
  onReset: () => void;
  isFiltered: boolean;
};

export function SearchForm({
  keyword,
  isPending,
  searchFormRef,
  onSearch,
  onReset,
  isFiltered,
}: SearchFormProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => {
      const formData = new FormData(e.currentTarget);
      onSearch(formData);
    });
  };

  return (
    <div className="flex items-center mb-8">
      <form
        ref={searchFormRef}
        onSubmit={handleSubmit}
        className="relative w-64"
      >
        <input type="hidden" name="formType" value="search" />
        <input
          type="text"
          name="keyword"
          placeholder="search..."
          defaultValue={keyword}
          className="w-full border rounded-sm px-4 py-2 pr-10"
        />
        <button
          type="submit"
          disabled={isPending}
          className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-300"
        >
          <HiSearch size={20} />
        </button>
      </form>

      {isFiltered && (
        <button
          type="button"
          onClick={() => {
            startTransition(() => {
              onReset();
            });
          }}
          disabled={isPending}
          className="ml-2 px-3 py-2 transition-colors text-sm"
        >
          戻る
        </button>
      )}
    </div>
  );
}
