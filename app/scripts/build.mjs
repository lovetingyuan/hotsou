#!/usr/bin/env zx
/* eslint-disable no-console */
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'

import open from 'open'
import semver from 'semver'
import { $, chalk, fs, question, spinner, usePowerShell } from 'zx'
// eslint-disable-next-line react-hooks/rules-of-hooks
usePowerShell()

$.verbose = false

const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✔'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg),
  error: (msg) => console.log(chalk.red('✖'), msg),
}

const APP_JSON_PATH = 'app.json'
const EAS_JSON_PATH = 'eas.json'
const APK_DIR = 'apk'
const MAIN_BRANCH = 'main'
const REPO_URL = 'https://github.com/lovetingyuan/hotsou'

const readAppJson = () => JSON.parse(fs.readFileSync(APP_JSON_PATH, 'utf8'))

const writeAppJson = (data) => {
  fs.writeFileSync(APP_JSON_PATH, JSON.stringify(data, null, 2))
}

const withRetry = async (attempts, task, label) => {
  let lastError
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await task(i)
    } catch (err) {
      lastError = err
      log.warn(`${label} failed (attempt ${i + 1}/${attempts})`)
      await new Promise((resolve) => setTimeout(resolve, 800 * (i + 1)))
    }
  }
  throw lastError
}

const assertResponseOk = async (url, name) => {
  await withRetry(
    3,
    async () => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`${name} responded with ${res.status}`)
      }
    },
    `${name} check`,
  )
}

const parseBuildJson = (output) => {
  const text = output.trim()
  if (!text) {
    throw new Error('EAS build output is empty')
  }

  // 从后往前找到可能的 JSON 数组，使用括号匹配确保找到正确的完整数组
  let searchPos = text.length - 1
  while (searchPos >= 0) {
    const start = text.lastIndexOf('[', searchPos)
    if (start === -1) break

    // 使用栈来匹配括号，找到对应的 ']'
    let depth = 0
    let end = -1
    for (let i = start; i < text.length; i++) {
      if (text[i] === '[') depth++
      else if (text[i] === ']') depth--

      if (depth === 0) {
        end = i
        break
      }
    }

    if (end !== -1) {
      const slice = text.slice(start, end + 1)
      try {
        const parsed = JSON.parse(slice)
        if (Array.isArray(parsed) && parsed[0]?.status) {
          return parsed[0]
        }
      } catch {
        // JSON 解析失败，继续尝试前一个 '['
      }
    }

    searchPos = start - 1
  }

  throw new Error('Unable to locate valid JSON array in EAS build output')
}

const ensureGitSynced = async () => {
  await $`git fetch`
  const branch = (await $`git rev-parse --abbrev-ref HEAD`).stdout.trim()
  if (branch !== MAIN_BRANCH) {
    throw new Error(`Current branch is ${branch}, expected ${MAIN_BRANCH}`)
  }
  const status = (await $`git status -sb`).stdout.trim()
  if (!status.includes('...')) {
    throw new Error('Unable to detect remote tracking branch')
  }
  const aheadBehind = status.split('\n')[0]
  if (aheadBehind.includes('behind')) {
    throw new Error('Local branch is behind remote. Please pull first.')
  }
}

const ensureAppVersionSourceLocal = () => {
  if (!fs.existsSync(EAS_JSON_PATH)) {
    throw new Error(`Missing ${EAS_JSON_PATH}`)
  }
  const easJson = JSON.parse(fs.readFileSync(EAS_JSON_PATH, 'utf8'))
  const source = easJson?.cli?.appVersionSource
  if (source !== 'local') {
    throw new Error(`eas.json cli.appVersionSource should be "local" (current: ${source})`)
  }
}

const main = async () => {
  log.info('Starting EAS build script')

  await spinner('Checking environment...', async () => {
    const gitStatus = await $`git status --porcelain`
    if (gitStatus.stdout.trim() !== '') {
      throw new Error('Git workspace is not clean')
    }
    log.success('Git workspace clean')

    await assertResponseOk('https://github.com', 'GitHub')
    log.success('GitHub reachable')

    await assertResponseOk('https://api.expo.dev', 'Expo API')
    log.success('Expo API reachable')

    await withRetry(2, () => $`eas --version`, 'EAS CLI version')
    log.success('EAS CLI available')

    const easUser = await withRetry(2, () => $`eas whoami`, 'EAS login')
    if (!easUser.stdout.trim()) {
      throw new Error('EAS not logged in')
    }
    log.success('EAS logged in')

    await ensureGitSynced()
    log.success('Git branch up to date')

    ensureAppVersionSourceLocal()
    log.success('App version source is local')
  })

  if (!fs.existsSync(APP_JSON_PATH)) {
    log.error(`Missing ${APP_JSON_PATH}`)
    process.exit(1)
  }

  const appJson = readAppJson()
  const currentVersion = appJson.expo?.version
  if (!currentVersion) {
    log.error('app.json missing expo.version')
    process.exit(1)
  }

  log.info(`Current version: ${currentVersion}`)

  const newVersion = await question(`New version (${currentVersion} -> ?): `)
  if (!semver.valid(newVersion) || !semver.gt(newVersion, currentVersion)) {
    log.error(`Invalid version input: ${newVersion}`)
    process.exit(1)
  }

  const changelog = await question('Release notes (split by two spaces): ')
  if (!changelog.trim()) {
    log.error('Release notes cannot be empty')
    process.exit(1)
  }

  appJson.expo.version = newVersion
  writeAppJson(appJson)
  log.success(`Updated app.json to ${newVersion}`)

  let buildResult
  try {
    log.info('Starting EAS production build...')
    const { stdout, stderr } = await spinner('EAS building...', () => {
      return $`eas build --platform android --profile production --message ${changelog} --json --non-interactive --wait`
    })
    buildResult = parseBuildJson(`${stdout}\n${stderr}`)

    if (buildResult.status !== 'FINISHED') {
      throw new Error(`Build status is ${buildResult.status}`)
    }

    if (buildResult.appVersion && buildResult.appVersion !== newVersion) {
      throw new Error(`Build appVersion ${buildResult.appVersion} does not match ${newVersion}`)
    }

    log.success('EAS build finished')
  } catch (err) {
    log.error('EAS build failed')
    log.warn('Reverting app.json changes')

    const reverted = readAppJson()
    reverted.expo.version = currentVersion
    writeAppJson(reverted)

    log.error(err.message)
    process.exit(1)
  }

  const apkUrl = buildResult?.artifacts?.buildUrl
  if (!apkUrl) {
    log.error('No APK URL found in build result')
    process.exit(1)
  }

  try {
    if (!fs.existsSync(APK_DIR)) {
      fs.mkdirSync(APK_DIR, { recursive: true })
    }
    const apkPath = `${APK_DIR}/hotsou-${newVersion}.apk`
    log.info(`Downloading APK: ${apkUrl}`)
    await spinner('Downloading APK...', async () => {
      const response = await fetch(apkUrl)
      if (!response.ok || !response.body) {
        throw new Error(`Download failed: ${response.status}`)
      }
      await pipeline(response.body, createWriteStream(apkPath))
    })
    log.success(`Saved APK to ${apkPath}`)
  } catch (err) {
    log.error('APK download failed')
    log.error(err.message)
    process.exit(1)
  }

  try {
    const commitMessage = `release(v${newVersion}): ${changelog}`
    await spinner('Committing and pushing...', async () => {
      await $`git add ${APP_JSON_PATH}`
      await $`git commit -m ${commitMessage}`
      await $`git push`
    })
    log.success('Git push completed')
  } catch (err) {
    log.error('Git push failed')
    log.error(err.message)
    process.exit(1)
  }

  try {
    await spinner('Tagging release...', async () => {
      await $`git tag -a v${newVersion} -m ${changelog}`
      await $`git push origin v${newVersion}`
    })
    log.success('Tag pushed')
  } catch (err) {
    log.error('Tag push failed')
    log.error(err.message)
    process.exit(1)
  }

  const releaseNotes = changelog
    .split('  ')
    .filter((line) => line.trim())
    .map((line) => `- ${line}`)
    .join('\n')

  const releaseUrl = `${REPO_URL}/releases/new?tag=v${newVersion}&title=v${newVersion}&body=${encodeURIComponent(
    releaseNotes,
  )}`

  try {
    await spinner('Creating GitHub release...', async () => {
      await $`gh release create v${newVersion} --title v${newVersion} --notes ${releaseNotes}`
    })
    log.success('GitHub release created')
  } catch (err) {
    log.warn('Failed to create GitHub release via gh, opening browser fallback')
    log.warn(err.message)
    await open(releaseUrl)
  }
  log.success('Build script completed')
}

main().catch((err) => {
  log.error('Unexpected error')
  log.error(err.message)
  process.exit(1)
})
