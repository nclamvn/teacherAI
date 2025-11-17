import { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

// Animation mapping: avatarState -> animation clip name
// NOTE: Check actual clip names in your GLB file and update these mappings
const ANIMATION_MAP = {
  idle: 'Idle',           // Default relaxed pose
  listening: 'Listening', // Attentive, slightly leaning forward
  speaking: 'Talking',    // Speaking/explaining animation
  thinking: 'Thinking',   // Pondering pose
  celebrating: 'Cheer',   // Victory/celebration animation
};

export function TeacherAvatar({ avatarState, coachId = 'ivy', scale = 1 }) {
  const groupRef = useRef();
  const previousStateRef = useRef(avatarState);

  // Load the appropriate model based on coach
  const modelPath = coachId === 'leo' ? '/leo_teacher.glb' : '/ivy_teacher.glb';
  const { scene, animations } = useGLTF(modelPath);
  const { actions, mixer } = useAnimations(animations, scene);

  // Handle animation transitions based on avatar state
  useEffect(() => {
    if (!actions) return;

    // Get the target animation clip name
    const clipName = ANIMATION_MAP[avatarState] || ANIMATION_MAP.idle;
    const targetAction = actions[clipName];

    // Log available animations on first load (for debugging)
    if (process.env.NODE_ENV === 'development') {
      console.log('Available animations:', Object.keys(actions));
      console.log('Switching to:', clipName, 'for state:', avatarState);
    }

    // Smoothly transition to new animation
    Object.values(actions).forEach((action) => {
      if (action !== targetAction) {
        action.fadeOut(0.3);
      }
    });

    if (targetAction) {
      targetAction
        .reset()
        .fadeIn(0.3)
        .play();
    }

    return () => {
      // Cleanup: fade out current animation when component unmounts
      if (targetAction) {
        targetAction.fadeOut(0.2);
      }
    };
  }, [avatarState, actions]);

  // Dynamic animations for each state with smooth transitions
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const t = state.clock.getElapsedTime();
    const lerpFactor = Math.min(delta * 3, 1); // Smooth interpolation

    // Target values based on state
    let targetY = 0;
    let targetRotY = 0;
    let targetRotZ = 0;
    let targetRotX = 0;
    let targetScale = 1;

    switch (avatarState) {
      case 'idle':
        // Gentle floating + breathing
        targetY = Math.sin(t * 0.8) * 0.05;
        targetRotY = Math.sin(t * 0.3) * 0.02;
        targetRotX = Math.cos(t * 0.5) * 0.01;
        break;

      case 'listening':
        // Attentive lean forward + subtle rotation
        targetY = -0.05 + Math.sin(t * 2) * 0.03;
        targetRotY = Math.sin(t * 1.5) * 0.08;
        targetRotZ = Math.sin(t * 1.2) * 0.02;
        break;

      case 'speaking':
        // Bobbing motion like talking
        targetY = Math.sin(t * 4) * 0.04;
        targetRotZ = Math.sin(t * 3) * 0.03;
        targetScale = 1 + Math.sin(t * 6) * 0.01;
        break;

      case 'thinking':
        // Slow rotation + tilting
        targetY = Math.sin(t * 0.5) * 0.03;
        targetRotY = Math.sin(t * 0.6) * 0.15;
        targetRotZ = Math.cos(t * 0.4) * 0.05;
        break;

      case 'celebrating':
        // Jumping + spinning
        targetY = Math.abs(Math.sin(t * 5)) * 0.2;
        targetRotY = (t * 2) % (Math.PI * 2);
        targetScale = 1 + Math.sin(t * 4) * 0.05;
        break;

      default:
        // Neutral position
        targetY = 0;
        targetRotY = 0;
        targetRotZ = 0;
        targetRotX = 0;
        targetScale = 1;
    }

    // Smooth lerp to target values
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * lerpFactor;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * lerpFactor;
    groupRef.current.rotation.z += (targetRotZ - groupRef.current.rotation.z) * lerpFactor;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * lerpFactor;

    const currentScale = groupRef.current.scale.x;
    const newScale = currentScale + (targetScale - currentScale) * lerpFactor;
    groupRef.current.scale.setScalar(newScale);

    // Track state changes
    if (previousStateRef.current !== avatarState) {
      previousStateRef.current = avatarState;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0.2, 0]}
      scale={scale}
      dispose={null}
    >
      <primitive object={scene} />
    </group>
  );
}

// Preload both models for faster switching
useGLTF.preload('/ivy_teacher.glb');
useGLTF.preload('/leo_teacher.glb');
