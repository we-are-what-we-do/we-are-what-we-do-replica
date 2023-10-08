import { useAppSelector } from "../redux/store";
import { useThree } from "react-three-fiber";

function TorusList() {
  const torusList = useAppSelector((state) => state.torusInfo.value);

  useThree((state) => {
    const deviceWidth = window.innerWidth;
      if (deviceWidth >= 600 && deviceWidth <= 960) {
        state.camera.position.x = 0;
        state.camera.position.y = 0;
        state.camera.position.z = 10;
      } else if (deviceWidth >= 450 && deviceWidth <= 600) {
        state.camera.position.x = 0;
        state.camera.position.y = 0;
        state.camera.position.z = 15;
      } else if (deviceWidth <= 450) {
        state.camera.position.x = 0;
        state.camera.position.y = 0;
        state.camera.position.z = 20;
      } else {
        state.camera.position.x = 0;
        state.camera.position.y = 0;
        state.camera.position.z = 6;
      }
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
          <torusGeometry args={[5.5, 1.5, 8, 50]} />
          <meshStandardMaterial color={torus.color} roughness={0.0} />
        </mesh>
      ))}
    </>
  );
}
export default TorusList;