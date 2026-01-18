# Hotsou Store 智能体指南 (Agent Guidelines)

本文档为在 Hotsou Store 代码库工作的 AI 智能体提供指令和上下文。

## 1. 项目概览

- **平台**: Cloudflare Workers
- **框架**: [Hono](https://hono.dev/)
- **OpenAPI 集成**: [Chanfana](https://github.com/cloudflare/chanfana) (原 `zod-openapi`)
- **语言**: TypeScript
- **包管理器**: npm

## 2. 构建与开发指令

由于本项目是一个 Cloudflare Worker 项目，主要使用 `wrangler` 进行开发和部署。

| 指令                 | 描述                                                    |
| -------------------- | ------------------------------------------------------- |
| `npm run dev`        | 启动本地开发服务器 (wrangler)                           |
| `npm start`          | `npm run dev` 的别名                                    |
| `npm run deploy`     | 将 Worker 部署到 Cloudflare                             |
| `npm run cf-typegen` | 为 Cloudflare Worker bindings (环境变量等) 生成类型定义 |

> **注意**: `package.json` 中目前没有配置测试运行器 (如 Jest 或 Vitest)。如果用户要求运行测试，请先检查是否已安装相关依赖。推荐在 Cloudflare Workers 环境中使用 `vitest`。

## 3. 代码风格与规范

在读取或修改代码时，请严格遵守以下风格：

### 格式化 (Formatting)

- **缩进**: 必须使用 **Tab (制表符)**，不要使用空格。
- **引号**: 字符串和导入路径使用 **双引号** (`"`).
- **分号**: 语句末尾必须加分号。
- **文件结尾**: 确保文件以换行符结尾。
- **导入顺序**: 保持整洁，标准库/第三方库在前，本地模块在后。

### 命名规范 (Naming Conventions)

- **文件名**: 使用 `camelCase` (驼峰命名)，例如 `src/endpoints/taskList.ts`。
- **类名**: 使用 `PascalCase` (帕斯卡命名)，例如 `TaskList`, `TaskCreate`。
- **变量/函数**: 使用 `camelCase`。
- **接口/类型**: 使用 `PascalCase`。
- **路由参数**: 使用冒号前缀，例如 `/api/tasks/:taskSlug`。

### 项目结构

- `src/index.ts`: 入口文件。初始化 Hono 应用并注册 OpenAPI 路由。
- `src/endpoints/`: 包含端点类。每个端点一个文件 (单文件单类)。
- `src/types.ts`: 共享的类型定义。
- `worker-configuration.d.ts`: 环境变量 (Bindings) 的类型定义。

## 4. 端点实现模式 (Chanfana)

本项目使用 `chanfana` 库来定义 OpenAPI 规范和处理请求。所有端点都应实现为继承自 `OpenAPIRoute` 的类。

**实现模版:**

```typescript
import { Bool, Num, OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { type AppContext } from '../types'

export class TaskList extends OpenAPIRoute {
  // 1. 定义 OpenAPI Schema (使用 Zod)
  schema = {
    tags: ['Tasks'],
    summary: '获取任务列表',
    request: {
      query: z.object({
        page: Num({
          description: '页码',
          default: 0,
        }),
        isCompleted: Bool({
          description: '是否已完成',
          required: false,
        }),
      }),
    },
    responses: {
      '200': {
        description: '成功返回任务列表',
        content: {
          'application/json': {
            schema: z.object({
              success: Bool(),
              tasks: z.array(
                z.object({
                  name: z.string(),
                  slug: z.string(),
                  // ... 其他字段
                }),
              ),
            }),
          },
        },
      },
    },
  }

  // 2. 处理请求
  async handle(c: AppContext) {
    // 获取经过验证的数据 (类型安全)
    const data = await this.getValidatedData<typeof this.schema>()

    // 访问查询参数
    const { page, isCompleted } = data.query

    // 访问环境变量 (如果在 worker-configuration.d.ts 中定义了)
    // const db = c.env.DB;

    // 业务逻辑...

    // 返回 JSON 响应
    return {
      success: true,
      tasks: [
        // ...
      ],
    }
  }
}
```

### 关键点:

1.  **Schema 定义**: 在 `schema` 属性中详细定义 request (params, query, body) 和 responses。
2.  **类型安全**: 使用 `this.getValidatedData<typeof this.schema>()` 获取类型安全的请求数据。
3.  **上下文**: `handle` 方法接收 `c` (Context)，其中包含 `c.env` (Bindings) 和 `c.executionCtx`。

## 5. TypeScript 配置注意事项

尽管 `tsconfig.json` 中设置了 `"strict": true`，但请注意以下特定覆盖配置：

- `"noImplicitAny": false`: 允许隐式 `any` 类型。虽然允许，但在编写新代码时尽量避免。
- `"strictNullChecks": false`: 关闭了严格的空值检查。这通过意味着变量可能为 `null` 或 `undefined` 而不会报错，编写代码时需格外小心空指针异常。

## 6. 错误处理

- **验证错误**: `chanfana` 会自动处理不符合 Schema 的请求，并返回 400 错误。
- **应用错误**:
  - 使用 Hono 的 `c.json({ error: "message" }, status)` 返回错误响应。
  - 对于未捕获的异常，Hono 通常会返回 500。
  - 如果需要全局错误处理，请检查 `src/index.ts` 是否配置了 `app.onError`。

## 7. 依赖管理

- **添加依赖**: 在添加新库之前，请务必检查 `package.json`。
- **Zod**: 项目通过 `chanfana` 深度集成 `zod`，请优先使用 `zod` 进行所有数据验证。
- **Cloudflare 特有**: 注意使用的是 `worker-configuration.d.ts` 而不是 `.env` 文件来定义类型。

## 8. AI 助手特定规则

- **不要修改不相关的文件**: 仅修改完成任务所必需的文件。
- **保持风格一致**: 如果修改现有文件，必须模仿该文件现有的缩进（Tab）和编码风格。
- **完整性**: 创建新端点时，记得在 `src/index.ts` 中注册该端点。
- **路径引用**: 使用绝对路径或相对于项目根目录的路径进行文件操作。

---

_此文件由 AI 生成，用于指导后续的 AI 开发工作。_
