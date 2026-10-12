export class Effects {
  readonly recording: MediaStreamAudioDestinationNode;
  readonly input: BiquadFilterNode;
  readonly reverbSend: GainNode;
  readonly delaySend: GainNode;
  private delay: DelayNode;
  constructor(private context: AudioContext) {
    this.input = context.createBiquadFilter(); this.input.type = 'lowpass'; this.input.frequency.value = 18000;
    const master = context.createGain(); master.gain.value = .65;
    const compressor = context.createDynamicsCompressor(); compressor.threshold.value = -12; compressor.ratio.value = 6;
    this.input.connect(master); master.connect(compressor); compressor.connect(context.destination);
    this.recording = context.createMediaStreamDestination(); compressor.connect(this.recording);
    this.delaySend = context.createGain(); this.delay = context.createDelay(2);
    const feedback = context.createGain(); feedback.gain.value = .24;
    const damp = context.createBiquadFilter(); damp.frequency.value = 3500;
    this.input.connect(this.delaySend); this.delaySend.connect(this.delay); this.delay.connect(damp); damp.connect(master); damp.connect(feedback); feedback.connect(this.delay);
    this.reverbSend = context.createGain();
    const convolver = context.createConvolver();
    const impulse = context.createBuffer(2, context.sampleRate * 1.6, context.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const samples = impulse.getChannelData(channel);
      for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples.length, 3);
    }
    convolver.buffer = impulse;
    this.input.connect(this.reverbSend); this.reverbSend.connect(convolver); convolver.connect(master);
  }
  update(reverb: number, delay: number, filter: number, bpm: number) {
    const t = this.context.currentTime;
    this.reverbSend.gain.setTargetAtTime(reverb * .6, t, .03);
    this.delaySend.gain.setTargetAtTime(delay * .5, t, .03);
    this.input.frequency.setTargetAtTime(300 * Math.pow(60, filter), t, .03);
    this.delay.delayTime.setTargetAtTime(60 / bpm * .75, t, .03);
  }
}
