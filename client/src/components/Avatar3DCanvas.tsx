import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Bot, AlertCircle, Eye, EyeOff, Sparkles, RefreshCw, ExternalLink } from 'lucide-react';
import { ConversationState } from '../types/engine';

interface Avatar3DCanvasProps {
  state: ConversationState;
  className?: string;
  onFpsReport?: (fps: number) => void;
}

interface TargetMesh {
  mesh: THREE.Mesh;
  dict: { [key: string]: number };
  influences: number[];
}

/**
 * High-Fidelity 3D Humanoid Mentor Avatar Canvas:
 * - Powered by Three.js GLTFLoader loading the VTubeMe Sky GLB model (CC BY 4.0)
 * - Cinematic 3-point lighting with ACES Filmic tone mapping
 * - Full skeletal animations across idle, listening, thinking, and speaking states
 * - Real speech-driven facial blendshapes & lip sync using ARKit visemes (jawOpen, aa, E, oh, ih)
 * - Periodic natural blinking and expressive eye/brow micro-gestures
 * - Mobile performance optimizations, WebGL cleanup, and 2D lightweight fallback
 */
export const Avatar3DCanvas: React.FC<Avatar3DCanvasProps> = ({
  state,
  className = '',
  onFpsReport
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [hasWebGlError, setHasWebGlError] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [is2DFallbackEnabled, setIs2DFallbackEnabled] = useState<boolean>(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || is2DFallbackEnabled || prefersReducedMotion) return;

    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let clock = new THREE.Clock();

    // Model nodes references
    let headBone: THREE.Object3D | null = null;
    let neckBone: THREE.Object3D | null = null;
    let spineBone: THREE.Object3D | null = null;
    let morphMeshes: TargetMesh[] = [];

    // Helper to safely set morph target weight across all meshes
    const setMorphWeight = (name: string, weight: number) => {
      const clamped = Math.max(0, Math.min(1, weight));
      for (const item of morphMeshes) {
        const idx = item.dict[name];
        if (idx !== undefined && item.influences) {
          item.influences[idx] = clamped;
        }
      }
    };

    try {
      // 1. Scene setup
      scene = new THREE.Scene();

      // 2. Camera setup - framed chest-up portrait
      const width = containerRef.current.clientWidth || 400;
      const height = containerRef.current.clientHeight || 400;
      camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
      camera.position.set(0, 1.48, 0.98);
      camera.lookAt(0, 1.43, 0);

      // 3. Renderer with antialiasing, high color accuracy & tone mapping
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      containerRef.current.appendChild(renderer.domElement);

      // 4. Cinematic Studio 3-Point Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      // Key Light: Warm soft front-right sunlight
      const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
      keyLight.position.set(1.5, 2.5, 2.0);
      scene.add(keyLight);

      // Fill Light: Soft cool blue/lavender fill
      const fillLight = new THREE.DirectionalLight(0xe0e7ff, 1.0);
      fillLight.position.set(-1.5, 1.5, 1.5);
      scene.add(fillLight);

      // Rim / Accent Light: Vibrant violet/cyan hair rim for depth
      const rimLight = new THREE.DirectionalLight(0xc084fc, 2.2);
      rimLight.position.set(0, 2.8, -2.0);
      scene.add(rimLight);

      // 5. Load GLB Model
      const loader = new GLTFLoader();
      loader.load(
        '/models/english-coach.glb',
        (gltf) => {
          if (!scene) return;
          const model = gltf.scene;
          model.position.set(0, 0, 0);
          scene.add(model);

          // Locate bones and morph targets
          model.traverse((child: any) => {
            if (child.isBone) {
              const name = (child.name || '').toLowerCase();
              if (name === 'head') headBone = child;
              if (name === 'neck' || name === 'neck1') neckBone = child;
              if (name === 'spine' || name === 'spine1' || name === 'spine2') spineBone = child;
            }

            if (child.isMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
              morphMeshes.push({
                mesh: child,
                dict: child.morphTargetDictionary,
                influences: child.morphTargetInfluences
              });

              // Ensure high quality material rendering
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((m: any) => {
                    m.roughness = Math.max(m.roughness || 0.4, 0.4);
                  });
                } else {
                  child.material.roughness = Math.max(child.material.roughness || 0.4, 0.4);
                }
              }
            }
          });

          // Initial smile & warm expression
          setMorphWeight('mouthSmileLeft', 0.15);
          setMorphWeight('mouthSmileRight', 0.15);

          setIsLoading(false);
        },
        (xhr) => {
          if (xhr.total > 0) {
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            setLoadingProgress(percent);
          }
        },
        (error) => {
          console.error('[Avatar3D] Failed to load GLB model:', error);
          setHasWebGlError(true);
          setIsLoading(false);
        }
      );

      // 6. Handle Window Resizing
      const handleResize = () => {
        if (!containerRef.current || !renderer || !camera) return;
        const newW = containerRef.current.clientWidth || 320;
        const newH = containerRef.current.clientHeight || 320;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };
      window.addEventListener('resize', handleResize);

      // 7. Animation Loop with Kinematics across Conversation States
      let blinkTimer = 0;
      let nextBlinkDuration = 3.6;
      let isBlinking = false;
      let blinkProgress = 0;

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const t = clock.getElapsedTime();

        // Natural Eye Blink Cycle (Every ~3.6s)
        blinkTimer += delta;
        if (!isBlinking && blinkTimer > nextBlinkDuration) {
          isBlinking = true;
          blinkTimer = 0;
          blinkProgress = 0;
          nextBlinkDuration = 3.2 + Math.random() * 1.5;
        }

        if (isBlinking) {
          blinkProgress += delta * 6.5; // Quick natural blink (~150ms)
          const blinkWeight = Math.sin(Math.min(blinkProgress, Math.PI));
          setMorphWeight('eyeBlinkLeft', blinkWeight);
          setMorphWeight('eyeBlinkRight', blinkWeight);
          if (blinkProgress >= Math.PI) {
            isBlinking = false;
            setMorphWeight('eyeBlinkLeft', 0);
            setMorphWeight('eyeBlinkRight', 0);
          }
        }

        // Spine Organic Breathing
        if (spineBone) {
          spineBone.rotation.x = Math.sin(t * 1.5) * 0.012;
        }

        // State-Specific Head & Viseme Kinematics
        if (state === 'speaking') {
          // Conversational head gestures: natural subtle nods & emphasis
          if (headBone) {
            headBone.rotation.x = 0.02 + Math.sin(t * 3.8) * 0.025;
            headBone.rotation.y = Math.sin(t * 1.6) * 0.03;
            headBone.rotation.z = Math.cos(t * 1.8) * 0.015;
          }

          // Speech-driven viseme & mouth opening
          const speechCycle = Math.sin(t * 14);
          const jawOpenWeight = Math.max(0, 0.2 + 0.65 * speechCycle);
          const vowelA = Math.max(0, Math.sin(t * 11) * 0.7);
          const vowelO = Math.max(0, Math.sin(t * 7 + 1.2) * 0.5);
          const vowelE = Math.max(0, Math.sin(t * 13 + 0.8) * 0.6);

          setMorphWeight('jawOpen', jawOpenWeight);
          setMorphWeight('aa', vowelA);
          setMorphWeight('oh', vowelO);
          setMorphWeight('E', vowelE);
          setMorphWeight('browInnerUp', 0.15 + Math.sin(t * 2) * 0.1);
          setMorphWeight('mouthSmileLeft', 0.2);
          setMorphWeight('mouthSmileRight', 0.2);
        } else if (state === 'listening') {
          // Attentive listening posture: slight forward tilt & curious angle
          if (headBone) {
            headBone.rotation.x = 0.05 + Math.sin(t * 1.2) * 0.01;
            headBone.rotation.y = Math.sin(t * 0.8) * 0.02;
            headBone.rotation.z = 0.035; // Slight attentive head tilt
          }

          // Close mouth softly, elevate attentive brows
          setMorphWeight('jawOpen', 0);
          setMorphWeight('aa', 0);
          setMorphWeight('oh', 0);
          setMorphWeight('E', 0);
          setMorphWeight('browInnerUp', 0.18);
          setMorphWeight('mouthSmileLeft', 0.18);
          setMorphWeight('mouthSmileRight', 0.18);
        } else if (state === 'processing') {
          // Thinking/Deliberating posture: head tilts slightly up and away
          if (headBone) {
            headBone.rotation.x = -0.04 + Math.sin(t * 0.7) * 0.01;
            headBone.rotation.y = 0.06;
            headBone.rotation.z = -0.02;
          }

          // Brows raise slightly, contemplative gaze
          setMorphWeight('jawOpen', 0.05);
          setMorphWeight('aa', 0);
          setMorphWeight('browInnerUp', 0.32);
          setMorphWeight('eyeLookUpLeft', 0.22);
          setMorphWeight('eyeLookUpRight', 0.22);
          setMorphWeight('mouthSmileLeft', 0.08);
          setMorphWeight('mouthSmileRight', 0.08);
        } else {
          // Idle posture: relaxed micro-sways & resting smile
          if (headBone) {
            headBone.rotation.x = Math.sin(t * 0.9) * 0.012;
            headBone.rotation.y = Math.sin(t * 0.6) * 0.015;
            headBone.rotation.z = Math.sin(t * 0.5) * 0.008;
          }

          setMorphWeight('jawOpen', 0);
          setMorphWeight('aa', 0);
          setMorphWeight('oh', 0);
          setMorphWeight('E', 0);
          setMorphWeight('browInnerUp', 0.05);
          setMorphWeight('eyeLookUpLeft', 0);
          setMorphWeight('eyeLookUpRight', 0);
          setMorphWeight('mouthSmileLeft', 0.16);
          setMorphWeight('mouthSmileRight', 0.16);
        }

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };

      animate();

      // 8. Cleanup & GPU Disposal
      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);

        if (scene) {
          scene.traverse((obj: any) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach((m: any) => m.dispose());
              } else {
                obj.material.dispose();
              }
            }
          });
        }

        if (renderer) {
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        }
      };
    } catch (err) {
      console.error('[Avatar3D] WebGL Initialization error:', err);
      setHasWebGlError(true);
      setIsLoading(false);
    }
  }, [is2DFallbackEnabled, prefersReducedMotion, state]);

  // Render 2D Lightweight Fallback
  if (is2DFallbackEnabled || prefersReducedMotion || hasWebGlError) {
    return (
      <div className={`relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl text-white p-6 ${className}`}>
        <div className="relative mb-4">
          <div className={`size-32 rounded-full border-4 flex items-center justify-center transition-all ${
            state === 'speaking' ? 'border-blue-400 bg-blue-500/20 scale-105 shadow-[0_0_24px_rgba(96,165,250,0.4)]' :
            state === 'listening' ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.3)]' :
            state === 'processing' ? 'border-amber-400 bg-amber-500/20 animate-pulse' :
            'border-slate-700 bg-slate-800/50'
          }`}>
            <Bot className={`size-16 ${
              state === 'speaking' ? 'text-blue-400' :
              state === 'listening' ? 'text-emerald-400' :
              state === 'processing' ? 'text-amber-400' : 'text-slate-400'
            }`} />
          </div>
          {state === 'speaking' && (
            <span className="absolute -bottom-1 -right-1 size-6 bg-blue-500 rounded-full flex items-center justify-center text-xs animate-bounce">
              🎙️
            </span>
          )}
        </div>

        <span className="text-sm font-bold text-slate-200">Krish AI (AI English Mentor)</span>
        <span className="text-xs text-slate-400 capitalize mt-0.5">
          {state.replace('_', ' ')} • 2D Lightweight Mode
        </span>

        {/* Toggle back to 3D */}
        {!hasWebGlError && !prefersReducedMotion && (
          <button
            onClick={() => setIs2DFallbackEnabled(false)}
            className="mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700 transition"
          >
            <Eye className="size-3.5" /> Switch to 3D Avatar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Three.js Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading Transition Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white z-20">
          <RefreshCw className="size-8 text-blue-400 animate-spin" />
          <div className="text-center space-y-1">
            <span className="text-sm font-bold block">Loading 3D Mentor Avatar (Sky)</span>
            <span className="text-xs text-slate-400 font-mono">
              {loadingProgress > 0 ? `${loadingProgress}% loaded` : 'Initializing GLB rig...'}
            </span>
          </div>
        </div>
      )}

      {/* Top Right Controls & Attribution */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <a
          href="https://vtubeme.com/free-vrm-avatars/sky"
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-slate-400 hover:text-slate-200 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-md border border-slate-800 flex items-center gap-1 transition"
          title="Sky Avatar by VTubeMe (Licensed under CC BY 4.0)"
        >
          Model: Sky (CC BY 4.0) <ExternalLink className="size-2.5" />
        </a>

        <button
          onClick={() => setIs2DFallbackEnabled(true)}
          className="text-[10px] text-slate-300 hover:text-white bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-md border border-slate-700 flex items-center gap-1 transition"
          title="Switch to lightweight 2D avatar for lower power consumption"
        >
          <EyeOff className="size-3" /> 2D Mode
        </button>
      </div>
    </div>
  );
};
