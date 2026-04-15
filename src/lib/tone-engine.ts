import * as Tone from "tone";

/**
 * 音色选型（架构师强制）：目标写法为
 * `new Tone.PolySynth(Tone.PluckSynth)`，以获得 Karplus-Strong 拨弦质感与多声部分配。
 *
 * Tone.js 15 中 `PolySynth` 在创建声部时要求 `voice instanceof Monophonic`（见 node_modules/tone/.../PolySynth.js），
 * 而 `PluckSynth` 继承自 `Instrument` 而非 `Monophonic`，上述构造在运行时会直接断言失败。
 *
 * 因此本节采用「同一 `PluckSynth` 参数的多实例轮询 + 共享母线」实现等价的物理建模拨弦与复音叠加，
 * 避免更换为默认 `Synth` 等与 PRD 不符的音色。
 */

const VOICE_COUNT = 24;

let busVolume: Tone.Volume | null = null;
let reverb: Tone.Reverb | null = null;
let voices: Tone.PluckSynth[] = [];
let voiceCursor = 0;
let initialized = false;

function getPluckVoiceOptions(): ConstructorParameters<typeof Tone.PluckSynth>[0] {
  return {
    attackNoise: 1,
    resonance: 0.98,
    dampening: 4000,
  };
}

/**
 * 启动混响脉冲响应生成：构造函数内已调用 `generate()`，此处仅将 `ready` 挂到后台，
 * 不阻塞 UI 或 `playGuitarNote` 的同步调用；IR 就绪前 Effect 仍可按 dry/wet 规则输出。
 */
function kickOffReverbBackgroundLoad(target: Tone.Reverb): void {
  void target.ready.catch(() => undefined);
}

export function ensureToneEngine(): void {
  if (initialized) {
    return;
  }

  busVolume = new Tone.Volume(-8);

  reverb = new Tone.Reverb({
    decay: 2.5,
    wet: 0.35,
  });

  busVolume.connect(reverb);
  reverb.toDestination();
  kickOffReverbBackgroundLoad(reverb);

  const options = getPluckVoiceOptions();

  voices = Array.from({ length: VOICE_COUNT }, () => {
    const pluck = new Tone.PluckSynth(options);
    pluck.connect(busVolume!);
    return pluck;
  });

  initialized = true;
}

/**
 * 根据 `musicTheory` 产出的科学音高字符串（如 `E2`、`C#4`）发声。
 * V1.0：Karplus-Strong 合成；V2.0 可在下方分支接入采样。
 */
export function playGuitarNote(scientificPitch: string): void {
  /*
   * —— V2.0 真实音频接入占位（中文说明）——
   * 未来若使用 Howler.js 或原生 Web Audio API 播放 Audio Sprite：
   * 1) 准备一份吉他采样资源 URL 与 JSON 时间轴（note / scientificPitch → sprite 起止时间）。
   * 2) 在本函数最前根据 scientificPitch 查表，解码为 buffer 后走 playBuffer 分支，
   *    即可替换下方 PluckSynth，而无需改动 UI 与乐理层。
   * 3) 当前 V1.0 不引入任何外部音频文件，仅执行合成器分支。
   */
  if (!initialized) {
    ensureToneEngine();
  }

  const voice = voices[voiceCursor % voices.length]!;
  voiceCursor += 1;
  voice.triggerAttack(scientificPitch);
}

export function disposeToneEngine(): void {
  if (!initialized) {
    return;
  }

  for (const v of voices) {
    v.dispose();
  }
  voices = [];

  busVolume?.dispose();
  busVolume = null;

  reverb?.dispose();
  reverb = null;

  voiceCursor = 0;
  initialized = false;
}
