// アプリケーションサーバーのドメイン
// export const API_DOMAIN: string = "api.wawwd.net";
export const API_DOMAIN: string = "testApi.wawwd.net";

// アプリケーションサーバーのURL
export const API_URL: string = `https://${API_DOMAIN}/`;

// 仮で使うロケーションピンのID
// export const TEST_LOCATION_ID: string = "b7d8074d-746d-43d4-86d0-0d142fe157ef";
export const TEST_LOCATION_ID: string = "f8777292-0a66-4762-94cc-5243cd8bfb3e";

// アプリケーションサーバーのwebsocketのURL
export const WS_URL: string = `wss://${API_DOMAIN}/ws-rings?location=${TEST_LOCATION_ID}`;