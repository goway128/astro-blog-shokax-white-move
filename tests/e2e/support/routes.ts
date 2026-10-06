export const ROUTES = {
  home: "/",
  page2: "/page/2/",
  page3: "/page/3/",
  moments: "/moments/",
  tags: "/tags/",
  categories: "/categories/",
} as const;

export const POSTS = {
  publicPost: "/posts/my-first-post/",
  adjacentPublicPost: "/posts/a-quiet-afternoon/",
  encryptedTest: "/posts/encrypted-test/",
  imageZoomTest: "/posts/note-mdx-demo/",
  noteMdxDemo: "/posts/note-mdx-demo/",
  postMigrationTest: "/posts/post-migration-test/",
} as const;

export const SEARCH_TERMS = {
  publicPostTitle: "什么是 MCP：让 AI 应用共享工具的协议",
  publicPostQuery: "MCP",
  encryptedPostTitle: "加密文章测试",
  encryptedOnlyText: "AES-GCM",
} as const;
