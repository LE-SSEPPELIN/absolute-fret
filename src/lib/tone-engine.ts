import * as Tone from "tone";

let synth: Tone.PolySynth<Tone.FMSynth> | null = null;
let chorus: Tone.Chorus | null = null;
let busVolume: Tone.Volume | null = null;
let reverb: Tone.Reverb | null = null;
let initialized = false;

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

  synth = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3.0,
    modulationIndex: 10,
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.001,
      decay: 0.8,
      sustain: 0.5,
      release: 3.5,
    },
    modulation: { type: "square" },
    modulationEnvelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.1,
    },
  });

  chorus = new Tone.Chorus(4, 2.5, 0.5).start();
  busVolume = new Tone.Volume(-8);
  reverb = new Tone.Reverb({
    decay: 2.5,
    wet: 0.35,
  });

  synth.connect(chorus);
  chorus.connect(busVolume);
  busVolume.connect(reverb);
  reverb.connect(Tone.Destination);
  kickOffReverbBackgroundLoad(reverb);

  initialized = true;
}

/**
 * 根据 `musicTheory` 产出的科学音高字符串（如 `E2`、`C#4`）发声。
 * V1.0：FM 合成；V2.0 可在下方分支接入采样。
 */
export function playGuitarNote(toneParam: string): void {
  /*
   * —— V2.0 真实音频接入占位（中文说明）——
   * 未来若使用 Howler.js 或原生 Web Audio API 播放 Audio Sprite：
   * 1) 准备一份吉他采样资源 URL 与 JSON 时间轴（note / toneParam → sprite 起止时间）。
   * 2) 在本函数最前根据 toneParam 查表，解码为 buffer 后走 playBuffer 分支，
   *    即可替换下方 PolySynth，而无需改动 UI 与乐理层。
   * 3) 当前 V1.0 不引入任何外部音频文件，仅执行合成器分支。
   */
  if (!initialized) {
    ensureToneEngine();
  }

  synth?.triggerAttackRelease(toneParam, "8n");
}

export function disposeToneEngine(): void {
  if (!initialized) {
    return;
  }

  synth?.dispose();
  synth = null;

  chorus?.dispose();
  chorus = null;

  busVolume?.dispose();
  busVolume = null;

  reverb?.dispose();
  reverb = null;

  initialized = false;
}
