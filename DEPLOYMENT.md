# Cloudflare Workers 部署

目标服务：`absolute-fret`，GitHub 仓库：`LE-SSEPPELIN/absolute-fret`。
项目是 React + Vite 静态应用，无需后端服务或环境变量。

在 Cloudflare 控制台打开该 Worker 的 **Settings > Build**：

| 设置 | 值 |
| --- | --- |
| Production branch | `main` |
| Root directory | 仓库根目录 |
| Build command | `npm run build` |
| Deploy command | `npx wrangler@4 deploy` |

`wrangler.jsonc` 将 `dist` 作为静态资源目录，并配置 SPA 回退。
`.node-version` 指定 Node.js 24.14.1。

将代码（包括 `public/samples`）提交并推送至 `main` 后，Cloudflare 自动构建和部署。
修改控制台构建设置后，需要重试构建或推送新提交才会生效。

本地验证：

```powershell
npm ci
npm run build
npm run preview
```

如需从本地直接部署，在可联网的终端运行：

```powershell
npx wrangler@4 login
npm run build
npx wrangler@4 deploy
```

上线后，从 Cloudflare 控制台获取实际的 workers.dev 地址，验证首页可打开、
`/samples/guitar_E2.mp3` 可访问，并在点击开始后确认训练音效正常。

官方配置说明：https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
