// Geolocation.tsx
import React, { useState } from 'react';

interface PositionState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
}

const Geolocation: React.FC = () => {
  const [position, setPosition] = useState<PositionState>({
    latitude: null,
    longitude: null,
    error: null
  });

  const [showPermissionDialog, setShowPermissionDialog] = useState(true);
  const [showPermissionDenied, setShowPermissionDenied] = useState(false);

  const handlePermission = (isGranted: boolean) => {
    if (isGranted) {
      if (!navigator.geolocation) {
        setPosition(prev => ({ ...prev, error: 'Geolocation is not supported by your browser' }));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null
          });
        },
        (error) => {
          setPosition(prev => ({ ...prev, error: error.message }));
        }
      );
      setShowPermissionDialog(false);
    } else {
      setShowPermissionDenied(true);

      // 3秒後にダイアログを消す
      setTimeout(() => {
        setShowPermissionDenied(false);
        setShowPermissionDialog(false);
      }, 3000);
    }
  };

  return (
    <div>
      {showPermissionDialog ? (
        <div>
          <p>GPSの取得を許可しますか？</p>
          <button onClick={() => handlePermission(true)}>許可する</button>
          <button onClick={() => handlePermission(false)}>許可しない</button>
        </div>
      ) : showPermissionDenied ? (
        <div>
          <p>リングを追加するには、GPSの許可が必要です</p>
          console.log("リングを追加するには、GPSの許可が必要です");
        </div>
      ) : position.error ? (
        <div>
          <p>システムエラー</p>
          <p>Error: {position.error}</p>
        </div>
      ) : position.latitude && position.longitude ? (
        <>
          <p>現在地</p>
          <p>Latitude: {position.latitude}</p>
          <p>Longitude: {position.longitude}</p>
        </>
      ) : null}
    </div>
  );
};

export default Geolocation;
