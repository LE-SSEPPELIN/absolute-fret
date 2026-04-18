# 🎸 Absolute Fret 项目状态同步 & 底层逻辑彻底贯通指令

## 一、 项目现状 (上下文同步)
你好！由于开发环境迁移，你需要接手本项目的后续开发。
我们当前的代码库处于“阶段六：配置面板 (ConfigPanel)”的 UI 骨架完成阶段，采用了高保真的左右双区布局。
**🚨 核心警告：目前的 UI 布局（Flex、响应式设计、Grid排列等）非常完美，绝对禁止修改任何现有 CSS 布局骨架！**

你本次的核心任务是：**彻底打通 UI 配置到游戏底层的数据流，处理指板的视觉联动，并修复几处交互细节与潜在的死锁 Bug。**

## 二、 你的核心修复任务
请仔细读取 `src/App.tsx`, `src/hooks/useGameLogic.ts`, `src/components/ui/ConfigPanel.tsx`，以及指板渲染相关的 `Fretboard.tsx`, `String.tsx`, `Fret.tsx`。执行以下五项精确修改：

### 1. 全局文案与基础 UI 优化
- **全局文案：** 将项目中所有的“特训”改为“练习”（例如“音程练习”、“四/五度圈练习”）。

### 2. 修正单选逻辑与初始默认值 (`ConfigPanel.tsx`)
- 当 `mode === 'circle'` (四/五度圈) 时，右侧专属选项（四度圈/五度圈）必须是**单选逻辑（Radio）**。
- **初始防呆修复：** 初始默认状态下，`subOptions` 数组中必须**只保留“四度圈”对应的那一个 ID**（如 `['P4']`），绝对不能默认全选亮起两个。

### 3. 彻底打通出题过滤逻辑 (`useGameLogic.ts`)
重构题目生成逻辑（`generateQuestion`），使其严格受控于用户的 `config`：
- **过滤弦：** 生成的正确答案坐标（`validAnswers`）必须**仅限**于 `config.strings` 数组中被选中的弦。
- **过滤题库 (`circle` 模式)：** 必须读取 `config.subOptions`，严格按用户选中的单向度（四度或五度）排布题目。
- **过滤题库 (`interval` 模式)：** 随机生成的音程，必须是包含在用户 `config.subOptions` 数组中的合法音程，不能越界随机。

### 4. 修复致命的“防死锁”机制 (`useGameLogic.ts`)
为了防止用户狂点导致无限 Combo，请重构 `handleFretClick` 函数：
- **第一步绝对拦截：** 函数顶部必须是 `if (isTransitioning) return;`
- **答对流转流：** 验证通过后，先结算 `score` 和 `combo`，然后立即 `setIsTransitioning(true)`。
- **定时器切题：** 挂载 `setTimeout`（400ms），在 400ms 后调用 `nextQuestion()` 切题，并将 `setIsTransitioning(false)` 恢复。

### 5. 指板高保真视觉联动 (`App`, `Fretboard`, `String`, `Fret`)
- **数据传递：** 在 `App.tsx` 中，将当前的 `config.strings` 作为 prop 传递给 `<Fretboard activeStrings={config.strings} />`。
- **动态副标题：** `QuestionDisplay` 的副标题必须根据当前 `config` 动态生成（例如，精确显示“四度圈”或“五度圈”等），而非笼统显示，音程模块副标题显示“音程练习”。
- **视觉暗化 (`String.tsx`)：** 如果某根弦的 `stringIndex` 不在 `activeStrings` 中，请降低该整根琴弦的透明度（例如加上 `opacity-20`）。注意，是整根弦一起变暗，不是只有一个品格的按钮变暗。
- **交互禁用 (`Fret.tsx`)：** 如果该品格所属的弦不在 `activeStrings` 中：必须彻底禁用点击事件（移除 onClick 或 return），并取消其 `cursor-pointer` 样式。

## 三、 行动指令
请仔细消化上述要求，并直接修改这几个文件的代码。
重申：**在实现逻辑的基础上，保持我对代码的审美洁癖，不要乱动原有的纯视觉 CSS！**