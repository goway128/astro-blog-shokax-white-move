import { expect, test } from "@playwright/test";
import { POSTS } from "../support/routes";

function extractUrlFromBackgroundImage(style: string | null): string | null {
  if (!style) {
    return null;
  }

  const matched = /url\((?:"|')?(.*?)(?:"|')?\)/.exec(style);
  return matched?.[1] ?? null;
}

test("@critical 文章内页头图应优先使用当前文章 cover", async ({ page }) => {
  const response = await page.goto(POSTS.publicPost);
  expect(response?.ok()).toBeTruthy();

  const headerCover = page.locator("#imgs .single-image");
  await expect(headerCover).toBeVisible();

  const headerCoverSrc = await headerCover.evaluate((element) => {
    if (element instanceof HTMLImageElement) {
      return element.currentSrc || element.src;
    }

    const style = window.getComputedStyle(element);
    return style.backgroundImage;
  });

  const headerCoverUrl = headerCoverSrc.startsWith("url(")
    ? extractUrlFromBackgroundImage(headerCoverSrc)
    : headerCoverSrc;

  expect(headerCoverUrl).not.toBeNull();
  expect(headerCoverUrl).toContain("cover-1");
});

test("@critical 文章内页相邻文章封面应与目标文章 cover 一致", async ({ page }) => {
  const response = await page.goto(POSTS.publicPost);
  expect(response?.ok()).toBeTruthy();

  const adjacentLink = page.locator(
    `.post-nav a[href="${POSTS.adjacentPublicPost}"]`,
  );
  await expect(adjacentLink).toBeVisible();

  const nextBackgroundImage = await adjacentLink.evaluate((element) => {
    return window.getComputedStyle(element).backgroundImage;
  });

  const nextCoverUrl = extractUrlFromBackgroundImage(nextBackgroundImage);

  expect(nextCoverUrl).not.toBeNull();
  expect(nextCoverUrl).toContain("cover-2");
});
