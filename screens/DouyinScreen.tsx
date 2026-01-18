import WebView from "@/components/WebView";
import { getTabUrl, TabsName } from "@/constants/Tabs";

function __$inject() {
  const TARGET_URL =
    "https://lf-douyin-mobile.bytecdn.com/obj/growth-douyin-share/growth/douyin_ug/static/image/bg-hot-title.e1b11d08.png";
  // @ts-ignore
  const processNode = (node) => {
    if (
      node.nodeType === 1 &&
      node.tagName === "X-IMAGE" &&
      node.classList?.contains("banner-image")
    ) {
      if (node.getAttribute("src") !== TARGET_URL) {
        node.setAttribute("src", TARGET_URL);
      }
    }
  };

  // 1. Check existing nodes
  document.querySelectorAll("x-image.banner-image").forEach(processNode);

  // 3. Observe changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach(processNode);
      } else if (mutation.type === "attributes" && mutation.attributeName === "src") {
        processNode(mutation.target);
      }
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src"],
  });
  if (location.pathname === "/landings/hotlist") {
    // @ts-ignore
    window.__markReaded?.(
      "x-view[data-topic]",
      "x-text.hot-item-title-text",
      "x-text.hot-item-title-text",
    );
    // @ts-ignore
    window.__keepScrollPosition("#hot-list-0[enable-scroll", 80);
  }
}
const jsCode = `(${__$inject})()`;

export default function DouyinHotlistScreen() {
  return (
    <WebView
      name={TabsName.douyin}
      url={getTabUrl(TabsName.douyin)!}
      js={jsCode}
      css={`
        x-view[data-index]:has(x-image.hot-item-index-top),
        x-foldview-slot-drag-ng,
        div[data-tag='header'] {
          display: none !important;
        }
        #hot-list-0 {
          padding-bottom: 50px !important;
        }
        x-foldview-slot-ng {
          margin-top: 14px;
        }
      `}
    />
  );
}
