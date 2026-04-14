第二步：模块拆解与文件树规划
基于 PRD 的高内聚低耦合原则，我规划的 React 组件树如下：
src
├── App.tsx                       # 母组件：全局状态聚合器（scorecomboisTransitioningmode）
├── components
│   ├── layout
│   │   ├── SafeAreaContainer.tsx # 移动端刘海灵动岛安全区包裹
│   │   └── ScreenLayout.tsx      # 14控制区 + 34指板区的网格布局
│   ├── fretboard
│   │   ├── Fretboard.tsx        # 14列品格的全局渲染器（核心）
│   │   ├── String.tsx           # 单根琴弦组件（React.memo 记忆化）
│   │   ├── Fret.tsx             # 品格交叉点组件（React.memo 记忆化）
│   │   └── FretMarker.tsx       # 357912品的品记圆点（纯视觉）
│   ├── ui
│   │   ├── Button.tsx            # 统一的可复用按钮组件
│   │   ├── ScoreBoard.tsx       # 计分板（Score + Combo）
│   │   └── QuestionDisplay.tsx  # 中央超大号题目文本
│   ├── modals
│   │   └── SettingsCard.tsx     # 大厅→练习的设置弹窗（纯UI）
│   └── navigation
│       └── ModeSelect.tsx       # 大厅入口（双模式按钮）
├── hooks
│   ├── useAudio.ts              # Tone.js 音频服务封装（单例模式）
│   └── useGameLogic.ts          # 题目生成 + 判定 + 状态流转
├── utils
│   ├── musicTheory.ts           # 纯函数：音名计算 + 模运算推导
│   └── constants.ts              # CHROMATIC_SCALE  currentTuning  fretWidths
├── lib
│   └── tone-engine.ts            # 音频引擎双轨策略封装
└── index.css                     # 全局深色模式 + 移动端抗性 CSS
---
第三步：阶梯式开发计划
我将整个开发过程拆解为 5 个独立可运行的里程碑：
阶段	里程碑	交付物	可测试性
阶段零	环境初始化	package.json + vite.config.ts + tailwind.config.js	运行 npm run dev 确认无报错
阶段一	底层母组件 + 安全区 + 全局 CSS	App.tsx + SafeAreaContainer + index.css（深色 + 触摸屏锁死）	页面纯黑背景 + 大厅双按钮可点击
阶段二	指板核心 + 纯函数算法	Fretboard + String + Fret + musicTheory.ts + constants.ts（含 fretWidths）	指板 0-13 品正确渲染，品格可点击
阶段三	音频引擎接入 + 发声机制	useAudio.ts + tone-engine.ts	点击任意品格触发 Tone.js PolySynth 发声
阶段四	题目逻辑 + 闯关反馈	useGameLogic.ts + QuestionDisplay + 状态流转（对错连击提示）	完整一局可运行：出题→点击判定→加分→切换
阶段五	设置弹窗 + 模式路由 + 打包优化	SettingsCard + ModeSelect + Build 验证	双模式可进入，配置参数可传参，打包后 npm run build 成功


一.首先回答你上述 5 个问题：[Pasted ~2 l关于问题 1 (音频资源)：
V1.0 完全抛弃真实音频采样文件，不需要任何 .mp3 占位符或 mock URL。请严格使用 Tone.js 内置的电子合成引擎（如 Tone.PolySynth 结合基础波形，或 Tone.PluckSynth 物理建模）。我们的唯一诉求是：纯代码生成、零网络请求、极简极客风。V2.0 的真实采样仅要求在代码结构上封装好 playGuitarNote 作为纯函数接口即可，当前版本绝对不引入外部音频资源。l关于问题 2 (品丝宽度硬编码数组缺失)：
你提到的“吉他 18 规则”在物理学上是正确的，但在移动端 Web UI 交互上会导致高把位热区过小，造成严重的触控失灵（UX 灾难）。
请直接硬编码并严格使用以下我为你计算好的相对宽度比例数组。这个数组代表了 Fret 0 到 Fret 13 的 flex-grow（或百分比宽度）的权重关系。它确保了 0 品（空弦）约为 1 品的 1/3，1 品为 1.0 满宽，并平滑线性衰减至 13 品的 0.85：
const FRET_WIDTH_RATIOS = [0.33, 1.00, 0.99, 0.97, 0.96, 0.95, 0.94, 0.92, 0.91, 0.90, 0.89, 0.87, 0.86, 0.85];
在实际渲染每一列时，请使用 Flexbox 布局，并直接读取此数组中的值作为该品格的宽度权重，绝对禁止你在代码中再进行任何关于品格宽度的数学计算。 关于问题 3 (多弦选择与目标音显示逻辑)：
首先，重申 PRD 规范：目标音在任何 UI 题板上，必须仅显示纯音名（如 "C"），绝对禁止向用户暴露 "C4"、"A2" 等科学音高（此类数据仅限底层传递给 Tone.js 发声时使用）。
其次，关于判定逻辑，V1.0 坚决采用“任意解判定 (Any Match) 即刻通关”原则。具体算法要求如下：
建立答案池： 系统出题后，引擎需根据用户当前勾选的弦（比如 E 弦和 A 弦），推导出这两根弦上所有符合目标音名（比如 C）的坐标，存入一个 validAnswers 数组。
V1.0 判定标准： 用户只要点击了该数组中的任意一个正确坐标，该点立刻亮起绿灯并发声，判定为过关，并启动 0.4s 延迟切题动作。不需要点满所有的 C。
V2.0 架构预留： 通过上述 validAnswers 数组的设计，我们实际上已经从底层解耦了“寻音算法”与“过关条件”。未来只需在母组件中增加一个状态开关，即可轻松切换至“全解模式”。l关于问题 4 (12 品双圆点的绘制策略)：
严禁过度设计。V1.0 不需要且绝对禁止引入 SVG 来绘制简单的几何品记。
请直接使用 纯 CSS 来实现。你可以自行决定是使用普通的 <div className="w-3 h-3 rounded-full..."> 配合 Flexbox 居中排列，还是使用 ::before / ::after 伪元素。唯一的要求是：保持 DOM 结构极致轻量，且在不同屏幕尺寸下绝对居中、不发生错位。 关于问题 5 (过渡期防抖与静音拦截逻辑)：
首先纠正一个逻辑前提：根据 PRD 8.1，只有“答对”才会触发 0.4 秒的 isTransitioning 过渡期。“答错”是极短促的闪烁，没有延迟挂起，因此连续答错时，复音叠加 (Polyphony) 是完全正常发声的，不存在静音拦截。
其次，关于“答对后”的这 0.4 秒过渡期，请严格执行全局拦截（彻底无视新交互）。具体要求如下：
在这 0.4s 内，用户的首要体验是“聆听刚才答对音符的自然尾音”。
如果用户在此期间手贱点击了任何其他品格，必须强制拦截：不改变任何 State（不断 Combo、不扣分），不触发视觉变化（不亮红灯/绿灯），并且绝对不触发任何新的音频播放。
0.4s 结束后，状态重置，恢复正常的点击响应。 ~16 lin【架构师确认：计划通过】
你的架构拆解和阶段划分极其出色，完全领会了高内聚低耦合与 PRD 的各项红线约束（特别是 React.memo 记忆化与双轨音频引擎的规划）。我非常满意。
在正式开始之前，我只需补充一个针对开发期测试的 Harness 需求：
请在 src/components/ui/ 目录下新增一个 <DebugPanel /> 组件。这个面板仅在开发环境可见（可用绝对定位放在屏幕右下角，半透明），用于实时打印当前的底层 State（例如：当前的 score, targetNote, combo，以及极其重要的 isTransitioning 状态布尔值），以便我们在不看 Console 的情况下，直观监控数据流转是否死锁。
现