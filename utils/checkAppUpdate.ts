// const url = `https://api.github.com/repos/lovetingyuan/hotsou/releases`
const latestRelease = 'https://github.com/lovetingyuan/hotsou/releases/latest'

async function getRedirectUrl(url: string) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
    })
    if (response.status === 200 && response.url.includes('releases/tag/')) {
      const v = response.url.split('/').pop()
      return v?.slice(1)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

export default function checkAppUpdate() {
  return getRedirectUrl(latestRelease).then(r => {
    // https://github.com/lovetingyuan/hotsou/releases/download/v1.2.0/hotsou-1.2.0.apk
    if (r && r.includes('.')) {
      return {
        version: r,
        downloadUrl: `https://github.com/lovetingyuan/hotsou/releases/download/v${r}/hotsou-${r}.apk`,
      }
    }
  })
}
