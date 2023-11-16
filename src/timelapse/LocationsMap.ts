import image0 from "@/assets/images/locations/愛媛大.jpg";
import image1 from "@/assets/images/locations/県庁.jpg";
import image2 from "@/assets/images/locations/愛媛新聞社.jpg";
import image3 from "@/assets/images/locations/ミウラート・ヴィレッジ.jpg";
import image4 from "@/assets/images/locations/朝日ヶ丘.jpg";
import image5 from "@/assets/images/locations/えひめこどもの城.jpg";
import image6 from "@/assets/images/locations/タオル美術館.jpg";
import image7 from "@/assets/images/locations/ニンジニア.jpg";
import image8 from "@/assets/images/locations/大王製紙.jpg";
import image9 from "@/assets/images/locations/科博.jpg";
import image10 from "@/assets/images/locations/デジタルウィブ.jpg";
import image11 from "@/assets/images/locations/里山.jpg";
import image12 from "@/assets/images/locations/タオル美術館.jpg";
import image13 from "@/assets/images/locations/歴博.jpg";
import image14 from "@/assets/images/locations/大洲.jpg";


// タイムラプスページの背景画像のパス
const LOCATIONS_IMAGE_PATH: {
    id: string;
    path: string;
}[] = [
    {
        id: "61fff126-6ba0-4e57-b6ef-54d7e50174e6",
        path: image0 // 愛媛大学
    },
    {
        id: "b00b60fd-aa93-4703-8dcf-ac62f878da43",
        path: image1 // 愛媛県庁
    },
    {
        id: "eaab1a9c-e357-40bd-a776-87975116220d",
        path: image2 // 愛媛新聞社
    },
    {
        id: "dad69b95-0ba5-41fd-94be-71dc26f48312",
        path: image3 // ミウラート・ヴィレッジ（三浦工業株式会社）
    },
    {
        id: "ea7af5fe-879c-4754-8054-5c91c2adfd9b",
        path: image4 // 朝日ヶ丘高等学園
    },
    {
        id: "069b88bf-5e57-465b-a244-789b41394b09",
        path: image5 // えひめこどもの城
    },
    {
        id: "11dea4ce-da40-4d94-994e-9d06946e3f5d",
        path: image6 // 愛媛県美術館
    },
    {
        id: "1bec5da8-ca03-4c49-97a3-d26cca18fcac",
        path: image7 // ニンジニアスタジアム
    },
    {
        id: "1a9eed6d-d45c-4e30-9a36-2ac893a89ddb",
        path: image8 // 大王製紙
    },
    {
        id: "28ab5bc5-0e07-4218-88b9-252a59dff356",
        path: image9 // 愛媛県科学総合博物館
    },
    {
        id: "112500f9-f6b3-44ad-b18d-4757bb9131c6",
        path: image10 // ニューウェイブ
    },
    {
        id: "fcf83712-c147-42eb-a6b2-6f43b902003e",
        path: image11 // 今治里山スタジアム
    },
    {
        id: "343a1dce-67fc-455c-bfad-5a852342c44c",
        path: image12 // タオル美術館
    },
    {
        id: "22f1ca40-af9e-460d-8d57-4a9ce1c04627",
        path: image13 // 愛媛県歴史文化博物館
    },
    {
        id: "7149929f-bbef-49c6-b03b-ec6e02116932",
        path: image14 // おおず浪漫祭
    }
];

// ロケーション画像を取得する関数
export function getLocationsImagePath(locationId: string): string{
    const data = LOCATIONS_IMAGE_PATH.find(value => (value.id === locationId));
    if(!data) throw new Error("ロケーションIDに対応する画像が見つかりません");
    const result: string = data.path;
    return result;
}