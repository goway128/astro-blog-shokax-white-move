import { describe, expect, it } from "bun:test";
import { getHostname, isExternalUrl, normalizeSiteOrigin } from "./externalLinkGuard";

describe("externalLinkGuard.normalizeSiteOrigin", () => {
  it("从完整 URL 提取 origin", () => {
    expect(normalizeSiteOrigin("https://example.com/blog")).toBe("https://example.com");
  });

  it("空值返回空字符串", () => {
    expect(normalizeSiteOrigin(undefined)).toBe("");
    expect(normalizeSiteOrigin("")).toBe("");
  });

  it("非法 URL 保守剥去末尾斜杠", () => {
    expect(normalizeSiteOrigin("not a url/")).toBe("not a url");
  });
});

describe("externalLinkGuard.isExternalUrl", () => {
  const siteOrigin = "https://example.com";

  it("锚点/查询视为站内", () => {
    expect(isExternalUrl("#section", siteOrigin)).toBe(false);
    expect(isExternalUrl("?q=1", siteOrigin)).toBe(false);
  });

  it("相对路径视为站内", () => {
    expect(isExternalUrl("/posts/hello/", siteOrigin)).toBe(false);
  });

  it("同源绝对 URL 视为站内", () => {
    expect(isExternalUrl("https://example.com/x/", siteOrigin)).toBe(false);
  });

  it("跨域绝对 URL 视为外链", () => {
    expect(isExternalUrl("https://foo.bar/", siteOrigin)).toBe(true);
  });

  it("协议相对 URL 视为外链", () => {
    expect(isExternalUrl("//cdn.example.org/x", siteOrigin)).toBe(true);
  });

  it("mailto/tel/javascript/data 一律放行", () => {
    expect(isExternalUrl("mailto:a@b.com", siteOrigin)).toBe(false);
    expect(isExternalUrl("tel:+8612345", siteOrigin)).toBe(false);
    expect(isExternalUrl("javascript:void(0)", siteOrigin)).toBe(false);
    expect(isExternalUrl("data:text/plain,hi", siteOrigin)).toBe(false);
  });

  it("非法 URL 放行", () => {
    expect(isExternalUrl("https://[bad", siteOrigin)).toBe(false);
  });

  it("无 siteOrigin 时所有 http(s) 绝对 URL 都是外链", () => {
    expect(isExternalUrl("https://example.com/", "")).toBe(true);
  });

  it("空字符串放行", () => {
    expect(isExternalUrl("", siteOrigin)).toBe(false);
  });
});

describe("externalLinkGuard.getHostname", () => {
  it("解析常规 URL", () => {
    expect(getHostname("https://Example.COM/foo")).toBe("example.com");
  });

  it("解析协议相对 URL", () => {
    expect(getHostname("//cdn.example.org/x")).toBe("cdn.example.org");
  });

  it("非法 URL 返回空字符串", () => {
    expect(getHostname("not-a-url")).toBe("");
  });
});
