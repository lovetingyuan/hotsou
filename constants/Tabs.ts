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
    title: '微博',
    show: true,
    url: 'https://m.weibo.cn/p/106003type=25&t=3&disable_hot=1&filter_type=realtimehot',
  },
  {
    name: TabsName.baidu,
    title: '百度',
    show: true,
    url: 'https://top.baidu.com/board?tab=realtime',
  },
  {
    name: TabsName.toutiao,
    title: '头条',
    show: true,
    url: 'https://api.toutiaoapi.com/feoffline/hotspot_and_local/html/hot_list/index.html',
  },
  {
    name: TabsName.tengxun,
    title: '腾讯',
    show: true,
    url: 'https://view.inews.qq.com/ranking?rankingtabtype=1',
  },
  {
    name: TabsName.douyin,
    title: '抖音',
    show: true,
    url: 'https://www.douyin.com/share/billboard',
  },
  {
    name: TabsName.xinlang,
    title: '新浪',
    show: true,
    url: 'https://sinanews.sina.cn/h5/top_news_list.d.html',
  },
  {
    name: TabsName.wangyi,
    title: '网易',
    show: true,
    url: 'https://wp.m.163.com/163/html/newsapp/hot-content/index.html?version=searchFirstTab',
  },
  {
    name: TabsName.zhihu,
    title: '知乎',
    show: true,
    url: 'https://www.zhihu.com/billboard',
  },
  {
    name: TabsName.zidingyi1,
    title: '自定义1',
    url: 'https://',
    show: false,
  },
  {
    name: TabsName.zidingyi2,
    title: '自定义2',
    url: 'https://',
    show: false,
  },
  {
    name: TabsName.zidingyi3,
    title: '自定义3',
    url: 'https://',
    show: false,
  },
  {
    name: TabsName.zidingyi4,
    title: '自定义4',
    url: 'https://',
    show: false,
  },
  {
    name: TabsName.zidingyi5,
    title: '自定义5',
    url: 'https://',
    show: false,
  },
]

export const getTabUrl = (name: string) => {
  return TabsList.find(t => t.name === name)?.url
}
