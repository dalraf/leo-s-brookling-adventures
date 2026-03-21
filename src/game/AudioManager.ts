import { SoundGenerator } from './SoundGenerator';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private isMuted: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain.gain.value = 0.3;
      this.sfxGain.gain.value = 0.5;

      this.loadSounds();
    } catch (e) {
      console.error('Audio initialization failed', e);
    }
  }

  private loadSounds() {
    if (!this.ctx) return;
    this.buffers.set('kick', SoundGenerator.createKick(this.ctx));
    this.buffers.set('punch', SoundGenerator.createPunch(this.ctx));
    this.buffers.set('hit', SoundGenerator.createHit(this.ctx));
    this.buffers.set('jump', SoundGenerator.createJump(this.ctx));
    this.buffers.set('land', SoundGenerator.createLand(this.ctx));
    this.buffers.set('levelUp', SoundGenerator.createLevelUp(this.ctx));
    this.buffers.set('dash', SoundGenerator.createDash(this.ctx));
    this.buffers.set('death', SoundGenerator.createDeath(this.ctx));
    this.buffers.set('bark', SoundGenerator.createBark(this.ctx));
  }

  public async resume() {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public playSFX(name: string, volume = 1) {
    if (!this.ctx || this.isMuted) return;
    const buffer = this.buffers.get(name);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(this.sfxGain!);
    source.start();
  }

  public startMusic() {
    if (!this.ctx || this.musicSource) return;
    const tempo = 110; // BPM
    const secondsPerBeat = 60 / tempo;
    const duration = secondsPerBeat * 16;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    const bassPattern = [36.71, 36.71, 41.2, 41.2, 48.99, 48.99, 32.7, 32.7]; // D1, E1, G1, C1
    const leadPattern = [146.83, 0, 146.83, 164.81, 0, 196.0, 0, 130.81]; // D3, E3, G3, C3

    for (let i = 0; i < data.length; i++) {
      const t = i / this.ctx.sampleRate;
      const beat = Math.floor(t / secondsPerBeat);
      const subBeat = (t / secondsPerBeat) % 1;

      // Bass
      const bassFreq = bassPattern[beat % bassPattern.length];
      let val = Math.sin(2 * Math.PI * bassFreq * t) * Math.exp(-subBeat * 4) * 0.4;

      // Lead
      const leadFreq = leadPattern[beat % leadPattern.length];
      if (leadFreq > 0) {
        val += (Math.sin(2 * Math.PI * leadFreq * t) + (Math.random() * 0.05)) * Math.exp(-subBeat * 8) * 0.2;
      }

      // Percussion
      if (subBeat < 0.05) {
        if (beat % 2 === 0) val += (Math.random() * 2 - 1) * 0.1; // Kick-ish
        if (beat % 4 === 2) val += (Math.random() * 2 - 1) * 0.2; // Snare-ish
      }

      data[i] = val;
    }

    this.musicSource = this.ctx.createBufferSource();
    this.musicSource.buffer = buffer;
    this.musicSource.loop = true;
    this.musicSource.connect(this.musicGain!);
    this.musicSource.start();
  }

  public stopMusic() {
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource = null;
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
    }
    return this.isMuted;
  }
}

export const audioManager = new AudioManager();
