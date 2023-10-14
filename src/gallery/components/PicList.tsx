import { useEffect, useState } from "react";
import { getPicPaths } from "../../api/fetchAws";

interface PicListProps {
  updatePhotoCount: (count: number) => void;
}

function PicList({updatePhotoCount}: PicListProps) {
  const [picPaths, setPics] = useState<string[]>([]);

  useEffect(() => {
    getPicPaths().then(async (data: string[]) => {

      // 下記２行は表示テスト用。４枚のサンプルデータを40枚に増やした
      const multipliedData = data.flatMap((pic: string) => Array(10).fill(pic));
      setPics(multipliedData);
      // setPics(validData); // 本番コード

      updatePhotoCount(multipliedData.length);

      //updatePhotoCount(validData.length); // 本番コード
    })
  }, [updatePhotoCount]);

  const baseUrl = "https://we-are-what-we-do.s3.ap-northeast-1.amazonaws.com/";
  return (
    <div className="picListContainer">
      {picPaths.map((picPath, index) => (
        <img 
          key={index} 
          src={`${baseUrl}${picPath}`} 
          alt={`pic-${index}`}
          className="picListItem"/>
      ))}
    </div>
  );
}

export default PicList;
