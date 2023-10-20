import { Vector3 } from "three";
import { useFrame } from "react-three-fiber";
import { useAppSelector } from "../redux/store";

function TorusList() {
  const torusList = useAppSelector((state) => state.torusInfo);

  useFrame((state) => {
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
        {torusList.value.map((torus) => (
          <mesh
            key={torus.id}
            position={[torus.positionX, torus.positionY, 0]}
            rotation={[torus.rotateX, torus.rotateY, 0]}
            scale={torus.scale}
          >
            <torusGeometry args={[5.5, 1.5, 40, 50]} />
            <meshStandardMaterial color={torus.color} roughness={0.0} />
          </mesh>
        ))}
    </>
  );
}
export default TorusList;