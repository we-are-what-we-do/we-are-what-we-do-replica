import { useContext } from 'react';
import { CameraContext } from '../providers/CameraProvider';

function Camera(){
  const {
    videoRef,
    cameraFacing
  } = useContext(CameraContext);

  return (
    <>
      <video ref={videoRef} autoPlay playsInline></video>

      <div className='camera-success-message'>
        {cameraFacing ? (
          <p>カメラの許可が成功しました</p>
        ) : (
          <p>アプリを使用するにはカメラの許可が必要です</p>
        )}
      </div>
    </>
  );
};

export default Camera;
