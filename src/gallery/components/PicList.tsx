import { useEffect, useState } from "react";
import { getPicPaths } from "../../api/fetchDb";


function PicList() {
  const [picPaths, setPics] = useState<string[]>([]);

  useEffect(() => {
    getPicPaths().then((data) => {
      
      // 下記２行は表示テスト用。４枚のサンプルデータを40枚に増やした
      const multipliedData = data.flatMap(pic => Array(10).fill(pic));
      setPics(multipliedData);
      // setPics(data);
    })
  }, []);

  const baseUrl = "https://we-are-what-we-do.s3.ap-northeast-1.amazonaws.com/";
  console.log(picPaths);
  return (
    <div style={{ overflow: 'auto' }}>
      {picPaths.map((picPath, index) => (
        <img 
          key={index} 
          src={`${baseUrl}${picPath}`} 
          alt={`pic-${index}`}
          style={{ maxWidth: '400px', height: 'auto' }}/>
      ))}
    </div>
  );
}
export default PicList;
