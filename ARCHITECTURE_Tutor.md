# ARCHITECTURE Tutor：Absolute Fret 架构逆向说明

> 目标读者：正在从“写功能”转向“看系统边界”的同学。
> 扫描范围：`src/` 下业务代码（不含 `node_modules`、`dist`）。

## 1. 核心数据字典 (The State)

下面这些是系统真正驱动行为的状态。

### A. 应用级页面状态（`src/App.tsx`）

1. `practiceMode: "circle" | "interval" | null`
- 数据结构：联合类型（本质上是字符串/空值）
- 作用：决定当前在大厅、配置页还是练习页。

2. `selectedModeForConfig: "circle" | "interval" | null`
- 数据结构：联合类型
- 作用：从大厅点进哪个模式的配置页。

3. `activeConfig: GameConfig | null`
- 数据结构：对象或空值
- 结构：
  - `strings: number[]`（启用哪些弦）
  - `modeLength: number | "endless"`（局长）
  - `subOptions: string[]`（子模式，如 `P4/P5` 或音程集合）
- 作用：练习会话的配置快照。

### B. 一局练习核心状态（`src/hooks/useGameLogic.ts`）

1. `score: number`
- 数据结构：数字
- 作用：累计答对数。

2. `combo: number`
- 数据结构：数字
- 作用：连对计数，答错归零。

3. `isTransitioning: boolean`
- 数据结构：布尔值
- 作用：答对后短暂过渡，防止重复点击。

4. `targetNote: string`
- 数据结构：字符串（音名）
- 作用：当前题目的标准答案音高类别（只比音名，不比八度）。

5. `questionText: string`
- 数据结构：字符串
- 作用：题干显示文本（如目标音或“根音 + 音程”）。

6. `questionFeedback: "idle" | "correct" | "wrong"`
- 数据结构：联合字符串
- 作用：驱动题面颜色反馈。

7. `activeFeedbackCell: { stringIndex: number; fretIndex: number; state: "correct" | "wrong" } | null`
- 数据结构：对象或空值
- 作用：记录最近一次需要高亮的格子（绿/红）。

8. `hintAnswers: BoardPosition[]`
- 数据结构：对象数组（`{ stringIndex, fretIndex }`）
- 作用：连续错误达到阈值后显示所有正确位置。

### C. 非渲染但关键的“逻辑记忆”（Ref 状态）

1. `circleIndexRef: number`
- 作用：四/五度圈题库当前指针。

2. `wrongCountRef: number`
- 作用：当前题累计错误次数（>=3 开提示）。

3. `currentQuestionRef: QuestionPayload | null`
- 结构：`{ targetNote, questionText, validAnswers }`
- 作用：当前题真值来源，点击判定直接读它。

4. `clearFeedbackTimerRef` / `transitionTimerRef`
- 作用：管理延时清空反馈和切下一题。

### D. 静态规则数据（准“数据层”）

1. `CHROMATIC_SCALE`（十二平均律音名表）
- 数据结构：只读字符串数组
- 文件：`src/utils/constants.ts`

2. `currentTuning`（标准吉他调弦）
- 数据结构：只读对象数组（`note + octave`）
- 文件：`src/utils/constants.ts`

3. `FRET_WIDTH_RATIOS`（各品宽度比例）
- 数据结构：只读数字数组
- 文件：`src/utils/constants.ts`

4. 四度圈/五度圈、音程配置
- 数据结构：字符串数组 / 对象数组
- 文件：`src/hooks/useGameLogic.ts`（当前实现将题库规则写在逻辑层）

---

## 2. 模块边界划分 (MVC 变体)

这里不是教科书 MVC，而是“强行分层”来帮你建立边界感。

### View（视图层）

这些文件主要负责“展示 + 交互采集”，不应该决定业务正确性：

- `src/components/fretboard/Fretboard.tsx`
- `src/components/fretboard/Fret.tsx`
- `src/components/fretboard/String.tsx`
- `src/components/fretboard/FretMarker.tsx`
- `src/components/ui/QuestionDisplay.tsx`
- `src/components/ui/Lobby.tsx`
- `src/components/ui/ConfigPanel.tsx`
- `src/App.tsx`（页面路由式条件渲染、组合各组件）
- `src/main.tsx`

### Logic（逻辑层）

这些代码负责“出题、判题、计分、状态推进”：

- `src/hooks/useGameLogic.ts`
  - 题目构建：`buildCircleQuestion`、`buildIntervalQuestion`
  - 合法答案生成：`buildValidAnswers`
  - 点击判定主流程：`handleFretClick`
  - 状态推进：`applyQuestion`、`pushNextQuestion`

- `src/hooks/useAudio.ts`（偏应用逻辑的副作用层）
  - 触发音频：`playNote`
  - 生命周期清理：卸载时 `disposeToneEngine`

### Data（数据层）

这些代码负责“静态规则 + 可复用纯计算”：

- `src/utils/constants.ts`
  - 调弦、音阶、指板几何常量

- `src/utils/musicTheory.ts`
  - 音高换算：`getNoteAtFret`
  - 品位标记规则：`getFretMarkers`

- `src/lib/tone-engine.ts`（可视为基础设施数据/引擎层）
  - 音色链路初始化与播放（对上层提供黑盒 API）

### 严格指出：是否有“视图层越权处理逻辑”？

有，主要是**轻度越权**，不是致命问题：

1. `src/components/ui/ConfigPanel.tsx`
- 越权点：`isValid`、`toggleString`、`toggleSubOption` 包含了“配置规则决策”。
- 影响：配置合法性规则散落在 UI，未来如果有多个入口（比如移动端原生页）会重复。

2. `src/components/fretboard/Fret.tsx`
- 越权点：在 `onClick` 里再次判断 `isStringActive`；并在组件内组合 `glowState`（correct/wrong/hint）。
- 影响：存在“显示规则 + 交互规则”耦合。虽然现在可接受，但会让 View 逐渐变厚。

结论：当前项目主判题逻辑仍集中在 `useGameLogic`，边界总体健康，但配置规则有下沉到 View 的趋势。

---

## 3. 核心交互的数据流 (Data Flow)

场景：用户点击“5 弦 3 品（C 音）”。

> 约定：本项目里 `stringIndex=4` 对应 5 弦（A2），`fretIndex=3` 得到 C3。

```mermaid
flowchart TD
  A[用户点击 Fret 按钮<br/>stringIndex=4 fretIndex=3] --> B[Fret.tsx onClick]
  B --> C[Fretboard props onFretClick]
  C --> D[useGameLogic.handleFretClick]
  D --> E[getNoteAtFret(4,3) -> note C]
  E --> F[useAudio.playNote -> tone-engine 播放声音]
  F --> G{C == currentQuestionRef.targetNote?}
  G -- 是 --> H[score+1 combo+1<br/>questionFeedback=correct<br/>activeFeedbackCell=绿色]
  H --> I[isTransitioning=true]
  I --> J[400ms 后 pushNextQuestion]
  J --> K[applyQuestion 重置反馈/提示<br/>更新 targetNote 与 questionText]
  K --> L[React 重渲染题面/分数/指板]
  G -- 否 --> M[wrongCount+1 combo=0<br/>questionFeedback=wrong<br/>activeFeedbackCell=红色]
  M --> N{wrongCount>=3?}
  N -- 是 --> O[hintAnswers=validAnswers]
  N -- 否 --> P[不显示提示]
  O --> Q[140ms 后清理局部反馈]
  P --> Q
  Q --> L
```

一句话总结这个闭环：
- View 只上报“点了哪一格”。
- Logic 把格子换算成音名，再与 `targetNote` 比较，更新分数/反馈/提示。
- 状态变化触发 React 重渲染，View 被动展示新状态。

---

## 4. 黑盒隔离区 (Blackbox Zones)

下面这些细节你现阶段可以“会用就行，不必深究内部实现”。

1. 音频引擎黑盒（先当 SDK）
- `ensureToneEngine`
- `playGuitarNote`
- `disposeToneEngine`
- 文件：`src/lib/tone-engine.ts`

2. 音频 Hook 封装黑盒（副作用管理）
- `useAudio`
- 文件：`src/hooks/useAudio.ts`

3. 指板视觉细节黑盒（CSS/Tailwind 组合）
- `Fret` 里 `glowClass` 相关 class 组合
- `FretMarker` 双圆点/单圆点绘制
- 文件：`src/components/fretboard/Fret.tsx`、`src/components/fretboard/FretMarker.tsx`

4. 安全区适配黑盒（移动端刘海屏）
- `SafeAreaContainer`
- 文件：`src/components/layout/SafeAreaContainer.tsx`

5. 页面进入小动画黑盒
- `QuestionDisplay` 内 `requestAnimationFrame + visible` 过渡逻辑
- 文件：`src/components/ui/QuestionDisplay.tsx`

---

## 给你的架构导师建议（下一步）

如果你要继续向“架构思维”进阶，最值得做的是这两件事：

1. 把“配置合法性规则”从 `ConfigPanel` 提取到 `usePracticeConfig`（或 service）。
2. 把 `CIRCLE_OF_FOURTHS/CIRCLE_OF_FIFTHS/INTERVAL_OPTIONS` 从 `useGameLogic.ts` 下沉到 `utils` 或 `domain/rules`，让 Logic 只“消费规则”，不“定义规则”。

这样你会得到更清晰的层次：
- Data 定义规则
- Logic 推进状态
- View 只负责展示和上报事件
