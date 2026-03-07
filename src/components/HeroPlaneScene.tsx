import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import PlaneModel from "./PaperPlane";

/**
 * Full R3F scene for the hero section.
 * Contains the 3D plane model with elegant lighting and a contact shadow.
 */
export default function HeroPlaneScene() {
    return (
        <div className="w-full h-full min-h-[400px]">
            <Canvas
                camera={{ position: [6, 3, 6], fov: 35 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
                style={{ background: "transparent" }}
            >
                <Suspense fallback={null}>
                    {/* Ambient fill */}
                    <ambientLight intensity={0.6} />

                    {/* Key light — directional from upper‑right */}
                    <directionalLight
                        position={[5, 5, 5]}
                        intensity={1.2}
                        castShadow={false}
                        color="#ffffff"
                    />

                    {/* Rim light — back‑left for silhouette edge */}
                    <directionalLight
                        position={[-3, 2, -3]}
                        intensity={0.5}
                        color="#ffffff"
                    />

                    {/* The 3D plane — scaled to fit the scene */}
                    <PlaneModel scale={0.4} position={[0, 0, 0]} />

                    {/* Subtle floor shadow for depth */}
                    <ContactShadows
                        position={[0, -1.2, 0]}
                        opacity={0.15}
                        scale={10}
                        blur={2.5}
                        far={5}
                        color="#000000"
                    />

                    {/* Soft environment reflections */}
                    <Environment preset="city" />
                </Suspense>
            </Canvas>
        </div>
    );
}
