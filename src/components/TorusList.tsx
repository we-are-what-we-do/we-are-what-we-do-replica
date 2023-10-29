import { Sparkles } from "@react-three/drei";
import { useAppSelector } from "../redux/store";

function TorusList() {
  const torusList    = useAppSelector((state) => state.torusInfo.value);
  const animeIndex   = useAppSelector((state) => state.animeIndex.value);  
  const animeVisible = useAppSelector((state) => state.buttonState.value);


  return (
    <>
      {torusList.map((torus) => (
        <mesh
          key={torus.id}
          position={[torus.positionX, torus.positionY, 0]}
          rotation={[torus.rotateX, torus.rotateY, 0]}
          scale={torus.scale}
        >
          <torusGeometry args={[5.5, 1.5, 30, 50]} />
          <meshStandardMaterial color={torus.color} roughness={0.0} />
          { animeIndex == torus.id ? <Sparkles scale={8} size={5} visible={!animeVisible} /> : <></> }
        </mesh>
      ))}
    </>
  );
}
export default TorusList;