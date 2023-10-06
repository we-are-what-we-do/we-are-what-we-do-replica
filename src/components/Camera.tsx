import React, { useEffect, useState } from 'react';

function Camera({videoRef}: {videoRef: React.RefObject<HTMLVideoElement>}){
  const [isCameraAccessible, setIsCameraAccessible] = useState<boolean | null>(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        console.log("カメラのアクセスに成功");
        // window.alert("カメラのアクセスに成功");
        setIsCameraAccessible(true);
      } catch (error) {
        console.error("カメラのアクセスに失敗:", error);
        window.alert("アプリを使用するにはカメラの許可が必要です");
        setIsCameraAccessible(false);
      }
    };

    initCamera();
  }, []);

  return (
    <>
      <video ref={videoRef} autoPlay playsInline></video>

      <div className='camera-success-message'>
      {isCameraAccessible === true && <p>カメラの許可が成功しました</p>}
      {isCameraAccessible === false && <p>アプリを使用するにはカメラの許可が必要です</p>}
      </div>
    </>
  );
};

export default Camera;
