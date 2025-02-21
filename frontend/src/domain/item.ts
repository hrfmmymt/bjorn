export class ItemManage {
  constructor(public id: number, public name: string, public point: 0 | 1 | 2 | 3 | 4 | 5) {}
}

export type ItemManageJson = {
  id: number;
  name: string;
  point: 0 | 1 | 2 | 3 | 4 | 5;
};
