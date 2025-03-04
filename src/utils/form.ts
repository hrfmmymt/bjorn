import type {
  AddFormData,
  SearchFormData,
  UpdateFieldFormData,
  UpdateFormData,
} from "../domain/form";

export function getFormData(
  formData: FormData
): AddFormData | SearchFormData | UpdateFormData | UpdateFieldFormData {
  const formType = formData.get("formType") as string;

  if (formType === "updateField") {
    return {
      formType: "updateField",
      id: formData.get("id") as string,
      field: formData.get("field") as "title" | "author" | "image" | "format",
      value: formData.get("value") as string,
    };
  }

  switch (formType) {
    case "add":
      return {
        formType: "add",
        itemName: formData.get("itemName") as string,
      };
    case "search":
      return {
        formType: "search",
        keyword: formData.get("keyword") as string,
      };
    case "update":
      return {
        formType: "update",
        id: formData.get("id") as string,
        point: formData.get("point") as "0" | "1" | "2" | "3" | "4" | "5",
      };
    default:
      throw new Error(`Invalid form type: ${formType}`);
  }
}
