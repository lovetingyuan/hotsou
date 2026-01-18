import WebView from "@/components/WebView";
import { getTabUrl, TabsName } from "@/constants/Tabs";

function __$inject() {
  if (location.hostname === "top.baidu.com") {
    history.scrollRestoration = "auto";
    // @ts-ignore
    window.__markReaded?.(".c-text-item", ".item-word", ".c-text-item .item-word");
  }
}

export default function BaiduScreen() {
  return (
    <WebView
      name={TabsName.baidu}
      url={getTabUrl(TabsName.baidu)!}
      js={`(${__$inject})()`}
      css={`
        #hot0 {
          display: none !important;
        }
      `}
      forbiddenUrls={["activity.baidu.com/mbox", "wappass.baidu.com"]}
    />
  );
}
