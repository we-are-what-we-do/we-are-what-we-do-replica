import { useTexture } from "@react-three/drei";
import { useAppSelector } from "../redux/store";
import a from "../assets/images/a.jpg"; //波？
import b from "../assets/images/b.jpg"; //レンガ？
import c from "../assets/images/c.jpg"; //iphoneにありそうな画像？
import d from "../assets/images/d.jpg"; //三角形の画像？
import e from "../assets/images/e.jpg"; //フェンス？
import f from "../assets/images/f.jpg"; //？？？
import { Vector3 } from "three";
import { useFrame } from "react-three-fiber";

function TorusList() {

  const torusList = useAppSelector((state) => state.torusInfo.value);
  const [ t1, t2, t3, t4, t5, t6 ] = useTexture([a, b, c, d, e, f]); //textureのHooks複数指定

    //Torusのレスポンシブサイズ対応
    useFrame((state) => {
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
            <torusGeometry args={[5.5, 1.5, 8, 50]} />
            <meshBasicMaterial color={torus.color} map={t5} /> {/* ここの「t番号」を変更するとテクスチャー変更できます(1~6) */}
          </mesh>
        ))}
    </>
  );
}
export default TorusList;