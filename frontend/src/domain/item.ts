export type Item = {
  id: number;
  name: string;
  point: 0 | 1 | 2 | 3 | 4 | 5;
};

export type ItemState = {
  allItemList: Item[];
  filteredItemList: Item[] | null;
  keyword: string;
};
