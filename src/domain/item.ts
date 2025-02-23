export type Item = {
  id: number;
  title: string;
  author: string | null;
  point: 0 | 1 | 2 | 3 | 4 | 5;
  created_at: string;
};

export type ItemState = {
  allItemList: Item[];
  filteredItemList: Item[] | null;
  keyword: string;
};
