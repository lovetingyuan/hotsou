export default async function checkAppUpdate() {
  const { data: list } = await fetch(
    'https://tingyuan.in/api/github/releases?user=lovetingyuan&repo=hotsou'
  ).then(r => r.json())
  const latest = list[0]
  if (latest) {
    const version = latest.version.slice(1)
    return {
      version,
      changelog: latest.changelog,
      downloadUrl: `https://ghfast.top/https://github.com/lovetingyuan/hotsou/releases/download/v${version}/hotsou-${version}.apk`,
    }
  }
}
