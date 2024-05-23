import { Sparkles } from "@react-three/drei";
import { useAppSelector } from "../redux/store";
import { RingContext } from "../providers/RingProvider";
import { useContext } from "react";

const TRANSPARENCY: number = 0.5; // 半透明リングの透明度

function TorusList({isTakingPhoto}: {isTakingPhoto: React.MutableRefObject<boolean>}) {
  const isTrialPage: boolean = false;
  const hasPostRing: boolean = false;

  const torusList = useAppSelector((state) => state.torusInfo.value);

  const {
    addedTorus
  } = useContext(RingContext);

  // リングの透明度を取得する関数
  function getTransparency(torusId: string): number{
    if(hasPostRing){
      // リング送信後は、不透明
      return 1;
    }else if(isTakingPhoto.current){
      // 撮影確認中は、不透明
      return 1;
    }else if(torusId === addedTorus?.torus.id){
      // 追加したリングなら、透明
      return TRANSPARENCY;
    }else{
      // 追加したリング以外は、不透明
      return 1;
    }
  }

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
          <meshStandardMaterial
            color={isTrialPage ? "rgb(255, 255, 255)" : torus.color}
            roughness={0.0}
            transparent={true}
            opacity={getTransparency(torus.id)}
          />
          {((torus.id === addedTorus?.torus.id)) && (
            <Sparkles scale={8} size={5} visible={!isTakingPhoto.current} opacity={(hasPostRing) ? 1 : TRANSPARENCY} />
          )}
        </mesh>
      ))}
    </>
  );
}
export default TorusList;
