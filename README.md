# hotsou

可以聚合查看一些国内媒体的热搜

下载: [Releases](https://github.com/lovetingyuan/hotsou/releases)

https://hotsou.tingyuan.in

本地开发时分别运行 `npm run server` 和 `npm run android`（也可用 `npm run app:start`）。app 默认使用 Expo 开发服务器的主机地址连接 `8787` 端口，手机和开发机需要在同一局域网。

如果 server 在其他机器上，或 Expo 使用 tunnel，可在 `app/.env.local` 中设置 `EXPO_PUBLIC_API_URL=http://可访问的服务器地址:8787`，然后重新启动 Expo。旧的 `EXPO_PUBLIC_IPV4` 配置不再使用。
