// ファビコンをランダムに変更する関数
export function setRandomFavicon(root: string){
    const faviconElm: HTMLLinkElement | null = document.getElementById("favicon") as HTMLLinkElement;
    if(!faviconElm) return;
    const faviconPathList: string[] = [
        "assets/images/favicon/wawwd_favicon1.png",
        "assets/images/favicon/wawwd_favicon2.png",
        "assets/images/favicon/wawwd_favicon3.png",
        "assets/images/favicon/wawwd_favicon4.png",
        "assets/images/favicon/wawwd_favicon5.png",
        "assets/images/favicon/wawwd_favicon6.png",
        "assets/images/favicon/wawwd_favicon7.png",
        "assets/images/favicon/wawwd_favicon8.png",
        "assets/images/favicon/wawwd_favicon9.png"
    ];
    const faviconPath: string = root + faviconPathList[Math.floor(Math.random()*faviconPathList.length)];
    faviconElm.href = faviconPath;
}