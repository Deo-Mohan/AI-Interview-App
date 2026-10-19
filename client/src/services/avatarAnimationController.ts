import * as THREE from 'three';
import { ConversationState } from '../types/engine';

export interface MorphTargetMesh {
  mesh: THREE.Mesh;
  dict: { [key: string]: number };
  influences: number[];
}

export interface BoneRig {
  head: THREE.Object3D | null;
  neck: THREE.Object3D | null;
  spine: THREE.Object3D | null;
  leftEye?: THREE.Object3D | null;
  rightEye?: THREE.Object3D | null;
  leftArm?: THREE.Object3D | null;
  rightArm?: THREE.Object3D | null;
}

/**
 * Phonetic syllabic mapping for English speech.
 * Converts words into smooth Oculus viseme sequence with timings.
 */
const PHONEME_PATTERNS: { regex: RegExp; visemes: string[]; jaw: number }[] = [
  // Bilabials (p, b, m) - lips pressed together
  { regex: /\b(p|b|m|mp|mb)\w*/i, visemes: ['viseme_PP', 'viseme_aa'], jaw: 0.25 },
  // Labiodental (f, v)
  { regex: /\b(f|v|ph)\w*/i, visemes: ['viseme_FF', 'viseme_E'], jaw: 0.35 },
  // Dental (th)
  { regex: /\b(th)\w*/i, visemes: ['viseme_TH', 'viseme_aa'], jaw: 0.40 },
  // Alveolar plosives / nasals (t, d, n, l)
  { regex: /\b(t|d|n|l)\w*/i, visemes: ['viseme_DD', 'viseme_E'], jaw: 0.40 },
  // Velar plosives (k, g, c)
  { regex: /\b(k|g|c|ck|q)\w*/i, visemes: ['viseme_kk', 'viseme_aa'], jaw: 0.50 },
  // Sibilants / postalveolar (s, z, sh, ch, j)
  { regex: /\b(s|z|sh|ch|j|soft c)\w*/i, visemes: ['viseme_CH', 'viseme_SS'], jaw: 0.35 },
  // Open vowels (a, ar, ah)
  { regex: /(a|ar|ah|ai|ay)/i, visemes: ['viseme_aa', 'viseme_E'], jaw: 0.65 },
  // Mid vowels (e, ea, ee)
  { regex: /(e|ea|ee|ey)/i, visemes: ['viseme_E', 'viseme_I'], jaw: 0.45 },
  // Close front vowels (i, y, ie)
  { regex: /(i|y|ie|igh)/i, visemes: ['viseme_I', 'viseme_E'], jaw: 0.35 },
  // Rounded back vowels (o, ow, oa)
  { regex: /(o|ow|oa|ou|aw)/i, visemes: ['viseme_O', 'viseme_U'], jaw: 0.58 },
  // Close rounded vowels (u, oo, ew)
  { regex: /(u|oo|ew|ue)/i, visemes: ['viseme_U', 'viseme_O'], jaw: 0.38 },
  // Liquid r
  { regex: /(r|re|er|ir|ur)/i, visemes: ['viseme_RR', 'viseme_aa'], jaw: 0.45 }
];

export class AvatarAnimationController {
  private meshes: MorphTargetMesh[] = [];
  private bones: BoneRig = { head: null, neck: null, spine: null };

  // Current and target morph weights for speed-limited coarticulation
  private currentWeights: Map<string, number> = new Map();
  private targetWeights: Map<string, number> = new Map();

  // Speech tracking state
  private isSpeaking: boolean = false;
  private currentWord: string = '';
  private wordStartTime: number = 0;
  private wordDuration: number = 0.28;
  private activeVisemes: string[] = [];
  private activeJawTarget: number = 0;
  private speechBoundaryTimer: number = 0;

  // Web Audio analyzer (optional live audio stream / audio element)
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioDataArray: Uint8Array<ArrayBuffer> | null = null;

  // Biological Blink state
  private blinkTimer: number = 0;
  private nextBlinkInterval: number = 3.5;
  private isBlinking: boolean = false;
  private blinkProgress: number = 0;
  private blinkDuration: number = 0.16;

  // Gaze saccade state
  private saccadeTimer: number = 0;
  private nextSaccadeInterval: number = 4.2;
  private targetGazeX: number = 0;
  private targetGazeY: number = 0;
  private currentGazeX: number = 0;
  private currentGazeY: number = 0;

  // Responsive listening nod
  private nodTimer: number = 0;
  private nextNodInterval: number = 5.0;
  private isNodding: boolean = false;
  private nodProgress: number = 0;

  // Lifecycle state
  private state: ConversationState = 'idle';

  constructor(meshes: MorphTargetMesh[], bones: BoneRig) {
    this.meshes = meshes;
    this.bones = bones;

    // Cache bind pose quaternions
    [this.bones.head, this.bones.neck, this.bones.spine, this.bones.leftArm, this.bones.rightArm].forEach(b => {
      if (b && !b.userData.bindQuaternion) {
        b.userData.bindQuaternion = b.quaternion.clone();
      }
    });

    this.resetAllWeights();
  }

  public setMeshesAndBones(meshes: MorphTargetMesh[], bones: BoneRig) {
    this.meshes = meshes;
    this.bones = bones;
    [this.bones.head, this.bones.neck, this.bones.spine, this.bones.leftArm, this.bones.rightArm].forEach(b => {
      if (b && !b.userData.bindQuaternion) {
        b.userData.bindQuaternion = b.quaternion.clone();
      }
    });
  }

  /**
   * Update the active conversation lifecycle state
   */
  public setState(newState: ConversationState) {
    const prevState = this.state;
    this.state = newState;

    if (newState !== 'speaking') {
      this.isSpeaking = false;
      this.activeVisemes = [];
      this.activeJawTarget = 0;
      this.clearSpeechMorphs();
    }

    if (newState === 'listening') {
      this.nextNodInterval = 3.0 + Math.random() * 3.5;
      this.nodTimer = 0;
    }
  }

  /**
   * Connect an HTMLAudioElement or MediaStream to drive amplitude-based lip-sync
   */
  public connectAudioSource(source: HTMLAudioElement | MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.65;
      this.audioDataArray = new Uint8Array(this.analyser.frequencyBinCount);

      if (source instanceof HTMLAudioElement) {
        const mediaSource = this.audioContext.createMediaElementSource(source);
        mediaSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      } else if (source instanceof MediaStream) {
        const streamSource = this.audioContext.createMediaStreamSource(source);
        streamSource.connect(this.analyser);
      }
    } catch (e) {
      console.warn('[AvatarAnimationController] Failed to connect Web Audio analyzer:', e);
    }
  }

  /**
   * Inform controller of real-time speech boundary events from SpeechSynthesisUtterance
   */
  public onSpeechWordBoundary(word: string, approximateDurationMs: number = 300) {
    this.isSpeaking = true;
    this.currentWord = word.trim().toLowerCase();
    this.wordStartTime = performance.now() / 1000;
    this.wordDuration = Math.max(0.18, approximateDurationMs / 1000);
    this.speechBoundaryTimer = this.wordDuration;

    // Deconstruct word into visemes and jaw aperture
    let matchedVisemes: string[] = [];
    let jaw = 0.35;

    for (const pattern of PHONEME_PATTERNS) {
      if (pattern.regex.test(this.currentWord)) {
        matchedVisemes.push(...pattern.visemes);
        jaw = Math.max(jaw, pattern.jaw);
      }
    }

    if (matchedVisemes.length === 0) {
      matchedVisemes = ['viseme_aa', 'viseme_E'];
      jaw = 0.40;
    }

    this.activeVisemes = Array.from(new Set(matchedVisemes));
    this.activeJawTarget = jaw;
  }

  /**
   * Inform controller that speech synthesis has started
   */
  public onSpeechStart() {
    this.isSpeaking = true;
    this.setState('speaking');
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
  }

  /**
   * Inform controller that speech synthesis has ended or been interrupted
   */
  public onSpeechEnd() {
    this.isSpeaking = false;
    this.activeVisemes = [];
    this.activeJawTarget = 0;
    this.clearSpeechMorphs();
    if (this.state === 'speaking') {
      this.setState('listening');
    }
  }

  /**
   * Main per-frame update loop called from Three.js render tick
   */
  public update(delta: number, elapsed: number) {
    // 1. Process Biological Blinks
    this.updateBlinks(delta);

    // 2. Process Gaze & Saccades
    this.updateGaze(delta);

    // 3. Process Speech & Mouth Visemes
    this.updateSpeechMouth(delta);

    // 4. Process Expressions & Eyebrows based on Lifecycle
    this.updateExpressions(delta, elapsed);

    // 5. Process Skeletal Kinematics (Head, Neck, Breathing)
    this.updateSkeletalKinematics(delta, elapsed);

    // 6. Apply smooth speed-limited coarticulation to 3D meshes
    this.applyMorphWeights(delta);
  }

  private updateBlinks(delta: number) {
    this.blinkTimer += delta;

    // Frequency depends on conversation state
    const baseInterval = this.state === 'speaking' ? 2.6 : this.state === 'thinking' ? 2.2 : 3.8;

    if (!this.isBlinking && this.blinkTimer >= this.nextBlinkInterval) {
      this.isBlinking = true;
      this.blinkProgress = 0;
      this.blinkTimer = 0;
      this.nextBlinkInterval = baseInterval + (Math.random() * 2.0 - 0.5);
    }

    if (this.isBlinking) {
      this.blinkProgress += delta / this.blinkDuration;
      // Asymmetric eyelid curve: closes quickly (first 35%), opens gently (remaining 65%)
      let weight = 0;
      if (this.blinkProgress <= 0.35) {
        weight = this.blinkProgress / 0.35;
      } else if (this.blinkProgress <= 1.0) {
        weight = 1 - (this.blinkProgress - 0.35) / 0.65;
      } else {
        weight = 0;
        this.isBlinking = false;
      }

      this.setTarget('eyeBlinkLeft', weight);
      this.setTarget('eyeBlinkRight', weight);
    } else {
      this.setTarget('eyeBlinkLeft', 0);
      this.setTarget('eyeBlinkRight', 0);
    }
  }

  private updateGaze(delta: number) {
    this.saccadeTimer += delta;

    if (this.saccadeTimer >= this.nextSaccadeInterval) {
      this.saccadeTimer = 0;
      this.nextSaccadeInterval = 3.5 + Math.random() * 3.5;

      // Subtle gaze shifts (~2 to 4% offset) returning to eye contact
      if (Math.random() < 0.65) {
        // Direct eye contact
        this.targetGazeX = 0;
        this.targetGazeY = 0;
      } else {
        // Natural micro-shift
        this.targetGazeX = (Math.random() - 0.5) * 0.08;
        this.targetGazeY = (Math.random() - 0.5) * 0.05;
      }
    }

    // Smoothly interpolate gaze
    this.currentGazeX += (this.targetGazeX - this.currentGazeX) * Math.min(1, delta * 6.0);
    this.currentGazeY += (this.targetGazeY - this.currentGazeY) * Math.min(1, delta * 6.0);

    // Apply eye gaze morphs
    if (this.currentGazeX > 0) {
      this.setTarget('eyeLookOutLeft', this.currentGazeX);
      this.setTarget('eyeLookInRight', this.currentGazeX);
      this.setTarget('eyeLookInLeft', 0);
      this.setTarget('eyeLookOutRight', 0);
    } else {
      this.setTarget('eyeLookInLeft', -this.currentGazeX);
      this.setTarget('eyeLookOutRight', -this.currentGazeX);
      this.setTarget('eyeLookOutLeft', 0);
      this.setTarget('eyeLookInRight', 0);
    }

    if (this.currentGazeY > 0) {
      this.setTarget('eyeLookUpLeft', this.currentGazeY);
      this.setTarget('eyeLookUpRight', this.currentGazeY);
      this.setTarget('eyeLookDownLeft', 0);
      this.setTarget('eyeLookDownRight', 0);
    } else {
      this.setTarget('eyeLookDownLeft', -this.currentGazeY);
      this.setTarget('eyeLookDownRight', -this.currentGazeY);
      this.setTarget('eyeLookUpLeft', 0);
      this.setTarget('eyeLookUpRight', 0);
    }
  }

  private updateSpeechMouth(delta: number) {
    if (!this.isSpeaking) {
      this.clearSpeechMorphs();
      return;
    }

    // 1. Audio Frequency Analysis (if active Web Audio source connected)
    let audioRms = 0;
    if (this.analyser && this.audioDataArray) {
      (this.analyser as any).getByteFrequencyData(this.audioDataArray);
      let sum = 0;
      for (let i = 0; i < this.audioDataArray.length; i++) {
        sum += this.audioDataArray[i];
      }
      audioRms = sum / (this.audioDataArray.length * 255);
    }

    // 2. Word Boundary Phonetic Progression
    const now = performance.now() / 1000;
    const wordElapsed = now - this.wordStartTime;
    const progress = Math.min(1, wordElapsed / this.wordDuration);

    // Dynamic syllable envelope (bell curve peaking at 40% of word)
    const envelope = Math.sin(progress * Math.PI);

    // If audio RMS is present, modulate with it; otherwise use phonetic envelope
    const intensity = audioRms > 0.05 ? Math.max(envelope, audioRms * 1.8) : envelope;

    const jaw = this.activeJawTarget * intensity;
    this.setTarget('jawOpen', jaw);

    // Reset base visemes
    const allVisemes = [
      'viseme_aa', 'viseme_E', 'viseme_I', 'viseme_O', 'viseme_U',
      'viseme_PP', 'viseme_FF', 'viseme_TH', 'viseme_DD', 'viseme_kk',
      'viseme_CH', 'viseme_SS', 'viseme_nn', 'viseme_RR'
    ];
    for (const v of allVisemes) {
      this.setTarget(v, 0);
    }

    // Distribute active visemes
    for (const v of this.activeVisemes) {
      this.setTarget(v, Math.min(1.0, intensity * 0.9));
    }

    // ARKit complementary lip shapes
    if (this.activeVisemes.includes('viseme_O') || this.activeVisemes.includes('viseme_U')) {
      this.setTarget('mouthFunnel', intensity * 0.45);
      this.setTarget('mouthPucker', intensity * 0.35);
    } else {
      this.setTarget('mouthFunnel', 0);
      this.setTarget('mouthPucker', 0);
    }

    if (this.activeVisemes.includes('viseme_PP')) {
      this.setTarget('mouthPressLeft', intensity * 0.35);
      this.setTarget('mouthPressRight', intensity * 0.35);
      this.setTarget('mouthClose', intensity * 0.30);
    } else {
      this.setTarget('mouthPressLeft', 0);
      this.setTarget('mouthPressRight', 0);
      this.setTarget('mouthClose', 0);
    }
  }

  private updateExpressions(delta: number, elapsed: number) {
    // Warm friendly baseline mentor smile across all states
    const baselineSmile = 0.14;
    this.setTarget('mouthSmileLeft', baselineSmile);
    this.setTarget('mouthSmileRight', baselineSmile);

    if (this.state === 'speaking') {
      // Eyebrow emphasis moves rhythmically with vocal stress
      const browPulse = this.isSpeaking ? 0.16 + Math.sin(elapsed * 4.2) * 0.08 : 0.05;
      this.setTarget('browInnerUp', Math.max(0, browPulse));
      this.setTarget('browDownLeft', 0);
      this.setTarget('browDownRight', 0);
      this.setTarget('cheekSquintLeft', 0.10);
      this.setTarget('cheekSquintRight', 0.10);
    } else if (this.state === 'listening') {
      // Attentive brows & gentle squint showing active listening engagement
      this.setTarget('browInnerUp', 0.15);
      this.setTarget('browDownLeft', 0);
      this.setTarget('browDownRight', 0);
      this.setTarget('eyeSquintLeft', 0.08);
      this.setTarget('eyeSquintRight', 0.08);
      this.setTarget('cheekSquintLeft', 0.08);
      this.setTarget('cheekSquintRight', 0.08);
    } else if (this.state === 'thinking') {
      // Thoughtful, contemplative expression: raised inner brow with subtle asymmetric concentration
      this.setTarget('browInnerUp', 0.28);
      this.setTarget('browDownLeft', 0.08);
      this.setTarget('browDownRight', 0);
      this.setTarget('cheekSquintLeft', 0.04);
      this.setTarget('cheekSquintRight', 0.04);
    } else {
      // Idle resting expression
      this.setTarget('browInnerUp', 0.04);
      this.setTarget('browDownLeft', 0);
      this.setTarget('browDownRight', 0);
      this.setTarget('eyeSquintLeft', 0);
      this.setTarget('eyeSquintRight', 0);
      this.setTarget('cheekSquintLeft', 0.04);
      this.setTarget('cheekSquintRight', 0.04);
    }
  }

  private updateSkeletalKinematics(delta: number, elapsed: number) {
    // 1. Natural Organic Spine Breathing (gentle chest expansion ~4s period)
    if (this.bones.spine && this.bones.spine.userData.bindQuaternion) {
      const breathPitch = Math.sin(elapsed * 1.5) * 0.008;
      this.applyBoneQuaternionDelta(this.bones.spine, breathPitch, 0, 0);
    }

    // 2. Arms natural micro-sway with breathing
    if (this.bones.leftArm && this.bones.leftArm.userData.bindQuaternion) {
      const armSway = Math.sin(elapsed * 1.5) * 0.004;
      this.applyBoneQuaternionDelta(this.bones.leftArm, armSway, 0, 0);
    }
    if (this.bones.rightArm && this.bones.rightArm.userData.bindQuaternion) {
      const armSway = Math.sin(elapsed * 1.5) * 0.004;
      this.applyBoneQuaternionDelta(this.bones.rightArm, armSway, 0, 0);
    }

    // 3. Head & Neck Kinematics
    let pitchDelta = 0;
    let yawDelta = 0;
    let rollDelta = 0;

    // Gentle organic idle micro-drift
    pitchDelta += Math.sin(elapsed * 0.8) * 0.008;
    yawDelta += Math.sin(elapsed * 0.5) * 0.010;
    rollDelta += Math.sin(elapsed * 0.4) * 0.005;

    if (this.state === 'speaking') {
      // Conversational nodding cadence synchronized with speech
      if (this.isSpeaking) {
        pitchDelta += 0.015 + Math.sin(elapsed * 3.6) * 0.022;
        yawDelta += Math.sin(elapsed * 1.8) * 0.016;
        rollDelta += Math.cos(elapsed * 1.4) * 0.008;
      }
    } else if (this.state === 'listening') {
      // Attentive head tilt
      rollDelta += 0.025;

      // Occasional responsive listening nod
      this.nodTimer += delta;
      if (!this.isNodding && this.nodTimer >= this.nextNodInterval) {
        this.isNodding = true;
        this.nodProgress = 0;
        this.nodTimer = 0;
        this.nextNodInterval = 4.0 + Math.random() * 4.0;
      }

      if (this.isNodding) {
        this.nodProgress += delta / 1.1; // 1.1 second gentle nod
        if (this.nodProgress <= 1.0) {
          pitchDelta += Math.sin(this.nodProgress * Math.PI) * 0.035;
        } else {
          this.isNodding = false;
        }
      }
    } else if (this.state === 'thinking') {
      // Thoughtful head angle: tilted up and slightly away
      pitchDelta -= 0.020;
      yawDelta += 0.035;
      rollDelta -= 0.015;
    }

    if (this.bones.head && this.bones.head.userData.bindQuaternion) {
      this.applyBoneQuaternionDelta(this.bones.head, pitchDelta, yawDelta, rollDelta);
    }
    if (this.bones.neck && this.bones.neck.userData.bindQuaternion) {
      this.applyBoneQuaternionDelta(this.bones.neck, pitchDelta * 0.4, yawDelta * 0.3, rollDelta * 0.3);
    }
  }

  private applyBoneQuaternionDelta(bone: THREE.Object3D, pitch: number, yaw: number, roll: number) {
    if (!bone || !bone.userData.bindQuaternion) return;
    const qDelta = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll));
    bone.quaternion.copy(bone.userData.bindQuaternion).multiply(qDelta);
  }

  private setTarget(name: string, weight: number) {
    this.targetWeights.set(name, Math.max(0, Math.min(1, weight)));
  }

  private clearSpeechMorphs() {
    this.setTarget('jawOpen', 0);
    const visemes = [
      'viseme_aa', 'viseme_E', 'viseme_I', 'viseme_O', 'viseme_U',
      'viseme_PP', 'viseme_FF', 'viseme_TH', 'viseme_DD', 'viseme_kk',
      'viseme_CH', 'viseme_SS', 'viseme_nn', 'viseme_RR', 'viseme_sil',
      'mouthFunnel', 'mouthPucker', 'mouthPressLeft', 'mouthPressRight', 'mouthClose'
    ];
    for (const v of visemes) {
      this.setTarget(v, 0);
    }
  }

  private resetAllWeights() {
    this.currentWeights.clear();
    this.targetWeights.clear();
  }

  /**
   * Smoothly glides current weights toward target weights with biological coarticulation speed limit
   */
  private applyMorphWeights(delta: number) {
    // Transition speed: 18 units/sec for lips/jaw, 28 units/sec for blinks
    const standardSpeed = delta * 18.0;
    const blinkSpeed = delta * 28.0;

    for (const [name, target] of this.targetWeights.entries()) {
      const current = this.currentWeights.get(name) || 0;
      const speed = name.startsWith('eyeBlink') ? blinkSpeed : standardSpeed;
      const step = THREE.MathUtils.clamp(target - current, -speed, speed);
      const nextWeight = THREE.MathUtils.clamp(current + step, 0, 1);
      this.currentWeights.set(name, nextWeight);

      // Apply directly to all meshes
      for (const item of this.meshes) {
        let idx = item.dict[name];
        if (idx === undefined && !name.startsWith('viseme_')) {
          idx = item.dict['viseme_' + name];
        }
        if (idx !== undefined && item.influences) {
          item.influences[idx] = nextWeight;
        }
      }
    }
  }

  public dispose() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
    }
    this.meshes = [];
    this.currentWeights.clear();
    this.targetWeights.clear();
  }
}
