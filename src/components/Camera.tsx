import React, { useEffect, useRef, useState } from 'react';

const Camera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraAccessible, setIsCameraAccessible] = useState<boolean | null>(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        console.log("カメラのアクセスに成功");
        window.alert("カメラのアクセスに成功");
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
    <div>
      <video ref={videoRef} autoPlay playsInline width="100%"></video>

      {isCameraAccessible === true && <p>カメラの許可が成功しました</p>}
      {isCameraAccessible === false && <p>アプリを使用するにはカメラの許可が必要です</p>}

    </div>
  );
};

export default Camera2;
