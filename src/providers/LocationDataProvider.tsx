import React, { useState, useEffect, ReactNode  } from 'react';
import { getLocationConfig } from './../api/fetchDb';
import { FeatureCollection, Point } from 'geojson';

type LocationDataProviderProps = {
    children: ReactNode;
  };

export const LocationDataProvider: React.FC<LocationDataProviderProps> = ({ children }) => {
  const [geoJSONData, setGeoJSONData] = useState<FeatureCollection<Point> | null>(null);

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

    // fetchData();
  }, []); // useEffectの第二引数に空の配列を渡すことで、このエフェクトはコンポーネントのマウント時にのみ実行されます

  // geoJSONDataがnullの場合、Loadingメッセージを表示するなどの処理を追加することもできます
  return (
    <div>
      {(geoJSONData == null) && (
        <div
          style={{position: "absolute"}}
        >
          Loading...
        </div>
      )}
      {children}
    </div>
  );
};

export default LocationDataProvider;
