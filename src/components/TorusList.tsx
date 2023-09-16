import { useRef } from "react";
import { useAppSelector } from "../redux/store";
import { Mesh } from "three";
// import { useFrame } from "react-three-fiber";

  function Torus() {

    const torusInfo = useAppSelector((state) => state.torusInfo.value);

    const ref = useRef<Mesh>(null!);

    // useFrame(() => (ref.current.rotation.x += 0.05));

    return (
      <>
        {torusInfo.map((torus) => {
          return (
            <mesh
             ref={ref}
             key={torus.id} 
             position={[torus.positionX, torus.positionY, 0]} 
             rotation={[torus.rotateX, torus.rotateY, 0]} 
             scale={torus.scale}
             >
              <torusGeometry args={[5, 1.5, 8, 50]} />
              <meshBasicMaterial color={torus.color} />
            </mesh>
          )
        })}
      </>
    );
  }
  export default Torus;