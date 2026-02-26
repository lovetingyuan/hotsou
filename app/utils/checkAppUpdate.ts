export default async function checkAppUpdate() {
  const { result } = await fetch(
    'https://tingyuan.in/api/app/version',
  ).then((r) => r.json())
  const latest = result?.version
  if (latest) {
    const version = latest.version.slice(1)
    return {
      version,
      changelog: latest.changelog,
      downloadUrl: `https://ghfast.top/https://github.com/lovetingyuan/hotsou/releases/download/v${version}/hotsou-${version}.apk`,
    }
  }
}
