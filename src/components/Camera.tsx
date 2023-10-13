import { useContext } from 'react';
import { CameraContext } from '../providers/CameraProvider';

function Camera(){
  const {
    videoRef
  } = useContext(CameraContext);

  return (
    <video id="video" ref={videoRef} autoPlay playsInline />
  );
};

export default Camera;
