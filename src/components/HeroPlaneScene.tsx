import React, { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import PlaneModel from "./PaperPlane";

function PlaneContent() {
  const { camera, size } = useThree();
  const isMobile = size.width < 640;

  useEffect(() => {
    camera.position.set(isMobile ? 8 : 6, isMobile ? 3.2 : 3, isMobile ? 8 : 6);
    camera.fov = isMobile ? 45 : 35;
    camera.updateProjectionMatrix();
  }, [camera, isMobile]);

  return (
    <>
      <ambientLight intensity={0.6} />

      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        castShadow={false}
        color="#ffffff"
      />

      <directionalLight
        position={[-3, 2, -3]}
        intensity={0.5}
        color="#ffffff"
      />

      <PlaneModel scale={isMobile ? 0.3 : 0.4} position={isMobile ? [0, -0.15, 0] : [0, 0, 0]} />

      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.15}
        scale={10}
        blur={2.5}
        far={5}
        color="#000000"
      />

      <Environment preset="city" />
    </>
  );
}

export default function HeroPlaneScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [6, 3, 6], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <PlaneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
