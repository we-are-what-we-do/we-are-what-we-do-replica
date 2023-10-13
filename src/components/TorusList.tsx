import { useAppSelector } from "../redux/store";

function TorusList() {
  const torusList = useAppSelector((state) => state.torusInfo.value);

  return (
    <>
      {torusList.map((torus) => (
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