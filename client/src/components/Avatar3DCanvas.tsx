import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Eye, EyeOff, User } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { AvatarLoadingIndicator } from './AvatarLoadingIndicator';
import { AvatarAnimationController, MorphTargetMesh } from '../services/avatarAnimationController';
import { speechEventBus } from '../services/speechEvents';
import { ConversationState } from '../types/engine';

interface Avatar3DCanvasProps {
  state: ConversationState;
  mentorGender?: 'female' | 'male';
  modelUrl?: string;
  className?: string;
  onFpsReport?: (fps: number) => void;
}

/**
 * High-Fidelity 3D Humanoid Mentor Avatar Canvas:
 * - Powered by AvatarAnimationController with real-time speech viseme coarticulation
 * - Word boundary synchronized lip movements across all 15 Oculus visemes and ARKit lip blendshapes
 * - Natural biological blinks (varying intervals), saccades, and eye contact
 * - Attentive listening nods, contemplative thinking tilts, and vocal rhythm cadence
 * - ACES Filmic tone mapping with 3-point studio lighting
 * - Dual Realistic Avatars: Sophia (Female) and Marcus (Male)
 */
export const Avatar3DCanvas: React.FC<Avatar3DCanvasProps> = ({
  state,
  mentorGender = 'female',
  modelUrl,
  className = '',
  onFpsReport
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [hasWebGlError, setHasWebGlError] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [is2DFallbackEnabled, setIs2DFallbackEnabled] = useState<boolean>(false);

  // Resolved 3D Model URL based on gender or explicit prop
  const resolvedModelUrl = modelUrl || (mentorGender === 'male' 
    ? '/models/realistic-male.glb' 
    : '/models/realistic-female.glb');

  // Keep a reference to current state so WebGL loop updates without reloading model
  const stateRef = useRef<ConversationState>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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

    setIsLoading(true);
    setLoadingProgress(0);

    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let clock = new THREE.Clock();

    // Model skeletal nodes references
    let headBone: THREE.Object3D | null = null;
    let neckBone: THREE.Object3D | null = null;
    let spineBone: THREE.Object3D | null = null;
    let leftArm: THREE.Object3D | null = null;
    let rightArm: THREE.Object3D | null = null;
    let morphMeshes: MorphTargetMesh[] = [];

    // Controller reference
    let controller: AvatarAnimationController | null = null;
    let unsubStart: (() => void) | null = null;
    let unsubEnd: (() => void) | null = null;
    let unsubWord: (() => void) | null = null;

    try {
      setIsLoading(true);
      setLoadingProgress(0);

      // 1. Scene setup
      scene = new THREE.Scene();

      // 2. Camera setup - Professional eye-level portrait framing (mid-chest to head, centered)
      const width = containerRef.current.clientWidth || 400;
      const height = containerRef.current.clientHeight || 400;
      const aspect = width / height;
      
      const initialFov = aspect < 1.0 ? 38 : aspect < 1.4 ? 34 : 30;
      const initialZ = aspect < 1.0 ? 1.30 : aspect < 1.4 ? 1.22 : 1.15;
      
      camera = new THREE.PerspectiveCamera(initialFov, aspect, 0.1, 50);
      camera.position.set(0, 1.48, initialZ);
      camera.lookAt(0, 1.45, 0);

      // 3. Renderer with antialiasing & ACES Filmic tone mapping
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      containerRef.current.appendChild(renderer.domElement);

      // 4. Cinematic Studio 3-Point Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambientLight);

      // Key Light: Warm soft front-right light
      const keyLight = new THREE.DirectionalLight(0xfffbf0, 1.9);
      keyLight.position.set(1.4, 2.4, 2.0);
      scene.add(keyLight);

      // Fill Light: Soft cool blue fill
      const fillLight = new THREE.DirectionalLight(0xe0e7ff, 1.2);
      fillLight.position.set(-1.4, 1.6, 1.6);
      scene.add(fillLight);

      // Rim / Accent Light: Crisp hair rim for dimensional depth
      const rimLight = new THREE.DirectionalLight(0xc4b5fd, 2.2);
      rimLight.position.set(0, 2.6, -1.8);
      scene.add(rimLight);

      // 5. Load GLB Realistic Avatar Model with Meshopt Compression
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      loader.load(
        resolvedModelUrl,
        (gltf) => {
          if (!scene) return;
          const model = gltf.scene;
          model.position.set(0, 0, 0);
          scene.add(model);

          // Locate all skeletal bones and morph targets
          model.traverse((child: any) => {
            if (child.isBone) {
              child.userData.bindQuaternion = child.quaternion.clone();

              const name = (child.name || '').toLowerCase();
              if (name === 'head' || name.endsWith('head')) headBone = child;
              if (name === 'neck' || name.endsWith('neck') || name.includes('bip01_neck')) neckBone = child;
              if (name === 'spine' || name.includes('spine') || name.includes('bip01_spine')) spineBone = child;
              if (name.includes('upperarm') && (name.includes('l_') || name.includes('left'))) leftArm = child;
              if (name.includes('upperarm') && (name.includes('r_') || name.includes('right'))) rightArm = child;
            }

            if (child.isMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
              morphMeshes.push({
                mesh: child,
                dict: child.morphTargetDictionary,
                influences: child.morphTargetInfluences
              });

              // Materials fine-tuning for natural skin & fabric response
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((m: any) => {
                    m.roughness = Math.max(m.roughness || 0.45, 0.45);
                  });
                } else {
                  child.material.roughness = Math.max(child.material.roughness || 0.45, 0.45);
                }
              }
            }
          });

          // Initialize centralized animation controller
          controller = new AvatarAnimationController(morphMeshes, {
            head: headBone,
            neck: neckBone,
            spine: spineBone,
            leftArm,
            rightArm
          });
          controller.setState(stateRef.current);

          // Wire speech events for real-time lip-sync
          unsubStart = speechEventBus.onStart(() => {
            controller?.onSpeechStart();
          });
          unsubEnd = speechEventBus.onEnd(() => {
            controller?.onSpeechEnd();
          });
          unsubWord = speechEventBus.onWordBoundary((word, duration) => {
            controller?.onSpeechWordBoundary(word, duration);
          });

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

      // 6. Handle Window Resizing with Adaptive Framing
      const handleResize = () => {
        if (!containerRef.current || !renderer || !camera) return;
        const newW = containerRef.current.clientWidth || 320;
        const newH = containerRef.current.clientHeight || 320;
        const newAspect = newW / newH;
        camera.aspect = newAspect;

        if (newAspect < 1.0) {
          camera.fov = 38;
          camera.position.set(0, 1.48, 1.30);
        } else if (newAspect < 1.4) {
          camera.fov = 34;
          camera.position.set(0, 1.48, 1.22);
        } else {
          camera.fov = 30;
          camera.position.set(0, 1.48, 1.15);
        }
        camera.lookAt(0, 1.45, 0);
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };
      window.addEventListener('resize', handleResize);

      // 7. Animation Loop with Organic Kinematics across Conversation States
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.05);
        const t = clock.getElapsedTime();
        const currentState = stateRef.current;

        if (controller) {
          controller.setState(currentState);
          controller.update(delta, t);
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

        if (unsubStart) unsubStart();
        if (unsubEnd) unsubEnd();
        if (unsubWord) unsubWord();
        if (controller) controller.dispose();

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
  }, [is2DFallbackEnabled, prefersReducedMotion, resolvedModelUrl]);

  // Render 2D Lightweight Fallback
  if (is2DFallbackEnabled || prefersReducedMotion || hasWebGlError) {
    const isMale = mentorGender === 'male';
    const mentorName = isMale ? 'Marcus' : 'Sophia';
    const accentColor = isMale ? 'border-blue-400 bg-blue-500/20' : 'border-violet-400 bg-violet-500/20';

    return (
      <div className={`relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl text-white p-6 ${className}`}>
        <div className="relative mb-4">
          <div className={`size-32 rounded-full border-4 flex items-center justify-center transition-all ${
            state === 'speaking' ? `${accentColor} scale-105 shadow-[0_0_24px_rgba(96,165,250,0.4)]` :
            state === 'listening' ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.3)]' :
            state === 'processing' ? 'border-amber-400 bg-amber-500/20 animate-pulse' :
            'border-slate-700 bg-slate-800/50'
          }`}>
            <User className={`size-16 ${
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

        <span className="text-sm font-bold text-slate-200">
          {mentorName} ({isMale ? 'Male Mentor' : 'Female Mentor'})
        </span>
        <span className="text-xs text-slate-400 capitalize mt-0.5">
          {state.replace('_', ' ')} • 2D Lightweight Mode
        </span>

        {/* Toggle back to 3D */}
        {!hasWebGlError && !prefersReducedMotion && (
          <button
            onClick={() => setIs2DFallbackEnabled(false)}
            className="mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700 transition cursor-pointer"
          >
            <Eye className="size-3.5" /> Switch to 3D Mentor
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading Transition Overlay with Clean Minimalist Indicator */}
      <AnimatePresence>
        {isLoading && (
          <AvatarLoadingIndicator
            mentorGender={mentorGender}
            progress={loadingProgress}
          />
        )}
      </AnimatePresence>

      {/* Subtle 2D Mode Toggle in bottom right */}
      <button
        onClick={() => setIs2DFallbackEnabled(true)}
        className="absolute bottom-3 right-3 z-10 text-[10px] text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-sm p-1.5 rounded-lg border border-slate-800 transition cursor-pointer"
        title="Switch to lightweight 2D avatar mode"
      >
        <EyeOff className="size-3.5" />
      </button>
    </div>
  );
};
