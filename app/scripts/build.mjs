#!/usr/bin/env zx

/**
 * Windows Android 发版：提交版本 → EAS 构建 → 下载 APK → 推送 tag → 打开 Release。
 * 进度保存在 tmp/release-state.json，失败后使用 --resume 继续，不回滚已提交的版本。
 * 根目录：npm run build -- --help；app 工作区：npm run build:android -- --help。
 */
import {
  copyFileSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import { isDeepStrictEqual, parseArgs as parseNodeArgs, stripVTControlCharacters } from 'node:util'

import open from 'open'
import semver from 'semver'
import { z } from 'zod'
import { $, chalk, question, spinner, usePowerShell } from 'zx'

// oxlint-disable-next-line react-hooks/rules-of-hooks
usePowerShell()
$.verbose = false

const APP_DIR = fileURLToPath(new URL('../', import.meta.url))
const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url))
const APP_JSON_PATH = join(APP_DIR, 'app.json')
const EAS_JSON_PATH = join(APP_DIR, 'eas.json')
const APK_DIR = join(APP_DIR, 'apk')
const STATE_PATH = join(REPO_ROOT, 'tmp', 'release-state.json')
const MAIN_BRANCH = 'main'
const REPO_URL = 'https://github.com/lovetingyuan/hotsou'
const BUILDS_PAGE_URL = 'https://expo.dev/accounts/tingyuan/projects/hotsou/builds'
const HTTP_TIMEOUT_MS = 15_000
const APK_TIMEOUT_MS = 15 * 60_000
const RESUME_COMMAND = 'npm run build -- --resume'

const INVOCATION_DIR = resolve(process.env.INIT_CWD || process.cwd())
// zx 保留了自身 CLI 路径与脚本路径，不能像直接运行 node 一样固定 slice(2)。
const scriptIndex = process.argv.findIndex(
  (argument) => resolve(argument).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase(),
)
const scriptArgs = process.argv.slice(scriptIndex + 1)
process.chdir(APP_DIR)
// zx 的命令工作目录独立于 process.cwd，必须在创建命令实例前一并固定。
$.cwd = APP_DIR
const nothrow = $({ nothrow: true })

const log = {
  info: (message) => console.log(chalk.blue('[INFO]'), message),
  success: (message) => console.log(chalk.green('[OK]'), message),
  warn: (message) => console.log(chalk.yellow('[WARN]'), message),
  error: (message) => console.log(chalk.red('[ERR]'), message),
  hint: (message) => console.log(chalk.yellow('[HINT]'), message),
}

const VersionSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/)
  .refine((value) => semver.valid(value) !== null)
const CommitSchema = z.string().regex(/^[a-f0-9]{40}$/)
const ReleaseStateSchema = z.object({
  version: VersionSchema,
  changelog: z.string().trim().min(1),
  baseCommit: CommitSchema,
  bumpCommit: CommitSchema.nullable(),
  buildId: z.string().min(1).nullable(),
  buildStatus: z.string().nullable(),
  buildUrl: z.string().nullable(),
  apkPath: z.string().min(1).nullable(),
  tagPushed: z.boolean(),
  releaseOpened: z.boolean(),
  updatedAt: z.string(),
})

let activeState = null

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

function printUsage() {
  console.log(`
Windows Android 生产发版（在仓库根目录运行）：
  npm run build                                        交互式输入版本与更新日志
  npm run build -- --version 1.9.7 --changelog "A  B"  跳过输入
  ${RESUME_COMMAND}                            从中断处继续
  ${RESUME_COMMAND} --build-id <buildId>       复用指定 EAS 构建
  ${RESUME_COMMAND} --apk <path>               复用 APK，跳过构建和下载
  npm run build -- --reset                             仅清除发布记录后退出

在 app 目录运行时，把 npm run build 换成 npm run build:android。
流程：检查环境 → 提交并推送版本 → EAS production 构建 → 下载 APK → 推送 tag → 打开 Release。
进度：${STATE_PATH}
tag 和 Release 标题为 v<版本>，附件为 hotsou-<版本>.apk，更新日志用双空格分隔。
请手动上传 APK，并点击 Publish release 发布正式版本。
`)
}

function parseArgs(argv) {
  let values
  try {
    ;({ values } = parseNodeArgs({
      args: argv,
      options: {
        version: { type: 'string' },
        changelog: { type: 'string' },
        'build-id': { type: 'string' },
        apk: { type: 'string' },
        resume: { type: 'boolean', default: false },
        reset: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    }))
  } catch (error) {
    throw new Error(`参数错误：${errorMessage(error)}（用 --help 查看用法）`)
  }
  for (const name of ['version', 'changelog', 'build-id', 'apk']) {
    if (values[name] !== undefined) {
      values[name] = values[name].trim()
      if (!values[name]) {
        throw new Error(`--${name} 不能为空`)
      }
    }
  }
  if (values.reset && Object.entries(values).some(([name, value]) => name !== 'reset' && value)) {
    throw new Error('--reset 必须单独使用，仅清除记录后退出')
  }
  if (values.apk && values['build-id']) {
    throw new Error('--apk 与 --build-id 不能同时使用')
  }
  if (values.apk) {
    values.apk = resolve(INVOCATION_DIR, values.apk)
  }
  return values
}

function readAppJson() {
  return JSON.parse(readFileSync(APP_JSON_PATH, 'utf8'))
}

function loadState() {
  if (!existsSync(STATE_PATH)) {
    return null
  }
  try {
    return ReleaseStateSchema.parse(JSON.parse(readFileSync(STATE_PATH, 'utf8')))
  } catch (error) {
    throw new Error(`发布记录损坏：${errorMessage(error)}；使用 npm run build -- --reset 清除`)
  }
}

function saveState(state) {
  state.updatedAt = new Date().toISOString()
  mkdirSync(dirname(STATE_PATH), { recursive: true })
  // 先完整写入临时文件，避免中断留下无法解析的进度记录。
  const tempPath = `${STATE_PATH}.tmp`
  writeFileSync(tempPath, `${JSON.stringify(state, null, 2)}\n`)
  renameSync(tempPath, STATE_PATH)
  activeState = state
}

function clearState() {
  rmSync(STATE_PATH, { force: true })
  rmSync(`${STATE_PATH}.tmp`, { force: true })
  log.info('已清除发布记录；Git 提交、tag、APK 和云端构建保留')
}

function printResumeInstructions(state) {
  log.hint(`进度记录：${STATE_PATH}`)
  const command =
    INVOCATION_DIR === resolve(APP_DIR) ? 'npm run build:android -- --resume' : RESUME_COMMAND
  log.hint(`续跑：${command}`)
  if (!state.tagPushed && !state.apkPath) {
    log.hint(`手动指定构建：${command} --build-id <buildId>`)
    log.hint(`或指定已下载的 APK：${command} --apk <path>`)
  }
  log.hint(`EAS 构建列表：${state.buildUrl || BUILDS_PAGE_URL}`)
}

async function withRetry(attempts, task, label) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await task()
    } catch (error) {
      if (attempt >= attempts) {
        throw error
      }
      log.warn(`${label}失败（${attempt}/${attempts}），正在重试：${errorMessage(error)}`)
      await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 1000))
    }
  }
}

function lastOutputLine(text) {
  return (
    stripVTControlCharacters(text || '')
      .trim()
      .split(/\r?\n/)
      .filter(Boolean)
      .at(-1) || ''
  )
}

function assertCommandOk(result, label) {
  if (result.exitCode !== 0) {
    const reason = lastOutputLine(result.stderr) || lastOutputLine(result.stdout) || '无输出'
    const proxy =
      process.env.HTTPS_PROXY ||
      process.env.https_proxy ||
      process.env.HTTP_PROXY ||
      process.env.http_proxy
    throw new Error(
      `${label}失败：${reason}${proxy ? '（已配置 HTTP(S)_PROXY，请检查代理可用性）' : ''}`,
    )
  }
}

async function assertReachable(url, label) {
  await withRetry(
    3,
    async () => {
      const response = await fetch(url, { signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) })
      await response.body?.cancel()
      if (!response.ok) {
        throw new Error(`${label} 返回 HTTP ${response.status}`)
      }
    },
    `${label} 检查`,
  )
}

/** 提取混合日志里的 JSON，同时忽略字符串中的括号与转义字符。 */
function parseJsonCandidates(...texts) {
  const results = []
  for (const output of texts) {
    const text = stripVTControlCharacters(output || '').trim()
    try {
      results.push(JSON.parse(text))
      continue
    } catch {
      // EAS 有时将进度日志混入 JSON 输出，需要逐个尝试完整片段。
    }
    for (let start = text.length - 1; start >= 0; start -= 1) {
      if (text[start] !== '[' && text[start] !== '{') {
        continue
      }
      let depth = 0
      let inString = false
      let escaped = false
      for (let index = start; index < text.length; index += 1) {
        const char = text[index]
        if (inString) {
          if (escaped) {
            escaped = false
          } else if (char === '\\') {
            escaped = true
          } else if (char === '"') {
            inString = false
          }
          continue
        }
        if (char === '"') {
          inString = true
        } else if (char === '[' || char === '{') {
          depth += 1
        } else if (char === ']' || char === '}') {
          depth -= 1
          if (depth === 0) {
            try {
              results.push(JSON.parse(text.slice(start, index + 1)))
            } catch {
              // 普通日志也可能含括号，跳过不合法的片段。
            }
            break
          }
        }
      }
    }
  }
  return results
}

function buildsFromOutput(...texts) {
  return parseJsonCandidates(...texts)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter(
      (value) =>
        value &&
        typeof value === 'object' &&
        typeof value.id === 'string' &&
        typeof value.status === 'string',
    )
}

async function appJsonAtCommit(commit) {
  const result = await $`git show ${`${commit}:app/app.json`}`
  return JSON.parse(result.stdout)
}

function isVersionOnlyChange(original, updated, version) {
  return (
    updated.expo?.version === version &&
    isDeepStrictEqual(original, {
      ...updated,
      expo: { ...updated.expo, version: original.expo?.version },
    })
  )
}

async function dirtyPaths() {
  const result = await $`git status --porcelain=v1 -z`
  const entries = result.stdout.split('\0').filter(Boolean)
  const paths = []
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]
    paths.push(entry.slice(3))
    if (/[RC]/.test(entry.slice(0, 2))) {
      paths.push(entries[++index])
    }
  }
  return paths
}

async function checkEnvironment(state) {
  await spinner('检查环境...', async () => {
    const branch = (await $`git rev-parse --abbrev-ref HEAD`).stdout.trim()
    if (branch !== MAIN_BRANCH) {
      throw new Error(`当前分支为 ${branch}，请切到 ${MAIN_BRANCH} 发版`)
    }
    const paths = await dirtyPaths()
    if (paths.length > 0) {
      const allowed =
        state &&
        paths.every((path) => path === 'app/app.json') &&
        isVersionOnlyChange(await appJsonAtCommit('HEAD'), readAppJson(), state.version)
      if (!allowed) {
        throw new Error(`工作区存在非本次发布的改动，请先提交或撤销：\n${paths.join('\n')}`)
      }
      log.warn('检测到上次中断留下的版本修改，将继续提交')
    }
    const easJson = JSON.parse(readFileSync(EAS_JSON_PATH, 'utf8'))
    if (easJson.cli?.appVersionSource !== 'local') {
      throw new Error('eas.json 的 cli.appVersionSource 必须为 local')
    }
    await $`git fetch origin --tags`
    const upstream = (await $`git rev-parse --abbrev-ref ${'@{upstream}'}`).stdout.trim()
    if (upstream !== `origin/${MAIN_BRANCH}`) {
      throw new Error(`main 必须跟踪 origin/main（当前为 ${upstream}）`)
    }
    const behind = Number((await $`git rev-list --count HEAD..origin/main`).stdout.trim())
    if (behind > 0) {
      throw new Error('本地 main 落后于远端或已经分叉，请先同步 origin/main')
    }
    await assertReachable('https://github.com', 'GitHub')
    await assertReachable('https://api.expo.dev', 'Expo API')
    await withRetry(
      2,
      async () => {
        assertCommandOk(await nothrow`npx --yes eas-cli@latest --version`, 'EAS CLI')
      },
      'EAS CLI 检查',
    )
    await withRetry(
      3,
      async () => {
        const user = await nothrow`npx --yes eas-cli@latest whoami`
        assertCommandOk(user, 'EAS 登录检查')
        if (!user.stdout.trim()) {
          throw new Error('EAS 未登录，请执行 npx eas-cli@latest login')
        }
      },
      'EAS 登录检查',
    )
  })
  log.success('环境检查通过')
}

async function ensureCommitPushed(commit) {
  const result = await nothrow`git merge-base --is-ancestor ${commit} origin/main`
  if (result.exitCode === 1) {
    await withRetry(3, () => $`git push origin ${MAIN_BRANCH}`, '版本提交推送')
  } else {
    assertCommandOk(result, '远端提交检查')
  }
}

async function ensureVersionCommitted(state) {
  if (!state.bumpCommit) {
    const head = (await $`git rev-parse HEAD`).stdout.trim()
    const original = await appJsonAtCommit(state.baseCommit)
    // commit 已成功但进度尚未落盘时，只复用本次版本提交，不认其他同版本提交。
    if (head !== state.baseCommit) {
      const parent = (await $`git rev-parse HEAD^`).stdout.trim()
      const changed = (await $`git diff --name-only ${state.baseCommit} HEAD`).stdout.trim()
      if (
        parent !== state.baseCommit ||
        changed !== 'app/app.json' ||
        !isVersionOnlyChange(original, await appJsonAtCommit('HEAD'), state.version)
      ) {
        throw new Error('HEAD 已偏离发布起点，请确认发布提交后再续跑')
      }
      state.bumpCommit = head
      saveState(state)
    } else {
      const appJson = readAppJson()
      appJson.expo.version = state.version
      if (!isVersionOnlyChange(original, appJson, state.version)) {
        throw new Error('app.json 存在版本以外的改动，拒绝提交')
      }
      writeFileSync(APP_JSON_PATH, `${JSON.stringify(appJson, null, 2)}\n`)
      await $`git add app.json`
      await $`git commit -m ${`chore(release): v${state.version}`}`
      state.bumpCommit = (await $`git rev-parse HEAD`).stdout.trim()
      saveState(state)
    }
  }
  const committed = await appJsonAtCommit(state.bumpCommit)
  if (committed.expo?.version !== state.version || readAppJson().expo?.version !== state.version) {
    throw new Error('发布提交或当前 app.json 的版本与发布记录不一致')
  }
  assertCommandOk(
    await nothrow`git merge-base --is-ancestor ${state.bumpCommit} HEAD`,
    '发布提交检查',
  )
  if ((await dirtyPaths()).length > 0) {
    throw new Error('发布提交完成后工作区仍有改动，拒绝继续构建')
  }
  await ensureCommitPushed(state.bumpCommit)
  log.success(`版本已提交并推送：${state.bumpCommit}`)
}

function matchesBuild(build, state, projectId) {
  return (
    build.app?.id === projectId &&
    build.platform === 'ANDROID' &&
    build.buildProfile === 'production' &&
    build.appVersion === state.version &&
    build.gitCommitHash === state.bumpCommit
  )
}

function recordBuild(state, build) {
  state.buildId = build.id
  state.buildStatus = build.status
  state.buildUrl = `${BUILDS_PAGE_URL}/${build.id}`
  saveState(state)
}

function assertFinishedBuild(state, build) {
  if (build.status !== 'FINISHED') {
    throw new Error(
      `EAS 构建状态为 ${build.status}，暂不发起其他构建；请查看 ${state.buildUrl} 后续跑`,
    )
  }
  return build
}

async function ensureBuild(state, projectId, explicitBuildId) {
  if (state.buildId) {
    const result = await withRetry(
      3,
      async () => {
        const details = await nothrow`npx --yes eas-cli@latest build:view ${state.buildId} --json`
        assertCommandOk(details, '构建查询')
        return details
      },
      '构建查询',
    )
    const existing = buildsFromOutput(result.stdout, result.stderr).find(
      (build) => build.id === state.buildId,
    )
    if (!existing || !matchesBuild(existing, state, projectId)) {
      throw new Error('指定或记录的构建与项目、production 配置、版本或发布提交不一致')
    }
    recordBuild(state, existing)
    if (!['ERRORED', 'CANCELED'].includes(existing.status) || explicitBuildId) {
      return assertFinishedBuild(state, existing)
    }
    log.warn(`上次构建已${existing.status === 'CANCELED' ? '取消' : '失败'}，将查找或重新构建`)
    state.buildId = null
    state.buildStatus = null
    state.buildUrl = null
    saveState(state)
  }

  const listed = await withRetry(
    3,
    async () => {
      const result =
        await nothrow`npx --yes eas-cli@latest build:list --platform android --build-profile production --limit 10 --json --non-interactive`
      assertCommandOk(result, '构建列表查询')
      // 空数组也是有效列表；输出损坏时不能把“查不到”当成“没有构建”。
      if (!parseJsonCandidates(result.stdout, result.stderr).some(Array.isArray)) {
        throw new Error('无法解析构建列表，请检查 EAS 输出后续跑')
      }
      return result
    },
    '构建列表查询',
  )
  const candidates = buildsFromOutput(listed.stdout, listed.stderr).filter((build) =>
    matchesBuild(build, state, projectId),
  )
  const reused =
    candidates.find((build) => build.status === 'FINISHED') ||
    candidates.find((build) => !['ERRORED', 'CANCELED'].includes(build.status))
  if (reused) {
    recordBuild(state, reused)
    log.info(`复用构建：${state.buildUrl}`)
    return assertFinishedBuild(state, reused)
  }

  const head = (await $`git rev-parse HEAD`).stdout.trim()
  if (head !== state.bumpCommit) {
    throw new Error('HEAD 已不在发布提交上，不能为该发布重新构建；请使用对应构建或 --apk')
  }
  log.info('开始 EAS production 构建，这一步可能需要十几分钟')
  // 构建请求不自动重试，网络中断时可能已经在云端创建构建。
  const result = await spinner(
    'EAS 构建中...',
    () =>
      nothrow`npx --yes eas-cli@latest build --platform android --profile production --message ${state.changelog} --json --non-interactive --wait`,
  )
  const build = buildsFromOutput(result.stdout, result.stderr).find((candidate) =>
    matchesBuild(candidate, state, projectId),
  )
  if (!build) {
    throw new Error(
      `无法取得匹配本次发布的构建结果：${lastOutputLine(result.stderr) || lastOutputLine(result.stdout)}；请续跑查询或使用 --build-id`,
    )
  }
  recordBuild(state, build)
  // 即使 CLI 退出非零也保留已创建的构建 ID，但本轮仍报告命令失败。
  assertCommandOk(result, 'EAS 构建')
  return assertFinishedBuild(state, build)
}

function isNonemptyFile(path) {
  if (!path || !existsSync(path)) {
    return false
  }
  const stats = statSync(path)
  return stats.isFile() && stats.size > 0
}

function assignProvidedApk(state, path) {
  const source = resolve(path)
  if (!isNonemptyFile(source)) {
    throw new Error('--apk 必须指向存在且非空的普通文件')
  }
  const target = join(APK_DIR, `hotsou-${state.version}.apk`)
  mkdirSync(APK_DIR, { recursive: true })
  if (source !== target) {
    copyFileSync(source, `${target}.part`)
    renameSync(`${target}.part`, target)
  }
  state.apkPath = target
  saveState(state)
  log.warn(`使用提供的 APK，请确认文件对应 v${state.version}：${source}`)
}

async function ensureApkReady(state, projectId, explicitBuildId) {
  // 显式指定构建时，即便有缓存附件也必须先验证这个构建。
  const providedBuild = explicitBuildId ? await ensureBuild(state, projectId, true) : null
  if (isNonemptyFile(state.apkPath)) {
    log.success(`复用 APK：${state.apkPath}`)
    return state.apkPath
  }
  if (state.apkPath) {
    log.warn('记录的 APK 缺失或为空，将重新下载')
    state.apkPath = null
    saveState(state)
  }
  const build = providedBuild || (await ensureBuild(state, projectId, false))
  const apkUrl = build.artifacts?.buildUrl
  if (typeof apkUrl !== 'string' || !apkUrl) {
    throw new Error('构建结果缺少 artifacts.buildUrl，无法下载 APK')
  }
  const apkPath = join(APK_DIR, `hotsou-${state.version}.apk`)
  const tempPath = `${apkPath}.part`
  mkdirSync(APK_DIR, { recursive: true })
  await spinner('下载 APK...', () =>
    withRetry(
      3,
      async () => {
        rmSync(tempPath, { force: true })
        try {
          const response = await fetch(apkUrl, { signal: AbortSignal.timeout(APK_TIMEOUT_MS) })
          if (!response.ok || !response.body) {
            await response.body?.cancel()
            throw new Error(`APK 下载失败：HTTP ${response.status}`)
          }
          await pipeline(Readable.fromWeb(response.body), createWriteStream(tempPath))
          if (!isNonemptyFile(tempPath)) {
            throw new Error('下载的 APK 为空')
          }
          renameSync(tempPath, apkPath)
        } catch (error) {
          rmSync(tempPath, { force: true })
          throw error
        }
      },
      'APK 下载',
    ),
  )
  state.apkPath = apkPath
  saveState(state)
  log.success(`APK 已保存：${apkPath}（${(statSync(apkPath).size / 1024 ** 2).toFixed(1)} MB）`)
  return apkPath
}

async function ensureTagPushed(state) {
  const tagName = `v${state.version}`
  const existing = (await $`git tag --list ${tagName}`).stdout.trim()
  if (existing) {
    const target = (await $`git rev-list -n 1 ${tagName}`).stdout.trim()
    if (target !== state.bumpCommit) {
      throw new Error(`tag ${tagName} 指向 ${target}，与发布提交 ${state.bumpCommit} 不一致`)
    }
  } else {
    await $`git tag -a ${tagName} -m ${state.changelog} ${state.bumpCommit}`
  }
  const remote =
    await $`git ls-remote --tags origin ${`refs/tags/${tagName}`} ${`refs/tags/${tagName}^{}`}`
  const targets = remote.stdout.trim().split(/\r?\n/).filter(Boolean)
  const target = targets.find((line) => line.endsWith('^{}')) || targets[0]
  if (target && target.split(/\s+/)[0] !== state.bumpCommit) {
    throw new Error(`远端 tag ${tagName} 与发布提交不一致，拒绝覆盖`)
  }
  if (!target) {
    await withRetry(3, () => $`git push origin ${tagName}`, 'tag 推送')
  }
  state.tagPushed = true
  saveState(state)
  log.success(`tag 已推送：${tagName}`)
}

async function openGitHubRelease(state, apkPath) {
  const url = new URL(`${REPO_URL}/releases/new`)
  url.searchParams.set('tag', `v${state.version}`)
  url.searchParams.set('title', `v${state.version}`)
  url.searchParams.set(
    'body',
    state.changelog
      .split('  ')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `- ${line}`)
      .join('\n'),
  )
  await open(url.toString())
  state.releaseOpened = true
  saveState(state)
  log.success('已打开 GitHub Release 页面')
  log.info(`请上传附件：${apkPath}`)
  log.info(
    '保持附件名 hotsou-<版本>.apk，点击 Publish release 发布正式版本（不要选草稿或 pre-release）',
  )
}

async function main() {
  const options = parseArgs(scriptArgs)
  if (options.help) {
    printUsage()
    return
  }
  if (options.reset) {
    clearState()
    return
  }
  let state = loadState()
  if (options.resume) {
    if (!state) {
      throw new Error('没有可续跑的发布记录')
    }
    activeState = state
    if (
      (options.version && options.version !== state.version) ||
      (options.changelog && options.changelog !== state.changelog)
    ) {
      throw new Error('--version 或 --changelog 与发布记录不一致，请使用原记录续跑或 --reset')
    }
  } else if (state) {
    if (!state.tagPushed || !state.releaseOpened) {
      activeState = state
      throw new Error(`存在未完成发布 v${state.version}，请 --resume 或 --reset`)
    }
    clearState()
    state = null
  }
  if (options.apk && !isNonemptyFile(resolve(options.apk))) {
    throw new Error('--apk 必须指向存在且非空的普通文件')
  }
  await checkEnvironment(state)
  const appJson = readAppJson()
  const projectId = appJson.expo?.extra?.eas?.projectId
  if (typeof projectId !== 'string' || !projectId) {
    throw new Error('app.json 缺少 expo.extra.eas.projectId')
  }
  if (!state) {
    const currentVersion = VersionSchema.parse(appJson.expo?.version)
    const version = options.version || (await question(`版本号（${currentVersion} -> ?）：`)).trim()
    if (!VersionSchema.safeParse(version).success || !semver.gt(version, currentVersion)) {
      throw new Error(`版本号必须是大于 ${currentVersion} 的 x.y.z 三段纯数字 semver`)
    }
    const changelog = options.changelog || (await question('更新日志（双空格分隔）：')).trim()
    if (!changelog) {
      throw new Error('更新日志不能为空')
    }
    if ((await $`git tag --list ${`v${version}`}`).stdout.trim()) {
      throw new Error(`tag v${version} 已存在，请换版本或续跑原发布`)
    }
    state = {
      version,
      changelog,
      baseCommit: (await $`git rev-parse HEAD`).stdout.trim(),
      bumpCommit: null,
      buildId: null,
      buildStatus: null,
      buildUrl: null,
      apkPath: null,
      tagPushed: false,
      releaseOpened: false,
      updatedAt: '',
    }
    saveState(state)
  }
  if (options['build-id']) {
    if (state.buildId !== options['build-id']) {
      // 换构建时不能沿用原构建的附件和已打开页面状态。
      state.apkPath = null
      state.releaseOpened = false
    }
    state.buildId = options['build-id']
    state.buildStatus = null
    state.buildUrl = null
    saveState(state)
  }
  await ensureVersionCommitted(state)
  if (options.apk) {
    assignProvidedApk(state, options.apk)
  }
  const apkPath = await ensureApkReady(state, projectId, Boolean(options['build-id']))
  await ensureTagPushed(state)
  await openGitHubRelease(state, apkPath)
  log.success(`发布流程完成：v${state.version}（请在 GitHub 完成正式发布）`)
}

process.on('SIGINT', () => {
  log.warn('已中断')
  if (activeState) {
    printResumeInstructions(activeState)
  }
  process.exit(130)
})

try {
  await main()
} catch (error) {
  log.error(errorMessage(error))
  if (activeState) {
    printResumeInstructions(activeState)
  }
  process.exitCode = 1
}
