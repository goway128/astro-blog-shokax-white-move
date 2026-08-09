import { describe, expect, it } from "bun:test";
import { currentLocale, getT } from "./index";

describe("i18n translators", () => {
  it("keeps fixed translators isolated from other locale requests", () => {
    const english = getT("en");
    expect(english("pagination.prev")).toBe("Previous");

    getT("zh-CN");
    expect(english("pagination.prev")).toBe("Previous");
  });

  it("uses configured locale by default", () => {
    expect(getT()("pagination.prev")).toBe(getT(currentLocale)("pagination.prev"));
  });
});
