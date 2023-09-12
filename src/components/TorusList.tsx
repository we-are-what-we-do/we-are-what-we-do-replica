import { useAppSelector } from "../redux/store";

  function Torus() {

    const torusInfo = useAppSelector((state) => state.torusInfo.value);

    return (
      <>
        {torusInfo.map((torus) => {
          return (
            <mesh
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