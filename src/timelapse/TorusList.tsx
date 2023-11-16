import { Vector3 } from "three";
import { useFrame } from "react-three-fiber";
import { RingData } from "../types";
import { TorusInfo } from "../redux/features/torusInfo-slice";
import { useEffect, useState } from "react";
import { convertToTori } from "../handleRingData";

export default function TorusList({rings, enableMovingTorus}: {rings: RingData[], enableMovingTorus: boolean}){
  const [torusList, setTorusList] = useState<TorusInfo[]>([]);

  // リングデータをthree.jsで扱えるデータに変換する
  useEffect(() => {
    const newToriData: TorusInfo[] = convertToTori(rings);
    setTorusList(newToriData);
  }, [rings]);

  // リングのアニメーションを実行する
  useFrame((state) => {
    if(!enableMovingTorus) return;

    const elapsedTime = state.clock.getElapsedTime();
    const deviceWidth = window.innerWidth;

    if (deviceWidth >= 600 && deviceWidth <= 960) {
      state.camera.position.x = Math.cos(elapsedTime * 0.1) * 10;
      state.camera.position.y = 0;
      state.camera.position.z = Math.sin(elapsedTime * 0.1) * 10;
    } else if (deviceWidth >= 450 && deviceWidth <= 600) {
      state.camera.position.x = Math.cos(elapsedTime * 0.1) * 15;
      state.camera.position.y = 0;
      state.camera.position.z = Math.sin(elapsedTime * 0.1) * 15;
    } else if (deviceWidth <= 450) {
      state.camera.position.x = Math.cos(elapsedTime * 0.1) * 20;
      state.camera.position.y = 0;
      state.camera.position.z = Math.sin(elapsedTime * 0.1) * 20;
    } else {
      state.camera.position.x = Math.cos(elapsedTime * 0.1) * 8;
      state.camera.position.y = 0;
      state.camera.position.z = Math.sin(elapsedTime * 0.1) * 8;
    }
    state.camera.lookAt(new Vector3(0, 0, 0));
  });

  return (
    <>
        {torusList.map((torus) => (
          <mesh
            key={torus.id}
            position={[torus.positionX, torus.positionY, 0]}
            rotation={[torus.rotateX, torus.rotateY, 0]}
            scale={torus.scale}
          >
            <torusGeometry args={[5.5, 1.5, 10, 28]} />
            <meshStandardMaterial color={torus.color} roughness={0.0} />
          </mesh>
        ))}
    </>
  );
}