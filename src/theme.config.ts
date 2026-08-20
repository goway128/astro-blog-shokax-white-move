// cannot use path alias here because unocss can not resolve it
import { defineConfig } from "./toolkit/themeConfig";

export default defineConfig({
  siteName: "白の小站",
  brand: {
    title: "白の小站",
    subtitle: "伤心桥下春波绿，曾是惊鸿照影来。",
    logo: "🍥",
  },
  nav: [
    {
      href: "/",
      text: "首页",
      icon: "i-ri-home-line",
    },
    {
      href: "/about/",
      text: "关于",
      icon: "i-ri-user-3-line",
    },
    {
      href: "/random/",
      text: "文章",
      icon: "i-ri-quill-pen-fill",
      dropbox: {
        enable: true,
        items: [
          {
            href: "/categories/",
            text: "分类",
            icon: "i-ri-book-shelf-fill",
          },
          {
            href: "/tags/",
            text: "标签",
            icon: "i-ri-price-tag-3-fill",
          },
          {
            href: "/archives/",
            text: "归档",
            icon: "i-ri-archive-line",
          },
        ],
      },
    },
    {
      href: "/friends/",
      text: "友链",
      icon: "i-ri-link",
    },
    {
      href: "/moments/",
      text: "动态",
      icon: "i-ri-chat-quote-line",
    },
    {
      href: "/statistics/",
      text: "统计",
      icon: "i-ri-bar-chart-box-line",
    },
    {
      href: "/privacy/",
      text: "隐私政策",
      icon: "i-ri-shield-user-line",
    },
    {
      href: "https://status.life-white.uk/",
      text: "白の监控",
      icon: "i-ri-computer-line",
    },
    {
      href: "https://blog.life-white.uk/",
      text: "白の博客-001",
      icon: "i-ri-link",
    },
  ],
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
      icon: "/images/moe-icp.svg",
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
    avatar:
      "https://img.life-white.uk/file/AgACAgQAAyEGAATrQHCPAAMMagQFi_l2KCPVk8AITeioEXXq9WUAAl8Paxto0yFQOrKizTsT7tQBAAMCAAN4AAM7BA.jpg",
    // 分组显示；如需回到单列表，删除 groups 并保留 links 即可
    groups: [
      {
        title: "个人博客",
        description: "认识的朋友们，欢迎互访。",
        links: [
          {
            url: "https://www.10dianai.com/",
            title: "10dian-AI",
            desc: "AI、二次元、游戏、各种你喜欢的",
            author: "10dian",
            avatar: "http://img.10dianai.com/10dianai-w.jpg",
            color: "var(--color-blue)",
          },         
          {
            url: "https://mahiro.uk/",
            title: "Smirnova Oyama",
            desc: "一个本科计算机学生",
            author: "Smirnova Oyama",
            avatar: "https://mahiro.uk/content/nekoxun.jpg",
            color: "var(--color-purple)",
          },
          {
            url: "https://luciferxzy.me/",
            title: "Luciferの小破站",
            desc: "不要回头看",
            author: "Lucifer",
            avatar: "https://a1.boltp.com/2026/05/06/69fb09fbe2356.jpg",
            color: "var(--color-red)",
          },
          {
            url: "https://www.qingfengnb.cn/",
            title: "轻风blog",
            desc: "茫茫人海，多么幸运才能遇见你！",
            author: "轻风",
            avatar: "https://img.qingfengnb.cn/LightPicture/2025/07/bec6eb9625656d60.jpg",
            color: "var(--color-aqua)",
          },
          {
            url: "https://www.imaegoo.com/",
            title: "虹墨空间站",
            desc: "iMaeGoo's Blog",
            author: "iMaeGoo",
            avatar: "https://cdn.jsdelivr.net/npm/imaegoo/avatar.jpg",
            color: "var(--color-blue)",
          },
          {
            url: "https://blog.cuteleaf.cn",
            title: "夏夜流萤",
            desc: "飞萤之火自无梦的长夜亮起，绽放在终竟的明天。",
            author: "夏夜流萤",
            avatar:
              "https://weavatar.com/avatar/d252655d40d6874417a720bad0a6c5f77f8f6a1fd2f882f8f338402dc37e4190?s=640.jpg",
            color: "var(--color-yellow)",
          },
          {
            url: "https://clb.pages.dev",
            title: "学海无涯",
            desc: "停止摆烂，背水一战",
            author: "学海无涯",
            avatar: "https://s2.loli.net/2024/06/02/wuJknzxaFigDSdL.gif",
            color: "var(--color-green)",
          },
          {
            url: "https://blog.caotx.cn/",
            title: "小曹同学",
            desc: "春祺夏安 秋绥冬禧",
            author: "小曹同学",
            avatar: "https://pic.caotx.cn/home/friends/avatars_0_myweb.webp",
            color: "var(--color-yellow)",
          },
        ],
      },
      {
        title: "工具与资源",
        description: "常用的工具、框架与文档站。",
        links: [
          {
            url: "https://astro.build/",
            title: "Astro",
            desc: "现代化的静态站点构建框架。",
            author: "Astro",
            avatar: "https://astro.build/favicon.svg",
            color: "var(--color-orange)",
          },
        ],
      },
    ],
    links: [],
  },
});
