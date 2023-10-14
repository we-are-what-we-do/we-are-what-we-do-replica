const awsApiDomain: string = "https://ajl8yofz6j.execute-api.ap-northeast-1.amazonaws.com/";

async function makeGetRequestForAws(apiEndpoint: string, queryParams?: string): Promise<Response>{
    try {
        const response = await fetch(awsApiDomain + apiEndpoint + (queryParams ?? ''));
        if(response.ok){
            return response;
        }else{
            // エラーレスポンスの場合はエラーハンドリングを行う
            throw new Error(`HTTPエラー: ${response.status}`);
        }
    }catch(error){
        // エラーハンドリング
        console.error('リクエストエラー:', error);
        throw error;
    }
}

// ギャラリー向け画像パス群を取得する関数(最新画像を先頭にする)
export async function getPicPaths(): Promise<string[]>{
    
    // サーバーからデータを取得する
    const apiEndpoint: string = "test/gallery"; // 仮エンドポイント
    const response: Response = await makeGetRequestForAws(apiEndpoint);

    if(!response.ok){
        throw new Error("Server response was not ok");
    }

    const result:any = await response.json();
    const parsedBody:any = typeof result.body === "string" ? JSON.parse(result.body) : result.body;
    if (parsedBody && Array.isArray(parsedBody.file_paths) && parsedBody.file_paths.every((item: any) => typeof item === 'string')) {
        
        // 古い写真から順番に格納されているのが前提。逆順にすることで、最新画像を先頭にする
        const reversedPaths = [...parsedBody.file_paths].reverse();
        
        return reversedPaths;
    } else {
        throw new Error("Unexpected data structure");
    }    
}
