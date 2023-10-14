import "./App.css";
import { useState } from "react";
import PicList from './components/PicList';
import DisplayInfo from "./components/DisplayInfo";


function App() {
  const [photoCount, setPhotCount] = useState<number>(0);

  return(
    <div className='canvas'>
      <PicList updatePhotoCount={setPhotCount} />
      <DisplayInfo 
        photoCount={photoCount}
      />
    </div>
  );
}
export default App;
