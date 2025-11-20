class SoundService {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;
  private spinOscillator: OscillatorNode | null = null;
  private spinGain: GainNode | null = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private async ensureContext() {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopSpin();
    }
  }

  public async playAddPlayer() {
    if (this.isMuted) return;
    await this.ensureContext();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, this.audioContext.currentTime + 0.1); // C6

    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  public async playSpin() {
    if (this.isMuted) return;
    await this.ensureContext();
    if (!this.audioContext) return;

    if (this.spinOscillator) {
      this.stopSpin();
    }

    this.spinOscillator = this.audioContext.createOscillator();
    this.spinGain = this.audioContext.createGain();

    this.spinOscillator.connect(this.spinGain);
    this.spinGain.connect(this.audioContext.destination);

    this.spinOscillator.type = 'square';
    this.spinOscillator.frequency.setValueAtTime(20, this.audioContext.currentTime);
    
    // Ramp up frequency to simulate speed
    this.spinOscillator.frequency.linearRampToValueAtTime(40, this.audioContext.currentTime + 2);

    this.spinGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);

    this.spinOscillator.start();
  }

  public stopSpin() {
    if (this.spinOscillator) {
      try {
        const now = this.audioContext?.currentTime || 0;
        this.spinGain?.gain.linearRampToValueAtTime(0, now + 0.5);
        this.spinOscillator.stop(now + 0.5);
      } catch (e) {
        // Ignore errors if already stopped
      }
      this.spinOscillator = null;
      this.spinGain = null;
    }
  }

  public async playElimination() {
    if (this.isMuted) return;
    await this.ensureContext();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.audioContext.currentTime + 0.5);

    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.5);
  }

  public async playWinner() {
    if (this.isMuted) return;
    await this.ensureContext();
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    
    // Simple major arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const startTime = now + i * 0.15;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 1.5);
      
      osc.start(startTime);
      osc.stop(startTime + 1.5);
    });
  }
}

export const soundService = new SoundService();
