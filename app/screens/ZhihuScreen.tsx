import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  setInterval(() => {
    const btn = document.querySelector('.MobileModal-wrapper button')
    if (btn) {
      // @ts-ignore
      btn.click()
    }
  }, 200)
  // @ts-ignore
  window.__markRead?.('.HotList-item', '.HotList-itemTitle', '.HotList-item .HotList-itemTitle')
}

export default function ZhihuScreen() {
  return (
    <WebView
      name={TabsName.zhihu}
      url={getTabUrl(TabsName.zhihu)!}
      forbiddenUrls={[
        'zhihu-web-analytics.zhihu.com',
        'datahub.zhihu.com',
        'apm.zhihu.com',
        'www.zhihu.com/oia/',
      ]}
      css={`
        .OpenInAppButton,
        .OpenInApp,
        .MobileModal-wrapper,
        .MHotFeedAd,
        .AdBelowMoreAnswers,
        .KfeCollection-VipRecommendCard,
        .MBannerAd,
        .RelatedReadingsItem:has(.MRelateFeedAd),
        .WeiboAd-wrap,
        .zhihuAdvert-MBanner,
        .Card.HotQuestions {
          display: none !important;
        }
        .Question-mainEntity > div:nth-of-type(2) {
          display: none !important;
        }
        main.App-main::after {
          content: '暂无更多';
          display: block;
          font-size: 16px;
          margin: 10px 0;
          color: #888;
          text-align: center;
        }
      `}
      cookie={`_xsrf=QDy7lTEuRV9PT9xWwPOQRe6kwgs00Bjj; __zse_ck=005_Qqeh3XBm4r5nKRmteyhEONyTZV89B8EbS1obd0mYfCoKFkJtHW9Lp1YhClkukj3xFT9HeUulm4nT0gAvLT/TRw8yqP3RCL5wS9HN0TuXdFA5CyuCFAn0L8nWEEbQ1cV4-US9eL0+CvX+BkyzHIoy2mXQnfaZmx1SzMAUE0wxLrwXRNIqBSg9kQbIs64AUTmawdmMOwubx2smjbqBf9quz3zrxVpGDl73npp+lsgOAYOn1nTfS/8fk3gCSfy7qr4vleGwFmcuXbexWBCiRNGrCEQWskt/Em2VO4jEq2W6ce/Y=; _zap=ec18f3e1-78ec-4ceb-996a-47540237839d; d_c0=HSOUAD-__RuPTkRdkgnMsPL--lYeBbvDoV0=|1773665144; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1773665145; HMACCOUNT=42084411D9F8E016; DATE=1773665145881; __snaker__id=oMF01x2wDj4FZeW0; crystal=U2FsdGVkX1/IU828vKdjLlya/9yCd3HnK/UQH5/OckBy9xfkbsuuV3CO8VKMoVbVp6FzKBCTjQaYdbexACeF34M/JqPILoL4d71mK35hX3178kJgRdW18DlTbcplvWEPLygy7a7ReL0qbSvdP6Di19XSaIjvpxVu2CCR1AghQTAOge9M4WTQ07z9Frcjv6JAYFHKXSCY0rClN/30I84S8KiE7PsSXnmPRVRq5w7XwMSagUWrlN8M55i9FrfPG1+t; gdxidpyhxdE=8Ka4ebo0jykx1ScPI9ufSQmu37Vggx%2F92s2QcZLLjzZCyd73NzbJBfVdhYlprQSWGOMfJ776Ega8wj8ncln4EDu7M1MmuKA9wZ4b52uMgg2NGKTtSS8KmEzeiGp1CB4dfXYSRex3OZjNmVNCMwjDBpfjSie5RX6TndahUxqs5bSxAtH8%3A1773671037232; captcha_session_v2=2|1:0|10:1773670203|18:captcha_session_v2|88:UzlrOU5ta29GQXpWVFArR2xnTDRVUE5EeXRLK2NXWWJFdXJJejlubkRWeFVKOWlEczdTRktGN3AvdEtCMDFMTw==|626a0647f796d0810f848b30050b5411c0502c38e7c381e60c130882663a7eaf; assva6=U2FsdGVkX19j4OVMpigIAnIM++e7mQrXuGzSAlmaVuw=; assva5=U2FsdGVkX1+52dqnsCBXRto14Z3X42/GELFfNIuvhwloBJOxlQHgdBX5t8v9OBphRKz/2RMA/gv/ywIdtyXAqQ==; cmci9xde=U2FsdGVkX1839n13oMVmzxD7iJo10TQkFkS13a/j9gABphQHtW8Mv9iPYHLoL0Voo6JVSSa6lmuvYGCP3fGMBg==; pmck9xge=U2FsdGVkX185EwgSYVC7OrKLWBLtojTi5yTVQv7yGB4=; SESSIONID=nImI5bc4BCuT115vuzIhEgOJFrSw6HvSeEAiIby8Kw8; vmce9xdq=U2FsdGVkX1+hjorxP/Eu6joMiZ9fnSuexA0amHmayrpp4p4oLwdQ8IOPTdei+541oB2eAdtQ5JPq3Lw2Ur4ceWdYOUp6JBg8Pf+56wKyOpuk8GEYU1izo4RIW9AddR43kN2FS9EQbzcRuhOamJDl3aYPYtduaFXIxlfN500Z1q4=; JOID=W1gXAk-ui-VdCOaIZSy6-sxMUXF1ycCLETCN6VLhwZIKPNq0EZmFWzwM7YljYWd5lp5NY1zjxu_PXu_cudAiBwY=; osd=VlkXAUyjiuVeC-uJZS-5981MUnJ4yMCIEj2M6VHizJMKP9m5EJmGWDEN7YpgbGZ5lZ1AYlzgxeLOXuzftNEiBAU=; captcha_ticket_v2=2|1:0|10:1773670214|17:captcha_ticket_v2|728:eyJ2YWxpZGF0ZSI6IkNOMzFfc29JeTFzUVRyekE1dVFlZVR2QWJzd1FzSlFkRTVEYVFqVENIMmFmU3FZNUxoV2hIeHBYOVRVTFdfMXZ4MFZHblhIZlp2RzVvMXlBa3J0aDlobUgqYk9XM0pNRU1MU2Rrci5Rd0ZsVm4uKk96SnFpVlVRci41RU50ZWVkZFlEcEVBdTQ4KlpaYmpVR01hUUR5STR6TmN0NGpvYklFKk85M2EzWFB5OFphbk5WX2RGbS5qWWdhMGR3R1RRNnFJdjhyb3I5OUp6NFJ1Zk5Ia08yTGJwKk9BZ3l1bHNqY1hGYWpIQXEqSWNaMW00UWswYW5YTkcweWsublFQaFdvT21jZnU1NnFkWnJsUG1neUhROG4ubzZOYkdIVSpKRFFCQVNITzJSOW5lS1p3NDZrTHZJKlBsWWpMOVdjQ25WUzA2YTVUR3A4YUltNjR1elYwTC54aHUyWHhKdXplRjFWZ3BZMzN2eWlGRDhrTm9MdWpBUWFZYXJlT04qLlZ0WnVxUm40KkYwQkc1U0hnc3ZpUFh4U1BCSXBBY0hQYmpiV1JuZzJpZjZBNHM0aE9qUm5vOG96OXljM00zb3loOXZ4YXhRVHBreDJwcFR2Y0RFeVJ2Q1JORFpHQUZ3MVVxSUVBY2J3NVY5ejFsQlpNZDJoOW1kUGxDWnpmZFdaWFZKR0hEVmxtUTQuZGc3N192X2lfMSJ9|e7798bf511d41716905d38b5a036e4f0ce0f8da14d330bf6bad2a9ad4b983094; z_c0=2|1:0|10:1773670228|4:z_c0|92:Mi4xN3B6Qk1nQUFBQUFkSTVRQVA3XzlHeVlBQUFCZ0FsVk5WRjJsYWdDcjhfZnhjY0NxeG9GZFBaVnlTa3FKbng1bURn|6a656afa120e418277345a51b2c5ac0c274772392ddc5fc43f7aac8a0e126240; BEC=04678b89b8500afc30b012aad143c9b0; Hm_lpvt_98beee57fd2ef70ccdd5ca52b9740c49=1773670229`}
      js={`(${__$inject})()`}
      referer='https://www.zhihu.com/signin?next=%2Fhot'
    />
  )
}
