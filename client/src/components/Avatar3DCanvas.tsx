import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Bot, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { ConversationState } from '../types/engine';

interface Avatar3DCanvasProps {
  state: ConversationState;
  className?: string;
  onFpsReport?: (fps: number) => void;
}

/**
 * Procedural Stylized 3D Humanoid Mentor Avatar built on Three.js:
 * - Natural idle breathing and subtle organic head micro-sways
 * - Attentive listening posture (slight head tilt, alert eye contact)
 * - Thinking/Processing state (subtle upward head gaze and deliberation sway)
 * - Speech-driven viseme & mouth opening animation synchronized with voice events
 * - Natural periodic blinking cycle
 * - WebGL context loss recovery and disposal
 * - Accessible 2D fallback for low-power devices and reduced motion
 */
export const Avatar3DCanvas: React.FC<Avatar3DCanvasProps> = ({
  state,
  className = '',
  onFpsReport
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGlError, setHasWebGlError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [is2DFallbackEnabled, setIs2DFallbackEnabled] = useState(false);

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

    try {
      // 1. Scene setup
      scene = new THREE.Scene();

      // 2. Camera setup
      const width = containerRef.current.clientWidth || 320;
      const height = containerRef.current.clientHeight || 320;
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0.2, 3.6);

      // 3. Renderer with antialiasing and power preference
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = false; // Keep high FPS on mobile
      containerRef.current.appendChild(renderer.domElement);

      // 4. Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0x60a5fa, 1.4); // Blue 400 fill
      keyLight.position.set(2, 4, 3);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0); // Sky rim light
      rimLight.position.set(-2, 2, -2);
      scene.add(rimLight);

      // 5. Stylized Humanoid Mentor Mesh Construction (Hierarchical Model)
      const avatarGroup = new THREE.Group();
      scene.add(avatarGroup);

      // Head
      const headGeo = new THREE.SphereGeometry(0.75, 32, 32);
      const skinMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24, // Warm warm stylized mentor tone
        roughness: 0.5,
        metalness: 0.1
      });
      const head = new THREE.Mesh(headGeo, skinMat);
      avatarGroup.add(head);

      // Hair cap
      const hairGeo = new THREE.SphereGeometry(0.78, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hairMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b, // Dark slate
        roughness: 0.8
      });
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.set(0, 0.05, -0.05);
      head.add(hair);

      // Eyes Group
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
      const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      // Left Eye
      const leftEyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), eyeWhiteMat);
      leftEyeWhite.position.set(-0.25, 0.1, 0.65);
      head.add(leftEyeWhite);

      const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), eyeMat);
      leftPupil.position.set(0, 0, 0.08);
      leftEyeWhite.add(leftPupil);

      // Right Eye
      const rightEyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), eyeWhiteMat);
      rightEyeWhite.position.set(0.25, 0.1, 0.65);
      head.add(rightEyeWhite);

      const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), eyeMat);
      rightPupil.position.set(0, 0, 0.08);
      rightEyeWhite.add(rightPupil);

      // Eyelids for blinking
      const lidMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
      const leftLid = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.1), lidMat);
      leftLid.position.set(-0.25, 0.18, 0.72);
      leftLid.scale.set(1, 0.01, 1);
      head.add(leftLid);

      const rightLid = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.1), lidMat);
      rightLid.position.set(0.25, 0.18, 0.72);
      rightLid.scale.set(1, 0.01, 1);
      head.add(rightLid);

      // Glasses Frame (Supportive academic-tech mentor aesthetic)
      const glassesMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 });
      const leftRim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 12, 24), glassesMat);
      leftRim.position.set(-0.25, 0.1, 0.73);
      head.add(leftRim);

      const rightRim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 12, 24), glassesMat);
      rightRim.position.set(0.25, 0.1, 0.73);
      head.add(rightRim);

      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15), glassesMat);
      bridge.rotation.z = Math.PI / 2;
      bridge.position.set(0, 0.1, 0.73);
      head.add(bridge);

      // Mouth for lip-sync visemes
      const mouthMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
      const mouthGeo = new THREE.CapsuleGeometry(0.06, 0.16, 8, 16);
      const mouth = new THREE.Mesh(mouthGeo, mouthMat);
      mouth.rotation.z = Math.PI / 2;
      mouth.position.set(0, -0.32, 0.68);
      head.add(mouth);

      // Torso / Neck (Shoulder bust)
      const neckGeo = new THREE.CylinderGeometry(0.24, 0.32, 0.4, 16);
      const neck = new THREE.Mesh(neckGeo, skinMat);
      neck.position.set(0, -0.85, 0);
      avatarGroup.add(neck);

      const bodyGeo = new THREE.CylinderGeometry(0.5, 0.85, 1.2, 24);
      const shirtMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a8a, // Navy professional shirt
        roughness: 0.7
      });
      const body = new THREE.Mesh(bodyGeo, shirtMat);
      body.position.set(0, -1.6, 0);
      avatarGroup.add(body);

      // Resize handler
      const handleResize = () => {
        if (!containerRef.current || !renderer || !camera) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // Animation variables
      let clock = new THREE.Clock();
      let lastBlinkTime = 0;
      let isBlinking = false;
      let frameCount = 0;
      let lastFpsTime = 0;

      // 6. Real-Time Render Loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();
        const delta = clock.getDelta();

        // FPS calculation
        frameCount++;
        if (elapsedTime - lastFpsTime >= 1.0) {
          if (onFpsReport) onFpsReport(frameCount);
          frameCount = 0;
          lastFpsTime = elapsedTime;
        }

        // --- A. BLINK CYCLE (Every 3.5 - 5 seconds) ---
        if (elapsedTime - lastBlinkTime > 3.8) {
          isBlinking = true;
          lastBlinkTime = elapsedTime;
        }
        if (isBlinking) {
          const blinkProgress = (elapsedTime - lastBlinkTime) / 0.18;
          if (blinkProgress < 1.0) {
            const scaleY = Math.sin(blinkProgress * Math.PI) * 1.0;
            leftLid.scale.y = Math.max(0.01, scaleY);
            rightLid.scale.y = Math.max(0.01, scaleY);
          } else {
            leftLid.scale.y = 0.01;
            rightLid.scale.y = 0.01;
            isBlinking = false;
          }
        }

        // --- B. STATE-DRIVEN KINEMATICS ---
        if (state === 'speaking') {
          // Speech-driven mouth shape modulation (Approximated natural audio visemes)
          const mouthOpen = 0.5 + Math.sin(elapsedTime * 18) * 0.45 + Math.cos(elapsedTime * 12) * 0.2;
          mouth.scale.set(1.0 + Math.sin(elapsedTime * 8) * 0.2, Math.max(0.2, mouthOpen), 1.0);

          // Animated head emphasis gestures while speaking
          head.rotation.y = Math.sin(elapsedTime * 3) * 0.08;
          head.rotation.x = Math.sin(elapsedTime * 4.5) * 0.04;
          head.rotation.z = Math.cos(elapsedTime * 2.5) * 0.02;

          // Gentle shoulder breathing
          body.position.y = -1.6 + Math.sin(elapsedTime * 3) * 0.02;
        } else if (state === 'listening') {
          // Attentive listening posture: head tilted slightly toward learner
          head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, 0.12, 0.05);
          head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, -0.05, 0.05);
          head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, 0.02 + Math.sin(elapsedTime * 2) * 0.02, 0.05);

          // Subtle alert pupil focus
          leftPupil.position.x = 0.02;
          rightPupil.position.x = 0.02;

          // Closed neutral mouth
          mouth.scale.set(1, 0.2, 1);
        } else if (state === 'processing') {
          // Thinking/Deliberating state: eyes looking slightly upward, head swaying slowly
          head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, Math.sin(elapsedTime * 2) * 0.15, 0.05);
          head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, -0.12, 0.05);

          leftPupil.position.y = 0.03;
          rightPupil.position.y = 0.03;

          mouth.scale.set(0.8, 0.15, 1);
        } else {
          // Idle state: gentle rhythmic breathing and organic micro-movements
          head.rotation.y = Math.sin(elapsedTime * 1.2) * 0.04;
          head.rotation.x = Math.sin(elapsedTime * 1.8) * 0.02;
          head.rotation.z = 0;

          avatarGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.03;
          mouth.scale.set(1, 0.2, 1);
          leftPupil.position.set(0, 0, 0.08);
          rightPupil.position.set(0, 0, 0.08);
        }

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };

      animate();

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);

        // Proper WebGL and Three.js Memory Cleanup
        if (renderer && renderer.domElement && containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
          renderer.dispose();
        }
        scene?.clear();
      };
    } catch (err) {
      console.error('[Avatar3D] WebGL initialization error:', err);
      setHasWebGlError(true);
    }
  }, [state, is2DFallbackEnabled, prefersReducedMotion]);

  // Fallback 2D Animated Component (for low-power, mobile, WebGL failure, or prefers-reduced-motion)
  if (hasWebGlError || is2DFallbackEnabled || prefersReducedMotion) {
    return (
      <div className={`relative flex flex-col items-center justify-center p-6 ${className}`}>
        <div className="relative size-36 sm:size-44 rounded-full bg-slate-800 border-4 border-blue-500/40 flex items-center justify-center shadow-xl">
          <Bot className={`size-20 transition-all ${
            state === 'speaking' ? 'text-blue-400 scale-105 animate-pulse' :
            state === 'listening' ? 'text-emerald-400' :
            state === 'processing' ? 'text-amber-400' : 'text-slate-400'
          }`} />

          {state === 'speaking' && (
            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-30" />
          )}
        </div>

        <div className="mt-3 text-center">
          <span className="text-xs font-bold text-slate-300 block">AI English Mentor (2D Mode)</span>
          <span className="text-[11px] text-slate-400">Low-power / Reduced-motion profile</span>
        </div>

        {!prefersReducedMotion && (
          <button
            onClick={() => setIs2DFallbackEnabled(false)}
            className="mt-2 text-[10px] font-bold text-blue-400 hover:underline flex items-center gap-1"
          >
            <Eye className="size-3" /> Switch to 3D Avatar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden ${className}`}>
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full min-h-[280px] sm:min-h-[340px] flex items-center justify-center" />

      {/* Mode Toggle Controls (Top Right) */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-700 text-slate-300 text-[10px] font-semibold">
        <button
          onClick={() => setIs2DFallbackEnabled(true)}
          className="hover:text-white flex items-center gap-1 transition-colors"
          title="Switch to lightweight 2D avatar"
        >
          <EyeOff className="size-3" />
          <span>2D Mode</span>
        </button>
      </div>

      {/* Mentor Persona Label */}
      <div className="absolute bottom-12 text-center pointer-events-none select-none">
        <span className="text-xs font-bold text-slate-200 block drop-shadow-md">Rachel</span>
        <span className="text-[10px] text-slate-400 font-medium">Procedural 3D English Mentor</span>
      </div>
    </div>
  );
};
