/* Detects someone blowing into the microphone (loud low-frequency noise). */

export class BlowDetector {
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private raf = 0;

  static supported(): boolean {
    return !!navigator.mediaDevices?.getUserMedia && typeof AudioContext !== 'undefined';
  }

  /**
   * Starts listening. `onLevel` gets 0..1 loudness every frame,
   * `onPuff` fires for each detected blow. Throws if the mic is refused.
   */
  async start(onLevel: (v: number) => void, onPuff: () => void): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    this.ctx = new AudioContext();
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 512;
    this.ctx.createMediaStreamSource(this.stream).connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    const bins = Math.min(40, data.length); // ~0-3.5 kHz, where breath noise is loudest
    let baseline = 0;
    let frames = 0;
    let hot = 0;
    let cooldown = 0;

    const loop = () => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 1; i < bins; i++) sum += data[i];
      const level = sum / ((bins - 1) * 255);

      // First ~third of a second: learn how loud the room is
      frames++;
      if (frames <= 20) baseline += (level - baseline) / frames;
      onLevel(level);

      const threshold = Math.max(0.3, baseline + 0.2);
      if (cooldown > 0) cooldown--;
      else if (level > threshold) {
        if (++hot >= 3) { onPuff(); hot = 0; cooldown = 8; }
      } else hot = 0;

      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
    this.stream?.getTracks().forEach(t => t.stop());
    this.ctx?.close().catch(() => {});
    this.stream = null;
    this.ctx = null;
  }
}
