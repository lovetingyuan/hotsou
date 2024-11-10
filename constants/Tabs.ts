export enum TabsName {
  weibo = 'weibo',
  baidu = 'baidu',
  toutiao = 'toutiao',
  douyin = 'douyin',
  zhihu = 'zhihu',
  wangyi = 'wangyi',
  // muzi = 'muzi',
  tengxun = 'tengxun',
  xinlang = 'xinlang',
  // ----------------
  zidingyi1 = 'zidingyi1',
  zidingyi2 = 'zidingyi2',
  zidingyi3 = 'zidingyi3',
  zidingyi4 = 'zidingyi4',
  zidingyi5 = 'zidingyi5',
}

export const TabsList = [
  {
    name: TabsName.weibo,
    title: '微博热搜',
    show: true,
    url: 'https://m.weibo.cn/p/106003type=25&t=3&disable_hot=1&filter_type=realtimehot',
    builtIn: true,
  },
  {
    name: TabsName.baidu,
    title: '百度热搜',
    show: true,
    url: 'https://top.baidu.com/board?tab=realtime',
    builtIn: true,
  },
  {
    name: TabsName.toutiao,
    title: '头条热榜',
    show: true,
    url: 'https://api.toutiaoapi.com/feoffline/hotspot_and_local/html/hot_list/index.html',
    builtIn: true,
  },
  {
    name: TabsName.tengxun,
    title: '腾讯热榜',
    show: true,
    url: 'https://view.inews.qq.com/ranking?rankingtabtype=1',
    builtIn: true,
  },
  {
    name: TabsName.douyin,
    title: '抖音热点',
    show: true,
    url: 'https://www.douyin.com/share/billboard',
    icon: 'https://logo.clearbit.com/douyin.com',
    builtIn: true,
  },
  {
    name: TabsName.xinlang,
    title: '新浪热榜',
    show: true,
    url: 'https://sinanews.sina.cn/h5/top_news_list.d.html',
    builtIn: true,
  },
  {
    name: TabsName.wangyi,
    title: '网易热榜',
    show: true,
    url: 'https://wp.m.163.com/163/html/newsapp/hot-content/index.html?version=searchFirstTab',
    builtIn: true,
  },
  {
    name: TabsName.zhihu,
    title: '知乎热榜',
    show: true,
    url: 'https://www.zhihu.com/billboard',
    builtIn: true,
  },
  {
    name: TabsName.zidingyi1,
    title: '自定义1',
    url: '',
    show: false,
  },
  {
    name: TabsName.zidingyi2,
    title: '自定义2',
    url: '',
    show: false,
  },
  {
    name: TabsName.zidingyi3,
    title: '自定义3',
    url: '',
    show: false,
  },
  {
    name: TabsName.zidingyi4,
    title: '自定义4',
    url: '',
    show: false,
  },
  {
    name: TabsName.zidingyi5,
    title: '自定义5',
    url: '',
    show: false,
  },
]

export const getTabUrl = (name: string) => {
  return TabsList.find(t => t.name === name)?.url
}
