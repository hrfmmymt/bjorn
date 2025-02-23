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

export type FormData = AddFormData | SearchFormData | UpdateFormData;
