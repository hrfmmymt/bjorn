export type AddFormData = {
  formType: "add";
  itemName: string;
};

export type SearchFormData = {
  formType: "search";
  keyword: string;
};

export type UpdateFormData = {
  formType: "update";
  id: string;
  point: "0" | "1" | "2" | "3" | "4" | "5";
};

export type UpdateFieldFormData = {
  formType: "updateField";
  id: string;
  field: "title" | "author" | "image" | "format";
  value: string;
};

export type FormData =
  | AddFormData
  | SearchFormData
  | UpdateFormData
  | UpdateFieldFormData;
