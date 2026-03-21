export class SoundGenerator {
  static createKick(ctx: AudioContext): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = Math.sin(2 * Math.PI * 150 * Math.exp(-t * 20)) * Math.exp(-t * 15);
    }
    return buffer;
  }

  static createPunch(ctx: AudioContext): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 30) + Math.sin(2 * Math.PI * 200 * Math.exp(-t * 15)) * Math.exp(-t * 20);
    }
    return buffer;
  }

  static createHit(ctx: AudioContext): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 50);
    }
    return buffer;
  }

  static createJump(ctx: AudioContext): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = Math.sin(2 * Math.PI * (200 + t * 800)) * Math.exp(-t * 10);
    }
    return buffer;
  }

  static createLand(ctx: AudioContext): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 40);
    }
    return buffer;
  }

  static createLevelUp(ctx: AudioContext): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    const notes = [440, 554.37, 659.25, 880];
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const noteIndex = Math.floor(t * 8) % notes.length;
      data[i] = Math.sin(2 * Math.PI * notes[noteIndex] * t) * Math.exp(-t * 4) * 0.5;
    }
    return buffer;
  }

  static createDash(ctx: AudioContext): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 20) * 0.5;
    }
    return buffer;
  }

  static createDeath(ctx: AudioContext): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = Math.sin(2 * Math.PI * (100 - t * 80)) * Math.exp(-t * 2);
    }
    return buffer;
  }

  static createBark(ctx: AudioContext): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const freq = 400 + Math.sin(t * 100) * 100;
      data[i] = (Math.sin(2 * Math.PI * freq * t) + (Math.random() * 0.5)) * Math.exp(-t * 25);
    }
    return buffer;
  }
}
