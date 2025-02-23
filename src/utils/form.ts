import { AddFormData, SearchFormData, UpdateFormData } from "../domain/form";

export function getFormData(
  formData: FormData,
): AddFormData | SearchFormData | UpdateFormData {
  const formType = formData.get("formType") as string;

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
