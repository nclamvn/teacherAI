import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { TeacherAvatar } from './TeacherAvatar';
import './TeacherAvatarCanvas.css';

export function TeacherAvatarCanvas({ avatarState = 'idle', coachId = 'ivy' }) {
  return (
    <div className="teacher-avatar-3d-wrapper">
      <Canvas
        camera={{
          position: [0, 1.0, 2.5],
          fov: 40,
        }}
        dpr={[1, 2]} // Pixel ratio for retina displays
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting setup */}
          <ambientLight intensity={0.6} />

          {/* Main light - soft from front-top */}
          <directionalLight
            intensity={1.2}
            position={[2, 4, 3]}
            castShadow
          />

          {/* Fill light from side */}
          <directionalLight
            intensity={0.4}
            position={[-2, 2, 2]}
          />

          {/* Rim light for depth */}
          <directionalLight
            intensity={0.3}
            position={[0, 2, -3]}
          />

          {/* 3D Avatar */}
          <TeacherAvatar
            avatarState={avatarState}
            coachId={coachId}
            scale={1}
          />

          {/* Environment for realistic reflections and lighting */}
          <Environment preset="city" />

          {/* Camera controls - limited movement for stable framing */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2.2}
            minAzimuthAngle={-Math.PI / 6}
            maxAzimuthAngle={Math.PI / 6}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>

      {/* Loading overlay */}
      <div className="avatar-loading-overlay">
        <div className="avatar-loading-spinner"></div>
      </div>
    </div>
  );
}
