// cannot use path alias here because unocss can not resolve it
import { defineConfig } from "./toolkit/themeConfig";

export default defineConfig({
  siteName: "白の小站",
  brand: {
    title: "白の小站",
    subtitle: "伤心桥下春波绿，曾是惊鸿照影来。",
    logo: "🍥",
  },
  sidebar: {
    author: "white",
    description: "喵喵喵",
    social: {
      github: {
        url: "https://github.com/goway128",
        icon: "i-ri-github-fill",
      },
      email: {
        url: "mailto:1314520@life-white.uk",
        icon: "i-ri-mail-line",
      },
    },
  },
  footer: {
    since: 2026,
    icp: {
      enable: true,
      icon: "i-ri-heart-fill",
      icpnumber: "萌ICP备20267676号",
      icpurl: "https://icp.gov.moe/?keyword=20267676",
    },
  },
  hyc: {
    enable: true,
    aiSummary: {
      enable: true,
      title: "AI 摘要",
      showModel: false,
    },
  },
  friends: {
    title: "友链",
    description: "这里是我的朋友们，欢迎互访。",
    links: [
      {
        url: "https://mahiro.uk/",
        title: "Smirnova Oyama",
        desc: "一个本科计算机学生",
        author: "Smirnova Oyama",
        avatar: "https://mahiro.uk/content/nekoxun.jpg",
      },
      {
        url: "https://luciferxzy.me/",
        title: "Luciferの小破站",
        desc: "不要回头看",
        author: "Lucifer",
        avatar: "https://a1.boltp.com/2026/05/06/69fb09fbe2356.jpg",
      },
      {
        url: "https://www.qingfengnb.cn/",
        title: "轻风blog",
        desc: "茫茫人海，多么幸运才能遇见你！",
        author: "轻风",
        avatar: "https://img.qingfengnb.cn/LightPicture/2025/07/bec6eb9625656d60.jpg",
      },
      {
        url: "https://www.imaegoo.com/",
        title: "虹墨空间站",
        desc: "iMaeGoo's Blog",
        author: "iMaeGoo",
        avatar: "https://cdn.jsdelivr.net/npm/imaegoo/avatar.jpg",
      },
      {
        url: "https://blog.cuteleaf.cn",
        title: "夏夜流萤",
        desc: "飞萤之火自无梦的长夜亮起，绽放在终竟的明天。",
        author: "夏夜流萤",
        avatar: "https://weavatar.com/avatar/d252655d40d6874417a720bad0a6c5f77f8f6a1fd2f882f8f338402dc37e4190?s=640.jpg",
      },
    ],
  },
});
