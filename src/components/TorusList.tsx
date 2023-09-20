import { useRef } from "react";
import { useAppSelector } from "../redux/store";
import { Mesh } from "three";

  function Torus() {
    const torusInfo = useAppSelector((state) => state.torusInfo.value);//格納されたリング情報リスト
    const ref = useRef<Mesh>(null!);

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
              <meshBasicMaterial color={torus.color} wireframe />
            </mesh>
          )
        })}
      </>
    );
  }
  export default Torus;