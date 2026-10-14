import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'FF7 重生图文攻略',
  description: '《最终幻想7：重生》自制中文图文攻略——按实际游戏进度持续更新',
  lang: 'zh-CN',
  // 项目页地址：https://pkm365.github.io/ff7-rebirth-guide/
  base: '/ff7-rebirth-guide/',

  themeConfig: {
    nav: [
      { text: '新手入门', link: '/start' },
      { text: '主线流程', link: '/chapters/' },
      { text: 'Boss 图鉴', link: '/boss' },
      { text: '术语表', link: '/glossary' }
    ],

    sidebar: [
      {
        text: '入门',
        items: [
          { text: '新手先看', link: '/start' },
          { text: '术语表', link: '/glossary' }
        ]
      },
      {
        text: '主线流程（14 章）',
        items: [
          { text: '章节总览', link: '/chapters/' },
          { text: '第 1 章 · 尼布尔村的回忆', link: '/chapters/ch01' },
          { text: '第 2 章 · 草原与陆行鸟', link: '/chapters/ch02' },
          { text: '第 3 章 · 秘银矿山', link: '/chapters/ch03' },
          { text: '第 4 章', link: '/chapters/ch04' },
          { text: '第 5 章', link: '/chapters/ch05' },
          { text: '第 6 章', link: '/chapters/ch06' },
          { text: '第 7 章', link: '/chapters/ch07' },
          { text: '第 8 章', link: '/chapters/ch08' },
          { text: '第 9 章', link: '/chapters/ch09' },
          { text: '第 10 章', link: '/chapters/ch10' },
          { text: '第 11 章', link: '/chapters/ch11' },
          { text: '第 12 章', link: '/chapters/ch12' },
          { text: '第 13 章', link: '/chapters/ch13' },
          { text: '第 14 章', link: '/chapters/ch14' }
        ]
      },
      {
        text: '探索收集',
        items: [
          { text: '支线任务（36）', link: '/quests' },
          { text: '世界情报（169）', link: '/world' }
        ]
      },
      {
        text: '系统玩法',
        items: [
          { text: '女王之血', link: '/queen-blood' },
          { text: '小游戏与金碟', link: '/minigames' },
          { text: '角色配装', link: '/builds' },
          { text: '武器防具饰品', link: '/gear' }
        ]
      },
      {
        text: '战斗',
        items: [
          { text: 'Boss 图鉴（15）', link: '/boss' }
        ]
      },
      {
        text: '通关',
        items: [
          { text: '全成就路线', link: '/trophy' },
          { text: '好感度与约会', link: '/bond' }
        ]
      },
      {
        text: '附录',
        items: [
          { text: '参考资料', link: '/resources' }
        ]
      }
    ],

    search: { provider: 'local' },
    outline: 'deep',
    lastUpdated: true,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pkm365/ff7-rebirth-guide' }
    ],

    footer: {
      message: '自制中文攻略 · 内容随游戏进度持续更新',
      copyright: '游戏画面与名称版权归 Square Enix 所有，本站为粉丝学习用途'
    },

    docFooter: { prev: '上一页', next: '下一页' },
    outlineTitle: '本页目录',
    darkModeSwitchLabel: '深色模式',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部'
  }
})
