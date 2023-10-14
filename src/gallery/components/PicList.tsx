import { useEffect, useState } from "react";
import { getPicPaths } from "../../api/fetchDb";

interface PicListProps {
  updatePhotoCount: (count: number) => void;
}

function PicList({updatePhotoCount}: PicListProps) {
  const [picPaths, setPics] = useState<string[]>([]);

  useEffect(() => {
    getPicPaths().then(async (data) => {
      
      // テキストファイルから不適切な画像のリストを読み込む
      const NgPaths: string[] = await fetchNgPaths();

      // 不適切な画像を排除する
      const validData = data.filter(path => {
        return !NgPaths.some(ngPath => path.includes(ngPath));
      });

      // 下記２行は表示テスト用。４枚のサンプルデータを40枚に増やした
      const multipliedData = validData.flatMap(pic => Array(10).fill(pic));
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

// テキストファイルを読み込む関数
async function fetchNgPaths(): Promise<string[]> {
  const response = await fetch("../assets/ngPaths.txt");
  if(!response.ok){
      return [];
  }
  
  const text = await response.text();
  // テキストファイルの各行を配列として取得
  return text.split('\n').map(line => line.trim()).filter(line => line);
}
export default PicList;
