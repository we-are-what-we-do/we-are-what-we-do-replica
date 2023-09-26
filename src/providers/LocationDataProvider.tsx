import React, { useState, useEffect, ReactNode  } from 'react';
import { Points, getLocationConfig } from './../api/fetchDb';

type LocationDataProviderProps = {
    children: ReactNode;
  };

export const LocationDataProvider: React.FC<LocationDataProviderProps> = ({ children }) => {
  const [geoJSONData, setGeoJSONData] = useState<Points | null>(null);

  useEffect(() => {
    // データの取得とstateの更新
    const fetchData = async () => {
      try {
        const data = await getLocationConfig();
        setGeoJSONData(data);
      } catch (error) {
        console.error("Error fetching GeoJSON data:", error);
      }
    };

    fetchData();
  }, []); // useEffectの第二引数に空の配列を渡すことで、このエフェクトはコンポーネントのマウント時にのみ実行されます

  // geoJSONDataがnullの場合、Loadingメッセージを表示するなどの処理を追加することもできます
  if (!geoJSONData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* ここにchildrenや他のコンポーネントにgeoJSONDataを渡す処理を書く */}
      {children}
    </div>
  );
};

export default LocationDataProvider;
