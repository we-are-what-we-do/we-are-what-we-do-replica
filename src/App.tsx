import "./App.css";
import { OrbitControls, Text } from "@react-three/drei";
import { Canvas } from '@react-three/fiber';
import { useDispatch } from "react-redux";
import { AppDispatch } from "./redux/store";
import { pushTorusInfo, resetHandle } from "./redux/features/torusInfo-slice";
import { v4 as uuidv4 } from 'uuid';
import { RingPosition, positionArray } from "./torusPosition";
import TorusList from './components/TorusList';

function App() {
  let rX: number;//回転x軸
  let rY: number;//回転y軸
  let torusScale: number;//torusの大きさ

  let shufflePosition: RingPosition[];//シャッフル後の全てのリングpositionを格納
  let randomPosition: RingPosition | undefined; //配列から取り出したリング

  let num = 0;

  const dispatch = useDispatch<AppDispatch>();

  //配列の中をシャッフルする
  function shuffleArray(sourceArray: RingPosition[]) {
    const array = sourceArray.concat();
    const arrayLength = array.length;

    for (let i = arrayLength - 1; i >= 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
  }
  shufflePosition = shuffleArray(positionArray);


  const addTorus = () => { 
    const color = 0xffffff * Math.random();
    torusScale = 0.08;
    randomPosition = shufflePosition.pop();
    
    if (num % 2 == 0) {                   //偶数の時の角度
      rX = Math.floor(Math.random());
      rY = Math.floor(Math.random());
    } else {                              //奇数の時の角度
      rX = Math.floor(Math.random() * 2); 
      rY = Math.floor(Math.random() * 5);
    }

    //配列内シャッフルして最後から取り出していく
    if (num == 71) {
      dispatch(resetHandle());
      shufflePosition = shuffleArray(positionArray);
      randomPosition = shufflePosition.pop();
      num = 0;
    }

    //リング情報をオブジェクトに詰め込みstoreへ送る
    dispatch(pushTorusInfo(
      {
        id: uuidv4(),
        color: color,
        rotateX: rX,
        rotateY: rY,
        positionX: randomPosition?.positionX,
        positionY: randomPosition?.positionY,
        scale: torusScale, 
      }
    ));
    num++;
  };

  return(
    <div id='canvas'>
      <Canvas camera={{ position: [0,0,10] }}>
          <TorusList />
          <axesHelper scale={10}/>
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