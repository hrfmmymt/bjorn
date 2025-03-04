import { describe, expect, it } from "vitest";
import { getFormData } from "./form";

describe("getFormData", () => {
  it("formTypeがaddの場合、AddFormDataを返すこと", () => {
    const formData = new FormData();
    formData.append("formType", "add");
    formData.append("itemName", "テスト商品");

    const result = getFormData(formData);

    expect(result).toEqual({
      formType: "add",
      itemName: "テスト商品",
    });
  });

  it("formTypeがsearchの場合、SearchFormDataを返すこと", () => {
    const formData = new FormData();
    formData.append("formType", "search");
    formData.append("keyword", "テスト");

    const result = getFormData(formData);

    expect(result).toEqual({
      formType: "search",
      keyword: "テスト",
    });
  });

  it("無効なformTypeの場合、エラーをスローすること", () => {
    const formData = new FormData();
    formData.append("formType", "invalid");

    expect(() => getFormData(formData)).toThrow("Invalid form type: invalid");
  });
});
