import "./App.css";
import { OrbitControls, Text } from "@react-three/drei";
import { Canvas } from '@react-three/fiber';
import TorusList from './components/TorusList';
import { useDispatch } from "react-redux";
import { AppDispatch } from "./redux/store";
import { initHandle, pushTorusInfo } from "./redux/features/torusInfo-slice";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  let pX  = 0;    //横の位置
  let pY  = 3;    //縦の位置
  let rX: number; //Xのrotate
  let rY: number; //Yのrotate
  let torusScale = 0.08; //torusの大きさ
  let num = 1;

  const addTorus = () => { 
    const color = 0xffffff * Math.random();

    if (num % 2 == 0) {                   //偶数
      rX = Math.floor(Math.random());
      rY = Math.floor(Math.random());
    } else {                              //奇数
      rX = Math.floor(Math.random() * 2); 
      rY = Math.floor(Math.random() * 5);
    }    

    //Dの文字
    if (num <= 10) {
      pX = -7;   
      pY -= 0.6; 
    } else if (num == 11) {  
      pX += 0.5; 
      pY += 5.5;
    } else if (num >= 12 && num <= 15) {
      pX += 0.5;
    } else if (num >= 16 && num <= 20) {
      pX += 0.3;
      pY -= 0.4;
    } else if (num >= 21 && num <= 22) {
      pY -= 0.6;
    } else if (num >= 23 && num <= 28) {
      pX -= 0.2;
      pY -= 0.4;
    } else if (num >= 29 && num <= 33) {
      pX -= 0.5;

    //Eの文字
    } else if (num == 34) { 
      pX = 0;
      pY = 2.4;
    } else if (num <= 43) {
      pX = 0;
      pY -= 0.6;
    } else if (num == 44) {
      pX = 0.5;
      pY = 2.4;
    } else if (num >= 45 && num <= 49) {
      pX += 0.5;
      pY = 2.4; 
    } else if (num == 50) {
      pX = 0.5;
      pY = -0.4;
    } else if (num >= 51 && num <= 55) {
      pX += 0.5;
      pY = -0.4;
    } else if (num == 56) {
      pX = 0.5;
      pY = -3.4;
    } else if (num >= 57 && num <= 61) {
      pX += 0.5;
      pY = -3.2;

    //Iの文字
    } else if (num == 62) {
      pX = 7;
      pY = 2.5;
    } else if (num >= 63 && num <= 71) {
      pX = 7;
      pY -= 0.65;
    } else {
      dispatch(initHandle());
      num = 1;
      pX = -7;   
      pY = 2.4; 
    }
    num++;

    dispatch(pushTorusInfo(
      {
        id: num,
        color: color,
        rotateX: rX,
        rotateY: rY,
        positionX: pX,
        positionY: pY,
        scale: torusScale, 
      }
    ));
  };

  return(
    <div id='canvas'>
      <Canvas camera={{ position: [0,0,10] }}>
          <TorusList />
          <axesHelper scale={10}/>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          <OrbitControls/>
          <Text position={[0, 5, 0]} >
            React Three Fiber
          </Text>
      </Canvas>
      <button onClick={addTorus}>追加</button>
    </div>
  );
}
export default App;